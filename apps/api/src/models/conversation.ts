import { belongsTo, column, hasMany } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany } from "@adonisjs/lucid/types/relations";

import { ConversationSchema } from "#database/schema";
import Guest from "#models/guest";
import Handoff from "#models/handoff";

export const CONVERSATION_CHANNELS = ["signup", "kiosk"] as const;
export type ConversationChannel = (typeof CONVERSATION_CHANNELS)[number];

export type ConversationTranscriptEntry = {
	role: "guest" | "avatar" | "system";
	text: string;
	at: string;
};

export const INTEREST_LEVELS = ["low", "medium", "high"] as const;
export type InterestLevel = (typeof INTEREST_LEVELS)[number];

export type ConversationSummary = {
	need: string | null;
	idea: string | null;
	interestLevel: InterestLevel;
	notes: string | null;
};

const prepareJson = (value: unknown) => (value === null ? null : JSON.stringify(value));

export default class Conversation extends ConversationSchema {
	declare channel: ConversationChannel;

	@column({ prepare: prepareJson })
	declare transcript: ConversationTranscriptEntry[] | null;

	@column({ prepare: prepareJson })
	declare summary: ConversationSummary | null;

	@belongsTo(() => Guest)
	declare guest: BelongsTo<typeof Guest>;

	@hasMany(() => Handoff)
	declare handoffs: HasMany<typeof Handoff>;
}
