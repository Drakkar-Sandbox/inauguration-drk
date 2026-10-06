import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import EventService from "#services/event.service";

@inject()
export default class CalendarInvitationController {
	constructor(
		protected invitationService: InvitationService,
		protected eventService: EventService,
	) {}

	async handle({ params, response, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("calendar");

		const guest = await this.invitationService.findByToken(params.token);

		response.header("Content-Type", "text/calendar; charset=utf-8");
		response.header("Content-Disposition", 'attachment; filename="invitation.ics"');

		return this.eventService.toIcs(guest.qrUrl);
	}
}
