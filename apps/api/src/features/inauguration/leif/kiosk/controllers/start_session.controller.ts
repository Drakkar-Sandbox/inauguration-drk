import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import { GuestRefSchema } from "#features/inauguration/kiosk/checkin/validators/guest_ref.validator";
import KioskLeifPolicy from "#features/inauguration/leif/kiosk/policies/kiosk_leif.policy";
import KioskLeifService from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";
import LeifKioskTurnPresenter from "#presenters/leif_kiosk_turn.presenter";

/**
 * Starts a "Défiez" session for the guest whose QR code was scanned.
 */
@inject()
export default class KioskLeifStartSessionController {
	constructor(
		protected kioskLeifService: KioskLeifService,
		protected leifKioskTurnPresenter: LeifKioskTurnPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(KioskLeifPolicy).authorize("startSession");

		const ref = await request.validateUsing(KioskLeifStartSessionController.payloadSchema);

		const turn = await this.kioskLeifService.start(ref);

		return this.leifKioskTurnPresenter.toJSON(turn);
	}

	static payloadSchema = vine.create(GuestRefSchema);
}
