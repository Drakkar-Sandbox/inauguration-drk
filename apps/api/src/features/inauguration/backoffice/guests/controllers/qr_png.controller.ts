import { Readable } from "node:stream";

import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import Guest from "#models/guest";
import QrCodeService from "#services/qr_code.service";

@inject()
export default class QrPngGuestController {
	constructor(protected qrCodeService: QrCodeService) {}

	async handle({ params, request, response, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("export");

		const guest = await Guest.findOrFail(params.id);
		const size = Math.min(Math.max(Number(request.input("size", 1024)) || 1024, 128), 4096);
		const png = await this.qrCodeService.toPng(guest.qrUrl, size);

		response.header("Content-Type", "image/png");
		const filename = `qr-${guest.id}-${guest.lastName}.png`.replace(/[^\w.-]+/g, "_");
		response.header("Content-Disposition", `attachment; filename="${filename}"`);
		// Streamed so the superjson middleware never re-encodes the binary body.
		response.stream(Readable.from([png]));
	}
}
