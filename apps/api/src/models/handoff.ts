import { belongsTo } from "@adonisjs/lucid/orm";
import type { BelongsTo } from "@adonisjs/lucid/types/relations";

import { HandoffSchema } from "#database/schema";
import Conversation from "#models/conversation";
import Guest from "#models/guest";
import User from "#models/user";

export const HANDOFF_STATUSES = ["pending", "seen", "done"] as const;
export type HandoffStatus = (typeof HANDOFF_STATUSES)[number];

export default class Handoff extends HandoffSchema {
	declare status: HandoffStatus;

	@belongsTo(() => Guest)
	declare guest: BelongsTo<typeof Guest>;

	@belongsTo(() => Conversation)
	declare conversation: BelongsTo<typeof Conversation>;

	@belongsTo(() => User, { foreignKey: "referentUserId" })
	declare referent: BelongsTo<typeof User>;
}
