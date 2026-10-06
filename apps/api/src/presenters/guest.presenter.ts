import type Guest from "#models/guest";

export default class GuestPresenter {
	toJSON(guest: Guest) {
		const plusOne = guest.plusOne;
		const host = guest.host;
		const referent = guest.referent;

		return {
			id: guest.id,
			token: guest.token,
			qrUrl: guest.qrUrl,

			firstName: guest.firstName,
			lastName: guest.lastName,
			email: guest.email,
			company: guest.company,
			kind: guest.kind,
			status: guest.status,
			respondedAt: guest.respondedAt?.toJSDate() ?? null,
			consent: guest.consentGivenAt
				? ("given" as const)
				: guest.consentRefusedAt
					? ("refused" as const)
					: ("unknown" as const),
			consentGivenAt: guest.consentGivenAt?.toJSDate() ?? null,
			consentRefusedAt: guest.consentRefusedAt?.toJSDate() ?? null,
			checkedInAt: guest.checkedInAt?.toJSDate() ?? null,

			hostGuestId: guest.hostGuestId,
			host: host ? { id: host.id, firstName: host.firstName, lastName: host.lastName } : null,
			plusOne: plusOne
				? {
						id: plusOne.id,
						firstName: plusOne.firstName,
						lastName: plusOne.lastName,
						email: plusOne.email,
						checkedInAt: plusOne.checkedInAt?.toJSDate() ?? null,
					}
				: null,

			referentUserId: guest.referentUserId,
			referent: referent ? { id: referent.id, name: referent.name, email: referent.email } : null,
			angleTopic: guest.angleTopic,
			angleNotes: guest.angleNotes,
			meetingStatus: guest.meetingStatus,

			createdAt: guest.createdAt.toJSDate(),
			updatedAt: guest.updatedAt.toJSDate(),
		};
	}
}
