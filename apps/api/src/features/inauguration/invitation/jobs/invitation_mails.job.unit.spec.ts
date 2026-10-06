import testUtils from "@adonisjs/core/services/test_utils";
import mail from "@adonisjs/mail/services/main";
import { test } from "@japa/runner";

import eventConfig from "#config/event";
import { GuestFactory } from "#database/factories/guest.factory";
import SendInvitationConfirmation from "#features/inauguration/invitation/jobs/send_invitation_confirmation.job";
import SendPlusOneInvitation from "#features/inauguration/invitation/jobs/send_plus_one_invitation.job";
import InvitationConfirmationMail from "#features/inauguration/invitation/mails/invitation_confirmation.mail";
import PlusOneInvitationMail from "#features/inauguration/invitation/mails/plus_one_invitation.mail";

const jobMetadata = (name: string) => ({
	jobId: "test",
	name,
	attempt: 1,
	queue: "emails",
	priority: 5,
	acquiredAt: new Date(),
	stalledCount: 0,
});

test.group("Features / Inauguration / Invitation / Jobs", (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.teardown(() => {
		mail.restore();
	});

	test("it should send the confirmation email with QR code and calendar", async ({ assert }) => {
		const fakeMailer = mail.fake();
		const guest = await GuestFactory.apply("confirmed").create();

		const job = new SendInvitationConfirmation();
		job.$hydrate({ guestId: guest.id }, jobMetadata(SendInvitationConfirmation.name));
		await job.execute();

		fakeMailer.mails.assertSent(InvitationConfirmationMail, ({ message }) => {
			return message.hasTo(guest.email!);
		});
		const [sent] = fakeMailer.mails.sent();
		const html = sent.message.toJSON().message.html as string;
		assert.include(html, guest.firstName);
		assert.include(html, eventConfig.avatarName);
		assert.include(html, "cid:qrcode");
		const attachments = sent.message.toJSON().message.attachments ?? [];
		assert.sameMembers(
			attachments.map((attachment) => attachment.filename),
			["qr-code.png", "invitation.ics"],
		);
	});

	test("it should send the plus-one invitation naming the host", async ({ assert }) => {
		const fakeMailer = mail.fake();
		const host = await GuestFactory.apply("confirmed").create();
		const plusOne = await GuestFactory.merge({
			kind: "plus_one",
			status: "confirmed",
			hostGuestId: host.id,
		}).create();

		const job = new SendPlusOneInvitation();
		job.$hydrate({ guestId: plusOne.id }, jobMetadata(SendPlusOneInvitation.name));
		await job.execute();

		fakeMailer.mails.assertSent(PlusOneInvitationMail, ({ message }) => {
			return message.hasTo(plusOne.email!);
		});
		const [sent] = fakeMailer.mails.sent();
		assert.include(sent.message.toJSON().message.html as string, host.lastName);
	});

	test("it should not send anything when the plus-one no longer exists", async () => {
		const fakeMailer = mail.fake();

		const job = new SendPlusOneInvitation();
		job.$hydrate({ guestId: 999_999 }, jobMetadata(SendPlusOneInvitation.name));
		await job.execute();

		fakeMailer.mails.assertNoneSent();
	});
});
