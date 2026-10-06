import {
	type KioskContext,
	type KioskReply,
	LeifBrain,
	type SignupUnderstandInput,
	type SignupUnderstanding,
} from "#features/inauguration/leif/brain/leif_brain";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import type { ConversationSummary } from "#models/conversation";

const EMAIL_PATTERN = /[^\s@<>()[\],;:"]+@[^\s@<>()[\],;:"]+\.[a-z]{2,}/i;

// Words around a name in "je viens avec Ada Lovelace, son email est …".
const STOP_WORDS =
	/^(je|j|viens|viendrai|avec|mon|ma|invitée?|accompagnante?|il|elle|s|appelle|sera|voici|c|est|et|son|sa|email|e-mail|mail|adresse|de|du|la|le|l)$/i;

const normalize = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.replace(/[’']/g, " ")
		.replace(/\s+/g, " ")
		.trim();

const words = (text: string) => normalize(text).match(/[a-z]{3,}/g) ?? [];

const capitalize = (word: string) =>
	word.replace(/(^|[-\s])(\p{L})/gu, (_, sep: string, char: string) => sep + char.toUpperCase());

/**
 * Deterministic keyword understanding, used when no LLM key is configured and as the
 * fallback when the LLM call fails. Closed questions are answered by buttons in that
 * mode, so free text only needs a best effort.
 */
export default class ScriptedLeifBrain extends LeifBrain {
	readonly mode = "scripted" as const;

	constructor(protected lines: LeifLinesService) {
		super();
	}

	async understandSignup(input: SignupUnderstandInput): Promise<SignupUnderstanding> {
		const base = { firstName: null, lastName: null, email: null, faqIndex: null, answer: null };
		const text = normalize(input.text);

		const email = input.text.match(EMAIL_PATTERN)?.[0] ?? null;
		if (email) {
			const names = input.text
				.replace(email, " ")
				.match(/\p{L}[\p{L}'-]*/gu)
				?.filter((word) => !STOP_WORDS.test(word));
			return {
				...base,
				intent: "plus_one_details",
				email,
				firstName: names?.[0] ? capitalize(names[0]) : null,
				lastName: names && names.length > 1 ? capitalize(names.slice(1).join(" ")) : null,
			};
		}

		if (/(ne (pourrai|pourrais|viendrai|serai) pas|pas venir|empeche|decline)/.test(text)) {
			return { ...base, intent: "decline_attendance" };
		}
		if (
			/^(oui|ouais|yes|ok|okay|d accord|volontiers|bien sur|avec plaisir|j accepte|exact|parfait|absolument|tout a fait|c est (ca|exact|bon|parfait))\b/.test(
				text,
			)
		) {
			return { ...base, intent: "yes" };
		}
		if (/^(non|no|nan|pas question|je refuse|je prefere (que )?non|sans)\b|\bseul\b/.test(text)) {
			return { ...base, intent: "no" };
		}
		if (/(je (viens|viendrai|serai la|serai present)|je confirme|present)/.test(text)) {
			return { ...base, intent: "confirm_attendance" };
		}
		if (/^(merci|au revoir|bye|a bientot|bonne soiree)\b/.test(text)) {
			return { ...base, intent: "goodbye" };
		}

		const faqIndex = this.#matchFaq(input);
		if (faqIndex !== null) {
			return { ...base, intent: "faq", faqIndex, answer: this.lines.faqAnswer(faqIndex) };
		}

		return { ...base, intent: "other" };
	}

	async kioskReply(context: KioskContext): Promise<KioskReply> {
		const guestTurns = context.transcript.filter((entry) => entry.role === "guest").length;

		if (guestTurns <= 1) return { text: this.lines.kioskIdea(), offerHandoff: false };

		return { text: this.lines.kioskHandoffOffer(context.referentFirstName), offerHandoff: true };
	}

	async summarizeKiosk(context: KioskContext): Promise<ConversationSummary> {
		const guestTurns = context.transcript.filter((entry) => entry.role === "guest");

		return {
			need: guestTurns[0]?.text.slice(0, 300) ?? null,
			idea: null,
			interestLevel: context.handoffRequested ? "high" : guestTurns.length > 1 ? "medium" : "low",
			notes: null,
		};
	}

	/**
	 * Best FAQ entry by shared words with its question (accent and case insensitive).
	 */
	#matchFaq(input: SignupUnderstandInput) {
		const asked = new Set(words(input.text));
		let best: { index: number; score: number } | null = null;

		input.event.faq.forEach((entry, index) => {
			const score = words(entry.question).filter((word) => asked.has(word)).length;
			if (score > 0 && (!best || score > best.score)) best = { index, score };
		});

		return (best as { index: number } | null)?.index ?? null;
	}
}
