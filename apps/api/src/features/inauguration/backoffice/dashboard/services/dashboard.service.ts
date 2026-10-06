import db from "@adonisjs/lucid/services/db";

import { MEETING_STATUSES, MeetingStatus } from "#models/guest";
import { HANDOFF_STATUSES, HandoffStatus } from "#models/handoff";

export default class DashboardService {
	async stats() {
		const [guests] = await db
			.from("guests")
			.select(
				db.raw("count(*)::int as total"),
				db.raw("count(*) filter (where kind = 'primary')::int as primaries"),
				db.raw("count(*) filter (where kind = 'plus_one')::int as plus_ones"),
				db.raw("count(*) filter (where kind = 'primary' and status = 'invited')::int as pending"),
				db.raw(
					"count(*) filter (where kind = 'primary' and status = 'confirmed')::int as confirmed",
				),
				db.raw("count(*) filter (where kind = 'primary' and status = 'declined')::int as declined"),
				db.raw("count(*) filter (where checked_in_at is not null)::int as checked_in"),
				db.raw("count(*) filter (where consent_given_at is not null)::int as consent_given"),
			);

		const conversations = await db
			.from("conversations")
			.select("channel")
			.count("* as count")
			.groupBy("channel");
		const [kioskGuests] = await db
			.from("conversations")
			.where("channel", "kiosk")
			.countDistinct("guest_id as count");

		const handoffs = await db
			.from("handoffs")
			.select("status")
			.count("* as count")
			.groupBy("status");
		const meetings = await db
			.from("guests")
			.select("meeting_status")
			.count("* as count")
			.groupBy("meeting_status");

		const countBy = <Key extends string>(
			keys: readonly Key[],
			rows: Record<string, unknown>[],
			column: string,
		) =>
			Object.fromEntries(
				keys.map((key) => [key, Number(rows.find((row) => row[column] === key)?.count ?? 0)]),
			) as Record<Key, number>;

		return {
			guests: {
				total: guests.total as number,
				primaries: guests.primaries as number,
				plusOnes: guests.plus_ones as number,
				pending: guests.pending as number,
				confirmed: guests.confirmed as number,
				declined: guests.declined as number,
				checkedIn: guests.checked_in as number,
				consentGiven: guests.consent_given as number,
			},
			conversations: {
				...countBy(["signup", "kiosk"] as const, conversations, "channel"),
				kioskGuests: Number(kioskGuests.count),
			},
			handoffs: countBy<HandoffStatus>(HANDOFF_STATUSES, handoffs, "status"),
			meetings: countBy<MeetingStatus>(MEETING_STATUSES, meetings, "meeting_status"),
		};
	}
}
