import { randomUUID } from "node:crypto";

import { inject } from "@adonisjs/core";
import logger from "@adonisjs/core/services/logger";
import redis from "@adonisjs/redis/services/main";
import { DateTime } from "luxon";

import eventConfig from "#config/event";
import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import CheckinService from "#features/inauguration/kiosk/checkin/services/checkin.service";
import { type KioskContext, LeifBrain } from "#features/inauguration/leif/brain/leif_brain";
import LeifSessionNotFoundException from "#features/inauguration/leif/exceptions/leif_session_not_found.exception";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import LeifQuotaService from "#features/inauguration/leif/services/leif_quota.service";
import LeifSpeechService from "#features/inauguration/leif/voice/services/leif_speech.service";
import Conversation, { type ConversationTranscriptEntry } from "#models/conversation";
import Guest from "#models/guest";
import Handoff from "#models/handoff";

export type KioskSession = {
	id: string;
	guestId: number;
	startedAt: string;
	transcript: ConversationTranscriptEntry[];
	handoffId: number | null;
};

export type KioskTurn = {
	session: KioskSession;
	guest: Guest;
	text: string;
	offerHandoff: boolean;
};

const SESSION_TTL_SECONDS = 60 * 60 * 2;
const MAX_TURNS_PER_SESSION = 30;

/**
 * "Défiez Leif" kiosk sessions. The live session (transcript included) only lives in
 * Redis; at the end it is stored in `conversations` with a summary if the guest
 * consented, or as an empty ended marker (kiosk visit count) otherwise.
 */
@inject()
export default class KioskLeifService {
	constructor(
		protected checkinService: CheckinService,
		protected lines: LeifLinesService,
		protected brain: LeifBrain,
		protected quota: LeifQuotaService,
		protected speechService: LeifSpeechService,
	) {}

	/**
	 * Reception screen welcome. Uses the pre-generated audio when available.
	 */
	async greeting(tokenInput: string) {
		const guest = await this.#findGuest({ token: this.checkinService.extractToken(tokenInput) });
		const text = this.lines.receptionGreeting(guest);

		let speech = null;
		try {
			speech = (await this.speechService.speak(text)).speech;
		} catch {
			logger.warn("Leif greeting audio unavailable, falling back to text only");
		}

		return { guest, text, speech };
	}

	async start(tokenInput: string): Promise<KioskTurn> {
		const guest = await this.#findGuest({ token: this.checkinService.extractToken(tokenInput) });
		const text = this.lines.kioskWelcome(guest, guest.consentGivenAt !== null);
		const session: KioskSession = {
			id: randomUUID(),
			guestId: guest.id,
			startedAt: new Date().toISOString(),
			transcript: [],
			handoffId: null,
		};

		this.#record(session, "avatar", text);
		await this.#save(session);

		return { session, guest, text, offerHandoff: false };
	}

	async message(sessionId: string, text: string): Promise<KioskTurn> {
		const session = await this.#load(sessionId);
		await this.quota.consume("kiosk", session.id, MAX_TURNS_PER_SESSION);
		const guest = await this.#findGuest({ id: session.guestId });

		this.#record(session, "guest", text);
		const reply = await this.brain.kioskReply(this.#context(guest, session));
		this.#record(session, "avatar", reply.text);
		await this.#save(session);

		return { session, guest, text: reply.text, offerHandoff: reply.offerHandoff };
	}

	/**
	 * The guest asked to meet their referent. Idempotent within a session.
	 */
	async handoff(sessionId: string): Promise<KioskTurn & { handoff: Handoff }> {
		const session = await this.#load(sessionId);
		const guest = await this.#findGuest({ id: session.guestId });

		const text = this.lines.kioskHandoffDone(this.#referentFirstName(guest));
		let handoff = session.handoffId ? await Handoff.find(session.handoffId) : null;
		if (!handoff) {
			handoff = await Handoff.create({
				guestId: guest.id,
				conversationId: null,
				referentUserId: guest.referentUserId,
				reason: this.#handoffReason(guest, session),
				status: "pending",
			});
			session.handoffId = handoff.id;
			this.#record(session, "avatar", text);
			await this.#save(session);
		}

		return { session, guest, text, offerHandoff: false, handoff };
	}

	async end(sessionId: string) {
		const session = await this.#load(sessionId);
		const guest = await this.#findGuest({ id: session.guestId });
		const consent = guest.consentGivenAt !== null;

		const summary = consent ? await this.brain.summarizeKiosk(this.#context(guest, session)) : null;
		const conversation = await Conversation.create({
			guestId: guest.id,
			channel: "kiosk",
			startedAt: DateTime.fromISO(session.startedAt),
			endedAt: DateTime.now(),
			transcript: consent ? session.transcript : null,
			summary,
		});

		if (session.handoffId) {
			await Handoff.query()
				.where("id", session.handoffId)
				.update({ conversationId: conversation.id });
		}
		await redis.del(this.#key(session.id));

		return { stored: consent, handoffRequested: session.handoffId !== null };
	}

	/**
	 * Without consent, the handoff only says that the guest asked to talk.
	 */
	#handoffReason(guest: Guest, session: KioskSession) {
		const base = `Demande de mise en relation à la borne « Défiez ${eventConfig.avatarName} ».`;
		if (!guest.consentGivenAt) return base;

		const lastGuestMessage = session.transcript.findLast((entry) => entry.role === "guest");
		return lastGuestMessage
			? `${base} Dernier propos : « ${lastGuestMessage.text.slice(0, 280)} »`
			: base;
	}

	#context(guest: Guest, session: KioskSession): KioskContext {
		return {
			event: eventConfig,
			guest: { firstName: guest.firstName, company: guest.company },
			angleTopic: guest.angleTopic,
			angleNotes: guest.angleNotes,
			referentFirstName: this.#referentFirstName(guest),
			handoffRequested: session.handoffId !== null,
			transcript: [...session.transcript],
		};
	}

	#referentFirstName(guest: Guest) {
		return guest.referent?.name.trim().split(/\s+/)[0] || null;
	}

	async #findGuest(where: { token: string } | { id: number }) {
		const query = Guest.query().preload("referent").preload("host");
		const guest =
			"token" in where
				? await query.where("token", where.token).first()
				: await query.where("id", where.id).first();
		if (!guest) throw new GuestNotFoundException();

		return guest;
	}

	#record(session: KioskSession, role: ConversationTranscriptEntry["role"], text: string) {
		session.transcript.push({ role, text, at: new Date().toISOString() });
	}

	#key(sessionId: string) {
		return `inauguration:leif:kiosk:${sessionId}`;
	}

	async #load(sessionId: string): Promise<KioskSession> {
		const raw = await redis.get(this.#key(sessionId));
		if (!raw) throw new LeifSessionNotFoundException();

		return JSON.parse(raw) as KioskSession;
	}

	async #save(session: KioskSession) {
		await redis.set(this.#key(session.id), JSON.stringify(session), "EX", SESSION_TTL_SECONDS);
	}
}
