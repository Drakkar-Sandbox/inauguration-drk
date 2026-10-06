import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import CheckinPolicy from "#features/inauguration/kiosk/checkin/policies/checkin.policy";
import CheckinService from "#features/inauguration/kiosk/checkin/services/checkin.service";
import { GuestRefSchema } from "#features/inauguration/kiosk/checkin/validators/guest_ref.validator";
import KioskGuestPresenter from "#presenters/kiosk_guest.presenter";

@inject()
export default class CheckinController {
	constructor(
		protected checkinService: CheckinService,
		protected kioskGuestPresenter: KioskGuestPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(CheckinPolicy).authorize("checkin");

		const ref = await request.validateUsing(CheckinController.payloadSchema);

		const { guest, alreadyCheckedIn } = await this.checkinService.checkin(ref);

		return {
			guest: this.kioskGuestPresenter.toJSON(guest),
			alreadyCheckedIn,
		};
	}

	/**
	 * `{ token }` from a QR scan, or `{ guestId }` after a manual name search.
	 */
	static payloadSchema = vine.create(GuestRefSchema);
}
