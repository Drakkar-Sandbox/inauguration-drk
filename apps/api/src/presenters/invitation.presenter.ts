import { inject } from "@adonisjs/core";

import type Guest from "#models/guest";
import EventService from "#services/event.service";

/**
 * Public invitation payload. Only exposes the guest's own data, their host or
 * plus-one names, and public event information.
 */
@inject()
export default class InvitationPresenter {
	constructor(private eventService: EventService) {}

	toJSON(guest: Guest) {
		const plusOne = guest.kind === "primary" ? guest.plusOne : null;
		const host = guest.kind === "plus_one" ? guest.host : null;

		return {
			guest: {
				firstName: guest.firstName,
				lastName: guest.lastName,
				company: guest.company,
				kind: guest.kind,
				status: guest.status,
				consent: guest.consentGivenAt
					? ("given" as const)
					: guest.consentRefusedAt
						? ("refused" as const)
						: ("unknown" as const),
				respondedAt: guest.respondedAt?.toJSDate() ?? null,
			},
			host: host ? { firstName: host.firstName, lastName: host.lastName } : null,
			plusOne: plusOne
				? { firstName: plusOne.firstName, lastName: plusOne.lastName, email: plusOne.email }
				: null,
			plusOneEditable:
				guest.kind === "primary" &&
				guest.status === "confirmed" &&
				this.eventService.isPlusOneEditable(),
			plusOneDeadline: this.eventService.plusOneDeadline().toJSDate(),
			event: this.eventService.publicInfo(),
		};
	}
}
