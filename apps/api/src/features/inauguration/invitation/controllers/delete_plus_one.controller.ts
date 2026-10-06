import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

@inject()
export default class DeletePlusOneController {
	constructor(
		protected invitationService: InvitationService,
		protected invitationPresenter: InvitationPresenter,
	) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("deletePlusOne");

		const guest = await this.invitationService.findByToken(params.token);
		const updatedGuest = await this.invitationService.deletePlusOne(guest);

		return this.invitationPresenter.toJSON(updatedGuest);
	}
}
