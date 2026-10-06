import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import InvitationPresenter from "#presenters/invitation.presenter";

@inject()
export default class ViewInvitationController {
	constructor(
		protected invitationService: InvitationService,
		protected invitationPresenter: InvitationPresenter,
	) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("view");

		const guest = await this.invitationService.findByToken(params.token);

		return this.invitationPresenter.toJSON(guest);
	}
}
