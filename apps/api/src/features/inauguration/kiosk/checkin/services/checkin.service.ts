import { DateTime } from "luxon";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import Guest from "#models/guest";

export default class CheckinService {
	/**
	 * Accepts a raw token or the full invitation URL read by a scanner (`…/i/<token>`).
	 */
	extractToken(input: string) {
		const value = input.trim();
		const match = value.match(/\/i\/([\w-]+)/);

		return match ? match[1] : value;
	}

	/**
	 * Marks the guest as arrived. Idempotent: the first check-in time is kept.
	 */
	async checkin(input: string) {
		const guest = await Guest.query()
			.where("token", this.extractToken(input))
			.preload("host")
			.first();
		if (!guest) throw new GuestNotFoundException();

		const alreadyCheckedIn = guest.checkedInAt !== null;
		if (!alreadyCheckedIn) {
			await guest.merge({ checkedInAt: DateTime.now() }).save();
		}

		return { guest, alreadyCheckedIn };
	}
}
