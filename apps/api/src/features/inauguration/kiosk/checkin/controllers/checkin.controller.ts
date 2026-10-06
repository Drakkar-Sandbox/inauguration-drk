import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import CheckinPolicy from "#features/inauguration/kiosk/checkin/policies/checkin.policy";
import CheckinService from "#features/inauguration/kiosk/checkin/services/checkin.service";
import KioskGuestPresenter from "#presenters/kiosk_guest.presenter";

@inject()
export default class CheckinController {
	constructor(
		protected checkinService: CheckinService,
		protected kioskGuestPresenter: KioskGuestPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(CheckinPolicy).authorize("checkin");

		const { token } = await request.validateUsing(CheckinController.payloadSchema);

		const { guest, alreadyCheckedIn } = await this.checkinService.checkin(token);

		return {
			guest: this.kioskGuestPresenter.toJSON(guest),
			alreadyCheckedIn,
		};
	}

	static payloadSchema = vine.create({
		token: vine.string().minLength(1).maxLength(2048),
	});
}
