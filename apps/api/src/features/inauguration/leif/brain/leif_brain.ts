import type { EventConfig } from "#config/event";
import type { ConversationSummary, ConversationTranscriptEntry } from "#models/conversation";

/**
 * What the guest meant, as understood from free text. The signup state machine maps
 * it to an action of the current step; the brain never performs actions itself.
 */
export const SIGNUP_INTENTS = [
	"yes",
	"no",
	"confirm_attendance",
	"decline_attendance",
	"plus_one_details",
	"faq",
	"off_topic",
	"goodbye",
	"other",
] as const;
export type SignupIntent = (typeof SIGNUP_INTENTS)[number];

export type SignupUnderstanding = {
	intent: SignupIntent;
	firstName: string | null;
	lastName: string | null;
	email: string | null;
	/** Index in `event.faq` when the guest asks a practical question covered by it. */
	faqIndex: number | null;
	/** Short in-persona answer for `faq`, `off_topic` and `other` intents. */
	answer: string | null;
};

export type SignupUnderstandInput = {
	event: EventConfig;
	guestFirstName: string;
	/** The closed question Leif is currently waiting an answer for. */
	question: string;
	history: ConversationTranscriptEntry[];
	text: string;
};

/**
 * Day-J kiosk context. The angle sheet only steers the ideas: it must never be read
 * aloud or revealed.
 */
export type KioskContext = {
	event: EventConfig;
	guest: { firstName: string; company: string | null };
	angleTopic: string | null;
	angleNotes: string | null;
	referentFirstName: string | null;
	handoffRequested: boolean;
	transcript: ConversationTranscriptEntry[];
};

export type KioskReply = {
	text: string;
	/** True when the guest shows interest and Leif proposes to meet the referent. */
	offerHandoff: boolean;
};

/**
 * Leif's language abilities. Implementations: Claude (when `ANTHROPIC_API_KEY` is set)
 * and a deterministic scripted fallback. Bound in the container by the Leif provider.
 */
export abstract class LeifBrain {
	abstract readonly mode: "ai" | "scripted";

	abstract understandSignup(input: SignupUnderstandInput): Promise<SignupUnderstanding>;

	abstract kioskReply(context: KioskContext): Promise<KioskReply>;

	abstract summarizeKiosk(context: KioskContext): Promise<ConversationSummary>;
}
