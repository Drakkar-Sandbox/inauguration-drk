import { randomBytes } from "node:crypto";

import { beforeCreate, belongsTo, hasMany, hasOne } from "@adonisjs/lucid/orm";
import type { BelongsTo, HasMany, HasOne } from "@adonisjs/lucid/types/relations";

import { GuestSchema } from "#database/schema";
import Conversation from "#models/conversation";
import Handoff from "#models/handoff";
import User from "#models/user";
import env from "#start/env";

export const GUEST_KINDS = ["primary", "plus_one"] as const;
export type GuestKind = (typeof GUEST_KINDS)[number];

export const GUEST_STATUSES = ["invited", "confirmed", "declined"] as const;
export type GuestStatus = (typeof GUEST_STATUSES)[number];

export const MEETING_STATUSES = ["none", "to_propose", "proposed", "held", "mission"] as const;
export type MeetingStatus = (typeof MEETING_STATUSES)[number];

export default class Guest extends GuestSchema {
	declare kind: GuestKind;
	declare status: GuestStatus;
	declare meetingStatus: MeetingStatus;

	@belongsTo(() => Guest, { foreignKey: "hostGuestId" })
	declare host: BelongsTo<typeof Guest>;

	@hasOne(() => Guest, { foreignKey: "hostGuestId" })
	declare plusOne: HasOne<typeof Guest>;

	@belongsTo(() => User, { foreignKey: "referentUserId" })
	declare referent: BelongsTo<typeof User>;

	@hasMany(() => Conversation)
	declare conversations: HasMany<typeof Conversation>;

	@hasMany(() => Handoff)
	declare handoffs: HasMany<typeof Handoff>;

	/**
	 * Public URL encoded in the guest QR code. Opens the invitation page.
	 */
	get qrUrl() {
		return new URL(`/i/${this.token}`, env.get("FRONTEND_URL")).toString();
	}

	get fullName() {
		return `${this.firstName} ${this.lastName}`;
	}

	/**
	 * URL-safe random token (32 chars, 192 bits of entropy).
	 */
	static generateToken() {
		return randomBytes(24).toString("base64url");
	}

	@beforeCreate()
	static assignToken(guest: Guest) {
		if (!guest.token) guest.token = Guest.generateToken();
	}
}
