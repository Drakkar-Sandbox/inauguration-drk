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
import Guest from "#models/guest";
import GuestPresenter from "#presenters/guest.presenter";

@inject()
export default class UpdateGuestController {
	constructor(
		protected guestService: GuestService,
		protected guestPresenter: GuestPresenter,
	) {}

	async handle({ params, request, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("update");

		const payload = await request.validateUsing(UpdateGuestController.payloadSchema);

		const guest = await Guest.findOrFail(params.id);
		const statusChanged = payload.status !== undefined && payload.status !== guest.status;

		await guest
			.merge({
				...payload,
				...(payload.email !== undefined && { email: payload.email?.toLowerCase() ?? null }),
				...(statusChanged && { respondedAt: DateTime.now() }),
			})
			.save();

		return this.guestPresenter.toJSON(await this.guestService.find(guest.id));
	}

	static payloadSchema = vine.create({
		firstName: GuestNameValidator.clone().optional(),
		lastName: GuestNameValidator.clone().optional(),
		...GuestFieldsSchema,
	});
}
