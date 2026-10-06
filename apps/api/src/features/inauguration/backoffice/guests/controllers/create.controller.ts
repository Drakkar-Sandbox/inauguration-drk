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
export default class CreateGuestController {
	constructor(
		protected guestService: GuestService,
		protected guestPresenter: GuestPresenter,
	) {}

	async handle({ request, response, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("create");

		const payload = await request.validateUsing(CreateGuestController.payloadSchema);

		const guest = await Guest.create({
			...payload,
			email: payload.email?.toLowerCase() ?? null,
			kind: "primary",
			respondedAt: payload.status && payload.status !== "invited" ? DateTime.now() : null,
		});

		response.status(201);

		return this.guestPresenter.toJSON(await this.guestService.find(guest.id));
	}

	static payloadSchema = vine.create({
		firstName: GuestNameValidator.clone(),
		lastName: GuestNameValidator.clone(),
		...GuestFieldsSchema,
	});
}
