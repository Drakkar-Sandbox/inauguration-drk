import { inject } from "@adonisjs/core";
import redis from "@adonisjs/redis/services/main";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";

import eventConfig from "#config/event";
import PlusOneChangeLimitException from "#features/inauguration/invitation/exceptions/plus_one_change_limit.exception";
import PlusOneDeadlinePassedException from "#features/inauguration/invitation/exceptions/plus_one_deadline_passed.exception";
import PlusOneNotAllowedException from "#features/inauguration/invitation/exceptions/plus_one_not_allowed.exception";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import { LeifBrain, type SignupUnderstanding } from "#features/inauguration/leif/brain/leif_brain";
import { isBlockedOutput } from "#features/inauguration/leif/brain/output_filter";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import LeifQuotaService from "#features/inauguration/leif/services/leif_quota.service";
import Conversation, { type ConversationTranscriptEntry } from "#models/conversation";
import type Guest from "#models/guest";
import EventService from "#services/event.service";

export const SIGNUP_STEPS = [
	"consent",
	"rsvp",
	"plus_one",
	"plus_one_details",
	"plus_one_confirm",
	"practical_info",
	"farewell",
] as const;
export type SignupStep = (typeof SIGNUP_STEPS)[number];

export type SignupChoice = { value: string; label: string };

export type SignupInput = {
	text?: string | null;
	choice?: string | null;
	plusOne?: { firstName: string; lastName: string; email: string } | null;
};

export type SignupTurn = {
	/** Displayed reply (may contain names/emails typed by the guest). */
	text: string;
	/** What may be voiced (TTS): scripted or filtered text only, never guest-typed values. */
	spoken: string;
	step: SignupStep;
	choices: SignupChoice[];
	/** Structured input the client can show instead of free text. */
	form: "plus_one" | null;
	done: boolean;
	guest: Guest;
};

type PendingPlusOne = { firstName: string | null; lastName: string | null; email: string | null };

type SignupState = {
	step: SignupStep;
	plusOneHandled: boolean;
	practicalShown: boolean;
	infoDone: boolean;
	pendingPlusOne: PendingPlusOne | null;
	transcript: ConversationTranscriptEntry[];
	/** `spoken` of the last turn: the only text a guest may send to TTS. */
	lastSpoken: string | null;
};

/** A reply fragment: displayed text and its voiced version (null = not voiced). */
type Line = { text: string; spoken: string | null };

const say = (text: string, spoken: string | null = text): Line => ({ text, spoken });

type Resolved = {
	action: string;
	understanding?: SignupUnderstanding;
	details?: Partial<PendingPlusOne>;
};

const MAX_TURNS_PER_DAY = 100;
const STATE_TTL_SECONDS = 60 * 60 * 24;
const MAX_TRANSCRIPT_ENTRIES = 200;
const MAX_SPOKEN_ANSWER_LENGTH = 300;
const LLM_HISTORY_ENTRIES = 8;

const emailValidator = vine.create({ email: vine.string().email().maxLength(254) });

/**
 * Leif's guided signup dialogue. The server-side state machine is the source of truth:
 * the brain only interprets free text, and every action (consent, RSVP, plus-one) goes
 * through `InvitationService` after validation and, for the plus-one, an explicit
 * confirmation. Turns are kept in Redis and only copied to `conversations` once the
 * guest has consented.
 */
@inject()
export default class SignupConversationService {
	constructor(
		protected invitationService: InvitationService,
		protected eventService: EventService,
		protected lines: LeifLinesService,
		protected brain: LeifBrain,
		protected quota: LeifQuotaService,
	) {}

