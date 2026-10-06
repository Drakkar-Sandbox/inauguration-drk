import { BaseMail } from "@adonisjs/mail";

import eventConfig from "#config/event";
import Guest from "#models/guest";
import EventService from "#services/event.service";

export default class PlusOneInvitationMail extends BaseMail {
	subject = `Vous êtes invité(e) — ${eventConfig.title}`;

	constructor(private params: PlusOneInvitationMailDTO) {
		super();
	}

	prepare() {
		const { guest, host, qrCodePng, ics, event } = this.params;

		this.message.to(guest.email!);
		this.message.embedData(qrCodePng, "qrcode", {
			filename: "qr-code.png",
			contentType: "image/png",
		});
		this.message.attachData(Buffer.from(ics), {
			filename: "invitation.ics",
			contentType: "text/calendar; charset=utf-8",
		});
		this.message.htmlView("../features/inauguration/invitation/mails/plus_one_invitation.html", {
			guest,
			host,
			event,
			invitationUrl: guest.qrUrl,
		});
	}
}

type PlusOneInvitationMailDTO = {
	guest: Guest;
	host: Guest;
	qrCodePng: Buffer;
	ics: string;
	event: ReturnType<EventService["publicInfo"]>;
};
