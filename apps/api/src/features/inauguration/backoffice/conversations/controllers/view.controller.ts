import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import ConversationPolicy from "#features/inauguration/backoffice/conversations/policies/conversation.policy";
import Conversation from "#models/conversation";
import ConversationPresenter from "#presenters/conversation.presenter";
import HandoffPresenter from "#presenters/handoff.presenter";

@inject()
export default class ViewConversationController {
	constructor(
		protected conversationPresenter: ConversationPresenter,
		protected handoffPresenter: HandoffPresenter,
	) {}

	async handle({ params, bouncer }: HttpContext) {
		await bouncer.with(ConversationPolicy).authorize("view");

		const conversation = await Conversation.query()
			.where("id", params.id)
			.preload("guest")
			.preload("handoffs", (query) => query.preload("referent"))
			.firstOrFail();

		return {
			...this.conversationPresenter.toJSON(conversation),
			handoffs: conversation.handoffs.map((handoff) => this.handoffPresenter.toJSON(handoff)),
		};
	}
}