	async handle(token: string, input: SignupInput): Promise<SignupTurn> {
		let guest = await this.invitationService.findByToken(token);
		await this.quota.consume("signup", String(guest.id), MAX_TURNS_PER_DAY);

		const isStart = !input.text && !input.choice && !input.plusOne;
		const lines: Line[] = [];
		const previous = await this.#load(guest);
		const state: SignupState = isStart || !previous ? this.#freshState(previous) : previous;

		if (isStart || !previous) {
			state.step = this.#nextStep(guest, state);
		}

		let reprompt = true;
		if (isStart) {
			const returning =
				previous !== null || guest.consentGivenAt !== null || guest.consentRefusedAt !== null;
			lines.push(
				say(
					this.lines.signupWelcome(guest, returning),
					this.lines.signupWelcome(guest, returning, true),
				),
			);
		} else {
			const previousStep = state.step;
			this.#record(state, "guest", this.#describeInput(guest, state, input));
			const outcome = await this.#advance(guest, state, input);
			guest = outcome.guest;
			lines.push(...outcome.lines);
			reprompt = outcome.reprompt && !(previousStep === "farewell" && state.step === "farewell");
		}

		if (reprompt) lines.push(say(this.#prompt(guest, state), this.#prompt(guest, state, true)));
		if (state.step === "practical_info") state.practicalShown = true;

		const text = lines.map((line) => line.text).join(" ");
		const spoken = lines
			.map((line) => line.spoken)
			.filter((line): line is string => Boolean(line))
			.join(" ");
		state.lastSpoken = spoken;
		this.#record(state, "avatar", text);
		await this.#save(guest, state);
		await this.#persist(guest, state);

		return {
			text,
			spoken,
			step: state.step,
			choices: this.#choices(guest, state),
			form: state.step === "plus_one_details" ? "plus_one" : null,
			done: state.step === "farewell",
			guest,
		};
	}

	/**
	 * Whether `text` is exactly the voiced part of the guest's last turn (guards public TTS).
	 */
	async canVoice(guest: Guest, text: string) {
		const state = await this.#load(guest);

		return Boolean(state?.lastSpoken && state.lastSpoken === text.trim());
	}

	async #advance(
		guest: Guest,
		state: SignupState,
		input: SignupInput,
	): Promise<{ guest: Guest; lines: Line[]; reprompt: boolean }> {
		const resolved = await this.#resolve(guest, state, input);
		const lines: Line[] = [];
		// LLM-phrased answers are shown only if they pass the content filters, and voiced
		// only if they are short as well.
		const answer = this.#safeAnswer(resolved.understanding?.answer ?? null);
		const next = (updated: Guest) => {
			state.step = this.#nextStep(updated, state);
			return { guest: updated, lines, reprompt: true };
		};

		switch (resolved.action) {
			case "consent_yes":
			case "consent_no": {
				const given = resolved.action === "consent_yes";
				const updated = await this.invitationService.consent(guest, given);
				// Nothing said before a refusal may ever be persisted, even after a later consent.
				if (!given) state.transcript = [];
				lines.push(say(given ? this.lines.consentGiven() : this.lines.consentRefused()));
				return next(updated);
			}
			case "confirm": {
				const updated = await this.invitationService.respond(guest, "confirmed");
				lines.push(say(this.lines.rsvpConfirmed()));
				return next(updated);
			}
			case "decline": {
				return next(await this.invitationService.respond(guest, "declined"));
			}
			case "plus_one_add": {
				state.pendingPlusOne = { firstName: null, lastName: null, email: null };
				state.step = "plus_one_details";
				return { guest, lines, reprompt: true };
			}
			case "plus_one_keep": {
				state.plusOneHandled = true;
				return next(guest);
			}
			case "plus_one_none":
			case "plus_one_remove": {
				state.plusOneHandled = true;
				state.pendingPlusOne = null;
				if (!guest.plusOne) return next(guest);

				const updated = await this.#managePlusOne(guest, lines, () =>
					this.invitationService.deletePlusOne(guest),
				);
				if (!updated.plusOne) lines.push(say(this.lines.plusOneRemoved()));
				return next(updated);
			}
			case "plus_one_details":
				return this.#collectPlusOne(guest, state, resolved.details ?? {});
			case "plus_one_edit": {
				state.pendingPlusOne = { firstName: null, lastName: null, email: null };
				state.step = "plus_one_details";
				return { guest, lines, reprompt: true };
			}
			case "plus_one_confirm": {
				const pending = state.pendingPlusOne;
				state.pendingPlusOne = null;
				state.plusOneHandled = true;
				if (!pending?.firstName || !pending.lastName || !pending.email) return next(guest);

				const payload = {
					firstName: pending.firstName,
					lastName: pending.lastName,
					email: pending.email,
				};
				const updated = await this.#managePlusOne(guest, lines, () =>
					this.invitationService.upsertPlusOne(guest, payload),
				);
				if (updated.plusOne && lines.length === 0) {
					lines.push(
						say(this.lines.plusOneSaved(payload.firstName), this.lines.plusOneSavedSpoken()),
					);
				}
				return next(updated);
			}
			case "done": {
				state.infoDone = true;
				state.step = "farewell";
				return { guest, lines, reprompt: true };
			}
			case "faq": {
				const index = resolved.understanding?.faqIndex ?? null;
				const scripted = index !== null ? this.lines.faqAnswer(index) : null;
				lines.push(answer ?? say(scripted ?? this.lines.notUnderstood()));
				return { guest, lines, reprompt: true };
			}
			case "off_topic":
				lines.push(answer ?? say(this.lines.offTopic()));
				return { guest, lines, reprompt: true };
			default: {
				if (resolved.action.startsWith("faq:")) {
					const faqAnswer = this.lines.faqAnswer(Number(resolved.action.slice(4)));
					lines.push(say(faqAnswer ?? this.lines.notUnderstood()));
					return { guest, lines, reprompt: true };
				}

				lines.push(answer ?? say(this.lines.notUnderstood()));
				return { guest, lines, reprompt: true };
			}
		}
	}

	/**
	 * Turns a button, a form or free text into an action allowed at the current step.
	 */
	async #resolve(guest: Guest, state: SignupState, input: SignupInput): Promise<Resolved> {
		const step = state.step;
		const collectingPlusOne = step === "plus_one_details" || step === "plus_one_confirm";

		if (input.choice) {
			const allowed = this.#choices(guest, state).some((choice) => choice.value === input.choice);
			return { action: allowed ? input.choice : "unknown" };
		}

		if (input.plusOne) {
			return collectingPlusOne || step === "plus_one"
				? { action: "plus_one_details", details: input.plusOne }
				: { action: "unknown" };
		}

		const understanding = await this.brain.understandSignup({
			event: eventConfig,
			guestFirstName: guest.firstName,
			question: this.#prompt(guest, state),
			history: state.transcript.slice(-LLM_HISTORY_ENTRIES - 1, -1),
			text: input.text ?? "",
		});
		const hasPlusOne = Boolean(guest.plusOne);
		const declined = guest.status === "declined";

		const byStep: Partial<Record<SignupStep, Partial<Record<string, string>>>> = {
			consent: { yes: "consent_yes", no: "consent_no" },
			rsvp: {
				yes: "confirm",
				no: "decline",
				confirm_attendance: "confirm",
				decline_attendance: "decline",
			},
			plus_one: { yes: "plus_one_add", no: hasPlusOne ? "plus_one_keep" : "plus_one_none" },
			plus_one_details: { no: "plus_one_none" },
			plus_one_confirm: { yes: "plus_one_confirm", no: "plus_one_edit" },
			practical_info: { no: "done", goodbye: "done" },
			farewell: declined ? { confirm_attendance: "confirm" } : {},
		};

		if (understanding.intent === "plus_one_details" && (collectingPlusOne || step === "plus_one")) {
			return {
				action: "plus_one_details",
				understanding,
				details: {
					firstName: understanding.firstName,
					lastName: understanding.lastName,
					email: understanding.email,
				},
			};
		}
		if (understanding.intent === "faq" || understanding.intent === "off_topic") {
			return { action: understanding.intent, understanding };
		}

		return { action: byStep[step]?.[understanding.intent] ?? "other", understanding };
	}

	async #collectPlusOne(guest: Guest, state: SignupState, details: Partial<PendingPlusOne>) {
		const lines: Line[] = [];
		const pending: PendingPlusOne = {
			firstName: details.firstName?.trim() || state.pendingPlusOne?.firstName || null,
			lastName: details.lastName?.trim() || state.pendingPlusOne?.lastName || null,
			email: details.email?.trim().toLowerCase() || state.pendingPlusOne?.email || null,
		};

		if (pending.email) {
			const [error] = await emailValidator.tryValidate({ email: pending.email });
			if (error) {
				pending.email = null;
				state.pendingPlusOne = pending;
				state.step = "plus_one_details";
				lines.push(say(this.lines.plusOneInvalidEmail()));
				return { guest, lines, reprompt: false };
			}
		}

		state.pendingPlusOne = pending;
		const missing = [
			pending.firstName ? null : "son prénom",
			pending.lastName ? null : "son nom",
			pending.email ? null : "son adresse email",
		].filter((value): value is string => value !== null);

		if (missing.length > 0) {
			state.step = "plus_one_details";
			lines.push(say(this.lines.plusOneMissing(missing)));
			return { guest, lines, reprompt: false };
		}

		state.step = "plus_one_confirm";
		return { guest, lines, reprompt: true };
	}

	/**
	 * Plus-one changes can be refused by the invitation rules (deadline, guest status).
	 */
	async #managePlusOne(guest: Guest, lines: Line[], action: () => Promise<Guest>) {
		try {
			return await action();
		} catch (error) {
			if (
				error instanceof PlusOneDeadlinePassedException ||
				error instanceof PlusOneNotAllowedException
			) {
				lines.push(say(this.lines.plusOneClosed()));
				return guest;
			}
			if (error instanceof PlusOneChangeLimitException) {
				lines.push(say(this.lines.plusOneLimit()));
				return guest;
			}
			throw error;
		}
	}

	#nextStep(guest: Guest, state: SignupState): SignupStep {
		const afterInfo = state.infoDone ? "farewell" : "practical_info";

		// A plus-one has no conversational journey before day J: practical info only.
		if (guest.kind === "plus_one") return afterInfo;
		if (!guest.consentGivenAt && !guest.consentRefusedAt) return "consent";
		if (guest.status === "invited") return "rsvp";
		if (guest.status === "declined") return "farewell";
		if (!state.plusOneHandled && this.eventService.isPlusOneEditable()) return "plus_one";

		return afterInfo;
	}

	#prompt(guest: Guest, state: SignupState, voiced = false) {
		switch (state.step) {
			case "consent":
				return this.lines.consentQuestion();
			case "rsvp":
				return this.lines.rsvpQuestion();
			case "plus_one":
				return this.lines.plusOneQuestion(guest, voiced);
			case "plus_one_details":
				return this.lines.plusOneDetailsQuestion();
			case "plus_one_confirm": {
				if (voiced) return this.lines.plusOneConfirmSpoken();
				const pending = state.pendingPlusOne;
				return this.lines.plusOneConfirmQuestion({
					firstName: pending?.firstName ?? "",
					lastName: pending?.lastName ?? "",
					email: pending?.email ?? "",
				});
			}
			case "practical_info":
				return state.practicalShown ? this.lines.anotherQuestion() : this.lines.practicalInfo();
			case "farewell":
				return this.lines.farewell(guest, voiced);
		}
	}

	/**
	 * Quick-reply buttons: every closed question can be answered without typing.
	 */
	#choices(guest: Guest, state: SignupState): SignupChoice[] {
		const faq = eventConfig.faq.map((entry, index) => ({
			value: `faq:${index}`,
			label: entry.question,
		}));

		switch (state.step) {
			case "consent":
				return [
					{ value: "consent_yes", label: "J'accepte" },
					{ value: "consent_no", label: "Je préfère que non" },
				];
			case "rsvp":
				return [
					{ value: "confirm", label: "Je serai présent" },
					{ value: "decline", label: "Je ne pourrai pas venir" },
				];
			case "plus_one":
				return guest.plusOne
					? [
							{ value: "plus_one_keep", label: "C'est parfait" },
							{ value: "plus_one_add", label: "Changer d'accompagnant" },
							{ value: "plus_one_remove", label: "Je viendrai seul" },
						]
					: [
							{ value: "plus_one_add", label: "Oui, j'ajoute un accompagnant" },
							{ value: "plus_one_none", label: "Non, je viendrai seul" },
						];
			case "plus_one_details":
				return [{ value: "plus_one_none", label: "Finalement, je viendrai seul" }];
			case "plus_one_confirm":
				return [
					{ value: "plus_one_confirm", label: "C'est exact" },
					{ value: "plus_one_edit", label: "Corriger" },
				];
			case "practical_info":
				return [...faq, { value: "done", label: "Tout est clair, merci" }];
			case "farewell":
				return guest.status === "declined"
					? [{ value: "confirm", label: "Finalement, je serai présent" }]
					: faq;
		}
	}

	/**
	 * Filters an LLM-phrased answer: dropped when it talks money, voiced only when short.
	 */
	#safeAnswer(answer: string | null): Line | null {
		if (!answer || isBlockedOutput(answer)) return null;

		return say(answer, answer.length <= MAX_SPOKEN_ANSWER_LENGTH ? answer : null);
	}

	#describeInput(guest: Guest, state: SignupState, input: SignupInput) {
		if (input.text) return input.text;
		if (input.plusOne) {
			return `${input.plusOne.firstName} ${input.plusOne.lastName}, ${input.plusOne.email}`;
		}

		const choice = this.#choices(guest, state).find((entry) => entry.value === input.choice);
		return choice?.label ?? String(input.choice);
	}

	#record(state: SignupState, role: ConversationTranscriptEntry["role"], text: string) {
		state.transcript.push({ role, text, at: new Date().toISOString() });
		state.transcript = state.transcript.slice(-MAX_TRANSCRIPT_ENTRIES);
	}

	#freshState(previous: SignupState | null): SignupState {
		return {
			step: "consent",
			plusOneHandled: false,
			practicalShown: false,
			infoDone: false,
			pendingPlusOne: null,
			transcript: previous?.transcript ?? [],
			lastSpoken: null,
		};
	}

	#key(guest: Guest) {
		return `inauguration:leif:signup:${guest.id}`;
	}

	async #load(guest: Guest): Promise<SignupState | null> {
		const raw = await redis.get(this.#key(guest));

		return raw ? (JSON.parse(raw) as SignupState) : null;
	}

	async #save(guest: Guest, state: SignupState) {
		await redis.set(this.#key(guest), JSON.stringify(state), "EX", STATE_TTL_SECONDS);
	}

	/**
	 * Copies the transcript to the guest's signup conversation, only with consent.
	 */
	async #persist(guest: Guest, state: SignupState) {
		if (!guest.consentGivenAt) return;

		const conversation = await Conversation.query()
			.where("guest_id", guest.id)
			.where("channel", "signup")
			.orderBy("id", "desc")
			.first();
		const endedAt = state.step === "farewell" ? DateTime.now() : null;

		if (conversation) {
			await conversation.merge({ transcript: state.transcript, endedAt }).save();
			return;
		}

		await Conversation.create({
			guestId: guest.id,
			channel: "signup",
			startedAt: DateTime.fromISO(state.transcript[0]?.at ?? new Date().toISOString()),
			endedAt,
			transcript: state.transcript,
			summary: null,
		});
	}
}
