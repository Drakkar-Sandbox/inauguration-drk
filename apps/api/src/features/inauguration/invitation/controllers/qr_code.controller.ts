import { Readable } from "node:stream";

import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";

import InvitationPolicy from "#features/inauguration/invitation/policies/invitation.policy";
import InvitationService from "#features/inauguration/invitation/services/invitation.service";
import QrCodeService from "#services/qr_code.service";

@inject()
export default class QrCodeInvitationController {
	constructor(
		protected invitationService: InvitationService,
		protected qrCodeService: QrCodeService,
	) {}

	async handle({ params, response, bouncer }: HttpContext) {
		await bouncer.with(InvitationPolicy).authorize("qrCode");

		const guest = await this.invitationService.findByToken(params.token);
		const png = await this.qrCodeService.toPng(guest.qrUrl);

		response.header("Content-Type", "image/png");
		response.header("Cache-Control", "private, max-age=3600");
		// Streamed so the superjson middleware never re-encodes the binary body.
		response.stream(Readable.from([png]));
	}
}
