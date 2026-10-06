import testUtils from "@adonisjs/core/services/test_utils";
import { QueueManager } from "@adonisjs/queue";
import { test } from "@japa/runner";
import { DateTime } from "luxon";

import eventConfig from "#config/event";
import { GuestFactory } from "#database/factories/guest.factory";
import SendInvitationConfirmation from "#features/inauguration/invitation/jobs/send_invitation_confirmation.job";
import SendPlusOneInvitation from "#features/inauguration/invitation/jobs/send_plus_one_invitation.job";
import Conversation from "#models/conversation";
import Guest from "#models/guest";

test.group("Features / Inauguration / Invitation / Controllers", (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());
	group.each.teardown(() => {
		QueueManager.restore();
	});

	test("it should return the public invitation view", async ({ client, assert }) => {
		const guest = await GuestFactory.merge({ angleNotes: "secret notes" }).create();
		await GuestFactory.create();

		const response = await client.visit("inauguration.invitations.view", { token: guest.token });

		response.assertOk();
		response.assertBodyContains({
			guest: {
				firstName: guest.firstName,
				lastName: guest.lastName,
				status: "invited",
				kind: "primary",
				consent: "unknown",
			},
			plusOne: null,
			plusOneEditable: false,
			event: { avatarName: eventConfig.avatarName, title: eventConfig.title },
		});
		const body = JSON.stringify(response.body());
		assert.notInclude(body, "secret notes");
		assert.notInclude(body, guest.token);
	});

	test("it should respond with E_GUEST_NOT_FOUND for an unknown token", async ({ client }) => {
		const response = await client.visit("inauguration.invitations.view", { token: "unknown" });

		response.assertNotFound();
		response.assertBodyContains({ code: "E_GUEST_NOT_FOUND" });
	});

	test("it should confirm the presence and push a confirmation job", async ({ client, assert }) => {
		const fakeQueueManager = QueueManager.fake();
		const guest = await GuestFactory.create();

		const response = await client
			.visit("inauguration.invitations.respond", { token: guest.token })
			.json({ response: "confirmed" });

		response.assertOk();
		response.assertBodyContains({ guest: { status: "confirmed" }, plusOneEditable: true });
		await guest.refresh();
		assert.equal(guest.status, "confirmed");
		assert.isNotNull(guest.respondedAt);
		fakeQueueManager.assertPushed(SendInvitationConfirmation);
	});

	test("it should decline the invitation and remove the plus-one", async ({ client, assert }) => {
		const fakeQueueManager = QueueManager.fake();
		const guest = await GuestFactory.apply("confirmed").create();
		await GuestFactory.merge({ kind: "plus_one", hostGuestId: guest.id }).create();

		const response = await client
			.visit("inauguration.invitations.respond", { token: guest.token })
			.json({ response: "declined" });

		response.assertOk();
		response.assertBodyContains({ guest: { status: "declined" }, plusOne: null });
		assert.isNull(await Guest.findBy("host_guest_id", guest.id));
		fakeQueueManager.assertNotPushed(SendInvitationConfirmation);
	});

	test("it should reject an invalid rsvp response", async ({ client }) => {
		const guest = await GuestFactory.create();

		const response = await client
			.visit("inauguration.invitations.respond", { token: guest.token })
			// @ts-expect-error invalid value on purpose
			.json({ response: "maybe" });

		response.assertUnprocessableEntity();
	});

	test("it should record consent given then refused", async ({ client, assert }) => {
		const guest = await GuestFactory.create();

		const given = await client
			.visit("inauguration.invitations.consent", { token: guest.token })
			.json({ given: true });
		given.assertOk();
		given.assertBodyContains({ guest: { consent: "given" } });

		const refused = await client
			.visit("inauguration.invitations.consent", { token: guest.token })
			.json({ given: false });
		refused.assertOk();
		refused.assertBodyContains({ guest: { consent: "refused" } });

		await guest.refresh();
		assert.isNull(guest.consentGivenAt);
		assert.isNotNull(guest.consentRefusedAt);
	});

	test("it should create a plus-one and push their invitation job", async ({ client, assert }) => {
		const fakeQueueManager = QueueManager.fake();
		const guest = await GuestFactory.apply("confirmed").create();

		const response = await client
			.visit("inauguration.invitations.update_plus_one", { token: guest.token })
			.json({ firstName: "Ada", lastName: "Lovelace", email: "Ada@Example.com" });

		response.assertOk();
		response.assertBodyContains({
			plusOne: { firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" },
		});
		const plusOne = await Guest.findByOrFail("host_guest_id", guest.id);
		assert.equal(plusOne.kind, "plus_one");
		assert.equal(plusOne.status, "confirmed");
		assert.isAtLeast(plusOne.token.length, 24);
		fakeQueueManager.assertPushed(SendPlusOneInvitation);
	});

	test("it should replace the plus-one with a new token and keep only one", async ({
		client,
		assert,
	}) => {
		QueueManager.fake();
		const guest = await GuestFactory.apply("confirmed").create();

		await client
			.visit("inauguration.invitations.update_plus_one", { token: guest.token })
			.json({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
		const first = await Guest.findByOrFail("host_guest_id", guest.id);

		const response = await client
			.visit("inauguration.invitations.update_plus_one", { token: guest.token })
			.json({ firstName: "Grace", lastName: "Hopper", email: "grace@example.com" });

		response.assertOk();
		const plusOnes = await Guest.query().where("host_guest_id", guest.id);
		assert.lengthOf(plusOnes, 1);
		assert.equal(plusOnes[0].firstName, "Grace");
		assert.notEqual(plusOnes[0].token, first.token);
		assert.isNull(await Guest.find(first.id));
	});

	test("it should remove the plus-one", async ({ client, assert }) => {
		const guest = await GuestFactory.apply("confirmed").create();
		await GuestFactory.merge({ kind: "plus_one", hostGuestId: guest.id }).create();

		const response = await client.visit("inauguration.invitations.delete_plus_one", {
			token: guest.token,
		});

		response.assertOk();
		response.assertBodyContains({ plusOne: null });
		assert.isNull(await Guest.findBy("host_guest_id", guest.id));
	});

	test("it should refuse a plus-one for a guest who has not confirmed", async ({ client }) => {
		const guest = await GuestFactory.create();

		const response = await client
			.visit("inauguration.invitations.update_plus_one", { token: guest.token })
			.json({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });

		response.assertForbidden();
		response.assertBodyContains({ code: "E_PLUS_ONE_NOT_ALLOWED" });
	});

	test("it should refuse a plus-one for a plus-one guest", async ({ client }) => {
		const host = await GuestFactory.apply("confirmed").create();
		const plusOne = await GuestFactory.merge({
			kind: "plus_one",
			status: "confirmed",
			hostGuestId: host.id,
		}).create();

		const response = await client
			.visit("inauguration.invitations.update_plus_one", { token: plusOne.token })
			.json({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });

		response.assertForbidden();
		response.assertBodyContains({ code: "E_PLUS_ONE_NOT_ALLOWED" });
	});

	test("it should refuse a plus-one change after the deadline", async ({ client, cleanup }) => {
		const daysBefore = eventConfig.plusOneDeadlineDaysBefore;
		eventConfig.plusOneDeadlineDaysBefore = 10_000;
		cleanup(() => {
			eventConfig.plusOneDeadlineDaysBefore = daysBefore;
		});
		const guest = await GuestFactory.apply("confirmed").create();

		const view = await client.visit("inauguration.invitations.view", { token: guest.token });
		view.assertBodyContains({ plusOneEditable: false });

		const response = await client
			.visit("inauguration.invitations.update_plus_one", { token: guest.token })
			.json({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });

		response.assertForbidden();
		response.assertBodyContains({ code: "E_PLUS_ONE_DEADLINE_PASSED" });
	});

	test("it should show the host to a plus-one", async ({ client }) => {
		const host = await GuestFactory.apply("confirmed").create();
		const plusOne = await GuestFactory.merge({
			kind: "plus_one",
			status: "confirmed",
			hostGuestId: host.id,
		}).create();

		const response = await client.visit("inauguration.invitations.view", { token: plusOne.token });

		response.assertOk();
		response.assertBodyContains({
			guest: { kind: "plus_one" },
			host: { firstName: host.firstName, lastName: host.lastName },
			plusOne: null,
		});
	});

	test("it should serve the calendar file", async ({ client, assert }) => {
		const guest = await GuestFactory.create();

		const response = await client.visit("inauguration.invitations.calendar", {
			token: guest.token,
		});

		response.assertOk();
		assert.include(response.header("content-type"), "text/calendar");
		assert.include(response.text(), "BEGIN:VCALENDAR");
		assert.include(response.text().replace(/\r\n /g, ""), guest.qrUrl);
	});

	test("it should serve the QR code as PNG", async ({ client, assert }) => {
		const guest = await GuestFactory.create();

		const response = await client.visit("inauguration.invitations.qr_code", { token: guest.token });

		response.assertOk();
		assert.equal(response.header("content-type"), "image/png");
	});

	test("it should not resend anything when the same plus-one is submitted again", async ({
		client,
		assert,
	}) => {
		const fakeQueueManager = QueueManager.fake();
		const guest = await GuestFactory.apply("confirmed").create();
		const visit = () =>
			client.visit("inauguration.invitations.update_plus_one", { token: guest.token });

		await visit().json({ firstName: "Ada", lastName: "Lovelace", email: "ada@example.com" });
		const first = await Guest.findByOrFail("host_guest_id", guest.id);
		const again = await visit().json({
			firstName: " Ada ",
			lastName: "Lovelace",
			email: "ADA@example.com",
		});

		again.assertOk();
		const current = await Guest.findByOrFail("host_guest_id", guest.id);
		assert.equal(current.token, first.token);
		fakeQueueManager.assertPushedCount(1);
		await guest.refresh();
		assert.equal(guest.plusOneChanges, 1);
	});

	test("it should cap the number of plus-one changes", async ({ client, assert }) => {
		const fakeQueueManager = QueueManager.fake();
		const guest = await GuestFactory.apply("confirmed").create();
		const visit = (email: string) =>
			client
				.visit("inauguration.invitations.update_plus_one", { token: guest.token })
				.json({ firstName: "Ada", lastName: "Lovelace", email });

		for (const email of ["a@example.com", "b@example.com", "c@example.com"]) {
			(await visit(email)).assertOk();
		}
		const response = await visit("d@example.com");

		response.assertStatus(429);
		response.assertBodyContains({ code: "E_PLUS_ONE_CHANGE_LIMIT" });
		const plusOne = await Guest.findByOrFail("host_guest_id", guest.id);
		assert.equal(plusOne.email, "c@example.com");
		fakeQueueManager.assertPushedCount(3);
	});

	test("it should erase kept conversations when consent is withdrawn", async ({
		client,
		assert,
	}) => {
		const guest = await GuestFactory.merge({ consentGivenAt: DateTime.now() }).create();
		const conversation = await Conversation.create({
			guestId: guest.id,
			channel: "kiosk",
			startedAt: DateTime.now(),
			endedAt: DateTime.now(),
			transcript: [{ role: "guest", text: "Mon métier", at: new Date().toISOString() }],
			summary: { need: "x", idea: "y", interestLevel: "high", notes: null },
		});

		const response = await client
			.visit("inauguration.invitations.consent", { token: guest.token })
			.json({ given: false });

		response.assertOk();
		await conversation.refresh();
		assert.isNull(conversation.transcript);
		assert.isNull(conversation.summary);
	});
});
