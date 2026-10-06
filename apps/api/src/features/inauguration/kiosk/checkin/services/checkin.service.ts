import { DateTime } from "luxon";

import GuestNotFoundException from "#exceptions/guest_not_found.exception";
import type { GuestRef } from "#features/inauguration/kiosk/checkin/validators/guest_ref.validator";
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
	 * Finds the guest designated by a scanned QR code or a guest id.
	 */
	findQuery(ref: GuestRef) {
		const query = Guest.query();
		if (ref.guestId !== undefined) query.where("id", ref.guestId);
		else query.where("token", this.extractToken(ref.token ?? ""));

		return query;
	}

	/**
	 * Marks the guest as arrived. Idempotent: the first check-in time is kept.
	 */
	async checkin(ref: GuestRef) {
		const guest = await this.findQuery(ref).preload("host").first();
		if (!guest) throw new GuestNotFoundException();

		const alreadyCheckedIn = guest.checkedInAt !== null;
		if (!alreadyCheckedIn) {
			await guest.merge({ checkedInAt: DateTime.now() }).save();
		}

		return { guest, alreadyCheckedIn };
	}
}
