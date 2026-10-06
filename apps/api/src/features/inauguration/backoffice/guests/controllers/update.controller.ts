import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";
import { DateTime } from "luxon";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import GuestService from "#features/inauguration/backoffice/guests/services/guest.service";
import {
	GuestFieldsSchema,
	GuestNameValidator,
} from "#features/inauguration/backoffice/guests/validators/guest.validator";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import Guest from "#models/guest";
import GuestPresenter from "#presenters/guest.presenter";

@inject()
export default class UpdateGuestController {
	constructor(
		protected guestService: GuestService,
		protected guestPresenter: GuestPresenter,
		protected invitationService: InvitationService,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("update");

		const payload = await request.validateUsing(UpdateGuestController.payloadSchema);

		const guest = await Guest.findOrFail(params.id);
		const statusChanged = payload.status !== undefined && payload.status !== guest.status;
		const declining = statusChanged && payload.status === "declined";

		await guest
			.merge({
				...payload,
				...(declining && { status: guest.status }),
				...(payload.email !== undefined && { email: payload.email?.toLowerCase() ?? null }),
				...(statusChanged && !declining && { respondedAt: DateTime.now() }),
			})
			.save();

		// Same rule as the guest's own RSVP: a declined host does not bring a plus-one.
		if (declining) await this.invitationService.respond(guest, "declined");

		return this.guestPresenter.toJSON(await this.guestService.find(guest.id));
	}

	static payloadSchema = vine.create({
		firstName: GuestNameValidator.clone().optional(),
		lastName: GuestNameValidator.clone().optional(),
		...GuestFieldsSchema,
	});
}
