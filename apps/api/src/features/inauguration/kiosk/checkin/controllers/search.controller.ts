import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import GuestService from "#features/inauguration/backoffice/guests/services/guest.service";
import CheckinPolicy from "#features/inauguration/kiosk/checkin/policies/checkin.policy";
import Guest from "#models/guest";
import KioskGuestPresenter from "#presenters/kiosk_guest.presenter";

/**
 * Name search for guests arriving without their QR code (host tablet).
 */
@inject()
export default class SearchController {
	constructor(
		protected guestService: GuestService,
		protected kioskGuestPresenter: KioskGuestPresenter,
	) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(CheckinPolicy).authorize("search");

		const { q } = await request.validateUsing(SearchController.payloadSchema);

		const query = Guest.query()
			.preload("host")
			.orderBy("last_name", "asc")
			.orderBy("first_name", "asc")
			.limit(20);
		this.guestService.applySearch(query, q);
		const guests = await query;

		return guests.map((guest) => this.kioskGuestPresenter.toJSON(guest));
	}

	static payloadSchema = vine.create({
		q: vine.string().minLength(2).maxLength(100),
	});
}
