import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import GuestService from "#features/inauguration/backoffice/guests/services/guest.service";
import ConversationPresenter from "#presenters/conversation.presenter";
import GuestPresenter from "#presenters/guest.presenter";
import HandoffPresenter from "#presenters/handoff.presenter";

@inject()
export default class ViewGuestController {
	constructor(
		protected guestService: GuestService,
		protected guestPresenter: GuestPresenter,
		protected conversationPresenter: ConversationPresenter,
		protected handoffPresenter: HandoffPresenter,
	) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("view");

		const guest = await this.guestService.find(params.id);

		return {
			...this.guestPresenter.toJSON(guest),
			conversations: guest.conversations.map((conversation) =>
				this.conversationPresenter.toJSON(conversation),
			),
			handoffs: guest.handoffs.map((handoff) => this.handoffPresenter.toJSON(handoff)),
		};
	}
}
