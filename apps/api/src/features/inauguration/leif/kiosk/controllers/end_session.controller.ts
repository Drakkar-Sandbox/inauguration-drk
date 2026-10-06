import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import KioskLeifPolicy from "#features/inauguration/leif/kiosk/policies/kiosk_leif.policy";
import KioskLeifService from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";

/**
 * Ends the session: transcript and summary are stored only with the guest's consent.
 */
@inject()
export default class KioskLeifEndSessionController {
	constructor(protected kioskLeifService: KioskLeifService) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(KioskLeifPolicy).authorize("endSession");

		return this.kioskLeifService.end(params.id);
	}
}
