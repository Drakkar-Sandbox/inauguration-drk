import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import Guest, { GUEST_KINDS } from "#models/guest";
import QrCodeService from "#services/qr_code.service";

/**
 * Data for the printable QR sheet: one entry per guest with its inline SVG QR code.
 */
@inject()
export default class QrSheetGuestsController {
	constructor(protected qrCodeService: QrCodeService) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("export");

		const { kind } = await request.validateUsing(QrSheetGuestsController.payloadSchema);

		const guests = await Guest.query()
			.if(kind, (query) => query.where("kind", kind!))
			.orderBy("last_name", "asc")
			.orderBy("first_name", "asc")
			.orderBy("id", "asc");

		return Promise.all(
			guests.map(async (guest) => ({
				guest: {
					id: guest.id,
					firstName: guest.firstName,
					lastName: guest.lastName,
					company: guest.company,
					kind: guest.kind,
				},
				url: guest.qrUrl,
				qrSvg: await this.qrCodeService.toSvg(guest.qrUrl),
			})),
		);
	}

	static payloadSchema = vine.create({
		kind: vine.enum(GUEST_KINDS).optional(),
	});
}
