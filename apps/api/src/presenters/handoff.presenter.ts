import type Handoff from "#models/handoff";

export default class HandoffPresenter {
	toJSON(handoff: Handoff) {
		const guest = handoff.guest;
		const referent = handoff.referent;

		return {
			id: handoff.id,
			guestId: handoff.guestId,
			guest: guest
				? {
						id: guest.id,
						firstName: guest.firstName,
						lastName: guest.lastName,
						company: guest.company,
					}
				: null,
			conversationId: handoff.conversationId,
			referentUserId: handoff.referentUserId,
			referent: referent ? { id: referent.id, name: referent.name, email: referent.email } : null,

			reason: handoff.reason,
			status: handoff.status,

			createdAt: handoff.createdAt.toJSDate(),
			updatedAt: handoff.updatedAt.toJSDate(),
		};
	}
}
