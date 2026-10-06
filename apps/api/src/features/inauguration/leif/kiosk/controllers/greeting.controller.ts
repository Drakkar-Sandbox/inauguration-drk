import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import { GuestRefSchema } from "#features/inauguration/kiosk/checkin/validators/guest_ref.validator";
import KioskLeifPolicy from "#features/inauguration/leif/kiosk/policies/kiosk_leif.policy";
import KioskLeifService from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";
import KioskGuestPresenter from "#presenters/kiosk_guest.presenter";

/**
 * Personalized welcome for the reception screen (call it after the check-in).
 */
@inject()
export default class KioskLeifGreetingController {
	constructor(
		protected kioskLeifService: KioskLeifService,
		protected kioskGuestPresenter: KioskGuestPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(KioskLeifPolicy).authorize("greeting");

		const ref = await request.validateUsing(KioskLeifGreetingController.payloadSchema);

		const { guest, text, speech } = await this.kioskLeifService.greeting(ref);

		return {
			guest: this.kioskGuestPresenter.toJSON(guest),
			reply: { text },
			audio: speech,
		};
	}

	static payloadSchema = vine.create(GuestRefSchema);
}
