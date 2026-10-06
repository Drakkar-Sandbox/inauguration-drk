import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import KioskLeifPolicy from "#features/inauguration/leif/kiosk/policies/kiosk_leif.policy";
import KioskLeifService from "#features/inauguration/leif/kiosk/services/kiosk_leif.service";
import LeifKioskTurnPresenter from "#presenters/leif_kiosk_turn.presenter";

@inject()
export default class KioskLeifMessageController {
	constructor(
		protected kioskLeifService: KioskLeifService,
		protected leifKioskTurnPresenter: LeifKioskTurnPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(KioskLeifPolicy).authorize("message");

		const { text } = await request.validateUsing(KioskLeifMessageController.payloadSchema);

		const turn = await this.kioskLeifService.message(params.id, text);

		return this.leifKioskTurnPresenter.toJSON(turn);
	}

	static payloadSchema = vine.create({
		text: vine.string().trim().minLength(1).maxLength(1000),
	});
}
