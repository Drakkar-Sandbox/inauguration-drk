import mail from "@adonisjs/mail/services/main";
import { Job } from "@adonisjs/queue";
import type { JobOptions } from "@adonisjs/queue/types";

import PlusOneInvitationMail from "#features/inauguration/invitation/mails/plus_one_invitation.mail";
import Guest from "#models/guest";
import EventService from "#services/event.service";
import QrCodeService from "#services/qr_code.service";

type Payload = {
	guestId: number;
};

export default class SendPlusOneInvitation extends Job<Payload> {
	static options: JobOptions = {
		queue: "emails",
	};

	async execute() {
		const plusOne = await Guest.query()
			.where("id", this.payload.guestId)
			.where("kind", "plus_one")
			.preload("host")
			.first();
		// The plus-one may have been replaced or removed before the job ran.
		if (!plusOne?.email) return;

		const eventService = new EventService();

		await mail.send(
			new PlusOneInvitationMail({
				guest: plusOne,
				host: plusOne.host,
				qrCodePng: await new QrCodeService().toPng(plusOne.qrUrl),
				ics: eventService.toIcs(plusOne.qrUrl),
				event: eventService.publicInfo(),
			}),
		);
	}
}
