import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

@inject()
export default class UpdatePlusOneController {
	constructor(
		protected invitationService: InvitationService,
		protected invitationPresenter: InvitationPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("updatePlusOne");

		const payload = await request.validateUsing(UpdatePlusOneController.payloadSchema);

		const guest = await this.invitationService.findByToken(params.token);
		const updatedGuest = await this.invitationService.upsertPlusOne(guest, payload);

		return this.invitationPresenter.toJSON(updatedGuest);
	}

	static payloadSchema = vine.create({
		firstName: vine.string().minLength(1).maxLength(100),
		lastName: vine.string().minLength(1).maxLength(100),
		email: vine.string().email().maxLength(254),
	});
}
