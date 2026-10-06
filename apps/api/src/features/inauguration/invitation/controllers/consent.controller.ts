import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

@inject()
export default class ConsentInvitationController {
	constructor(
		protected invitationService: InvitationService,
		protected invitationPresenter: InvitationPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("consent");

		const { given } = await request.validateUsing(ConsentInvitationController.payloadSchema);

		const guest = await this.invitationService.findByToken(params.token);
		const updatedGuest = await this.invitationService.consent(guest, given);

		return this.invitationPresenter.toJSON(updatedGuest);
	}

	static payloadSchema = vine.create({
		given: vine.boolean(),
	});
}
