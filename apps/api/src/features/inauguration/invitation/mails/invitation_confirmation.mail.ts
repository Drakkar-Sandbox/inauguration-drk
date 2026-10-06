import { BaseMail } from "@adonisjs/mail";

import eventConfig from "#config/event";
import Guest from "#models/guest";
import EventService from "#services/event.service";

export default class InvitationConfirmationMail extends BaseMail {
	subject = `Votre présence est confirmée — ${eventConfig.title}`;

	constructor(private params: InvitationConfirmationMailDTO) {
		super();
	}

	prepare() {
		const { guest, qrCodePng, ics, event } = this.params;

		this.message.to(guest.email!);
		this.message.embedData(qrCodePng, "qrcode", {
			filename: "qr-code.png",
			contentType: "image/png",
		});
		this.message.attachData(Buffer.from(ics), {
			filename: "invitation.ics",
			contentType: "text/calendar; charset=utf-8",
		});
		this.message.htmlView(
			"../features/inauguration/invitation/mails/invitation_confirmation.html",
			{
				guest,
				event,
				invitationUrl: guest.qrUrl,
			},
		);
	}
}

type InvitationConfirmationMailDTO = {
	guest: Guest;
	qrCodePng: Buffer;
	ics: string;
	event: ReturnType<EventService["publicInfo"]>;
};
