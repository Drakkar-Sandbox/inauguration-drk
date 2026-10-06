import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import Guest from "#models/guest";
import QrCodeService from "#services/qr_code.service";

@inject()
export default class QrSvgGuestController {
	constructor(protected qrCodeService: QrCodeService) {}

	async handle({ params, response, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("export");

		const guest = await Guest.findOrFail(params.id);

		response.header("Content-Type", "image/svg+xml");
		const filename = `qr-${guest.id}-${guest.lastName}.svg`.replace(/[^\w.-]+/g, "_");
		response.header("Content-Disposition", `attachment; filename="${filename}"`);

		return this.qrCodeService.toSvg(guest.qrUrl);
	}
}
