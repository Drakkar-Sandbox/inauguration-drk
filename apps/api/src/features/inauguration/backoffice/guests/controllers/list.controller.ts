import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import GuestService from "#features/inauguration/backoffice/guests/services/guest.service";
import { GUEST_KINDS, GUEST_STATUSES, MEETING_STATUSES } from "#models/guest";
import GuestPresenter from "#presenters/guest.presenter";
import PaginationPresenter from "#presenters/pagination.presenter";

@inject()
export default class ListGuestsController {
	constructor(
		protected guestService: GuestService,
		protected guestPresenter: GuestPresenter,
		protected paginationPresenter: PaginationPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("list");

		const filters = await request.validateUsing(ListGuestsController.payloadSchema);

		const guests = await this.guestService.list(filters);

		return {
			data: guests.all().map((guest) => this.guestPresenter.toJSON(guest)),
			meta: this.paginationPresenter.toJSON(guests),
		};
	}

	static payloadSchema = vine.create({
		page: vine.number().min(1).optional(),
		perPage: vine.number().min(1).max(500).optional(),
		status: vine.enum(GUEST_STATUSES).optional(),
		kind: vine.enum(GUEST_KINDS).optional(),
		checkedIn: vine.boolean().optional(),
		referentUserId: vine.number().optional(),
		meetingStatus: vine.enum(MEETING_STATUSES).optional(),
		search: vine.string().maxLength(100).optional(),
	});
}
