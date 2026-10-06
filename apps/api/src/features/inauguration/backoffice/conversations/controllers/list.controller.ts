import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import ConversationPolicy from "#features/inauguration/backoffice/conversations/policies/conversation.policy";
import Conversation, { CONVERSATION_CHANNELS } from "#models/conversation";
import ConversationPresenter from "#presenters/conversation.presenter";
import PaginationPresenter from "#presenters/pagination.presenter";

@inject()
export default class ListConversationsController {
	constructor(
		protected conversationPresenter: ConversationPresenter,
		protected paginationPresenter: PaginationPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(ConversationPolicy).authorize("list");

		const { page, perPage, channel, guestId } = await request.validateUsing(
			ListConversationsController.payloadSchema,
		);

		const conversations = await Conversation.query()
			.preload("guest")
			.if(channel, (query) => query.where("channel", channel!))
			.if(guestId, (query) => query.where("guest_id", guestId!))
			.orderBy("started_at", "desc")
			.paginate(page ?? 1, perPage ?? 50);

		return {
			data: conversations
				.all()
				.map((conversation) => this.conversationPresenter.toJSON(conversation)),
			meta: this.paginationPresenter.toJSON(conversations),
		};
	}

	static payloadSchema = vine.create({
		page: vine.number().min(1).optional(),
		perPage: vine.number().min(1).max(200).optional(),
		channel: vine.enum(CONVERSATION_CHANNELS).optional(),
		guestId: vine.number().optional(),
	});
}
