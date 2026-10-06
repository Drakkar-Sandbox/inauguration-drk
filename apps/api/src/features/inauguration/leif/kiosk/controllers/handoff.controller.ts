import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import KioskLeifPolicy from "#features/inauguration/leif/kiosk/policies/kiosk_leif.policy";
import KioskLeifService from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";
import LeifKioskTurnPresenter from "#presenters/leif_kiosk_turn.presenter";

/**
 * Hands the guest over to their referent (pending handoff shown in the back-office).
 */
@inject()
export default class KioskLeifHandoffController {
	constructor(
		protected kioskLeifService: KioskLeifService,
		protected leifKioskTurnPresenter: LeifKioskTurnPresenter,
	) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(KioskLeifPolicy).authorize("handoff");

		const turn = await this.kioskLeifService.handoff(params.id);

		return this.leifKioskTurnPresenter.toJSON(turn);
	}
}
