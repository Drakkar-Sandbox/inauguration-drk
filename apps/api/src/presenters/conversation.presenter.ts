import type Conversation from "#models/conversation";

export default class ConversationPresenter {
	toJSON(conversation: Conversation) {
		const guest = conversation.guest;

		return {
			id: conversation.id,
			guestId: conversation.guestId,
			guest: guest
				? {
						id: guest.id,
						firstName: guest.firstName,
						lastName: guest.lastName,
						company: guest.company,
					}
				: null,

			channel: conversation.channel,
			startedAt: conversation.startedAt.toJSDate(),
			endedAt: conversation.endedAt?.toJSDate() ?? null,
			transcript: conversation.transcript ?? [],
			summary: conversation.summary,

			createdAt: conversation.createdAt.toJSDate(),
			updatedAt: conversation.updatedAt.toJSDate(),
		};
	}
}
