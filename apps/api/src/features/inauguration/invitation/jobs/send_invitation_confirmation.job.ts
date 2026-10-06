import mail from "@adonisjs/mail/services/main";
import { Job } from "@adonisjs/queue";
import type { JobOptions } from "@adonisjs/queue/types";

import InvitationConfirmationMail from "#features/inauguration/invitation/mails/invitation_confirmation.mail";
import Guest from "#models/guest";
import EventService from "#services/event.service";
import QrCodeService from "#services/qr_code.service";

type Payload = {
	guestId: number;
};

export default class SendInvitationConfirmation extends Job<Payload> {
	static options: JobOptions = {
		queue: "emails",
	};

	async execute() {
		const guest = await Guest.find(this.payload.guestId);
		if (!guest?.email || guest.status !== "confirmed") return;

		const eventService = new EventService();

		await mail.send(
			new InvitationConfirmationMail({
				guest,
				qrCodePng: await new QrCodeService().toPng(guest.qrUrl),
				ics: eventService.toIcs(guest.qrUrl),
				event: eventService.publicInfo(),
			}),
		);
	}
}
