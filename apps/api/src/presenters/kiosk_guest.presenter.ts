import type Guest from "#models/guest";

/**
 * Guest data displayed on day-J screens. Never includes angle sheet or conversation data.
 */
export default class KioskGuestPresenter {
	toJSON(guest: Guest) {
		return {
			id: guest.id,
			token: guest.token,
			firstName: guest.firstName,
			lastName: guest.lastName,
			company: guest.company,
			kind: guest.kind,
			status: guest.status,
			hostFirstName: guest.host?.firstName ?? null,
			hostLastName: guest.host?.lastName ?? null,
			checkedInAt: guest.checkedInAt?.toJSDate() ?? null,
		};
	}
}
