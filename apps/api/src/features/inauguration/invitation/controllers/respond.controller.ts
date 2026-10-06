import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

@inject()
export default class RespondInvitationController {
	constructor(
		protected invitationService: InvitationService,
		protected invitationPresenter: InvitationPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("respond");

		const { response } = await request.validateUsing(RespondInvitationController.payloadSchema);

		const guest = await this.invitationService.findByToken(params.token);
		const updatedGuest = await this.invitationService.respond(guest, response);

		return this.invitationPresenter.toJSON(updatedGuest);
	}

	static payloadSchema = vine.create({
		response: vine.enum(["confirmed", "declined"] as const),
	});
}
