import type Guest from "#models/guest";

/**
 * Guest data displayed on day-J screens. Never includes the invitation token,
 * angle sheet or conversation data (manual check-in goes by guest id).
 */
export default class KioskGuestPresenter {
	toJSON(guest: Guest) {
		return {
			id: guest.id,
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
