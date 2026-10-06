import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";

import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";
import Conversation from "#models/conversation";
import Guest from "#models/guest";
import Handoff from "#models/handoff";

test.group("Features / Inauguration / Backoffice / Guests / Controllers", (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test("it should create, update, filter, view and delete a guest", async ({ client, assert }) => {
		const user = await UserFactory.create();

		const created = await client
			.visit("inauguration.backoffice.guests.create")
			.loginAs(user)
			.json({ firstName: "Ada", lastName: "Lovelace", email: "ADA@example.com" });
		created.assertCreated();
		const { id } = created.body() as { id: number };

		const updated = await client
			.visit("inauguration.backoffice.guests.update", { id })
			.loginAs(user)
			.json({
				referentUserId: user.id,
				angleTopic: "Agents IA",
				meetingStatus: "to_propose",
				status: "confirmed",
			});
		updated.assertOk();
		updated.assertBodyContains({
			email: "ada@example.com",
			referent: { id: user.id },
			angleTopic: "Agents IA",
			meetingStatus: "to_propose",
			status: "confirmed",
		});

		const list = await client
			.visit("inauguration.backoffice.guests.list")
			.loginAs(user)
			.qs({ status: "confirmed", referentUserId: user.id, search: "lovelace" });
		list.assertOk();
		list.assertBodyContains({ data: [{ id }], meta: { total: 1 } });

		const conversation = await Conversation.create({
			guestId: id,
			channel: "kiosk",
			startedAt: (await Guest.findOrFail(id)).createdAt,
			transcript: [{ role: "guest", text: "Bonjour", at: new Date().toISOString() }],
			summary: { need: "Automatiser", idea: "Agent", interestLevel: "high", notes: null },
		});
		await Handoff.create({ guestId: id, conversationId: conversation.id, reason: "RDV" });

		const view = await client.visit("inauguration.backoffice.guests.view", { id }).loginAs(user);
		view.assertOk();
		view.assertBodyContains({
			id,
			conversations: [{ id: conversation.id, summary: { interestLevel: "high" } }],
			handoffs: [{ reason: "RDV", status: "pending" }],
		});

		const removed = await client
			.visit("inauguration.backoffice.guests.delete", { id })
			.loginAs(user);
		removed.assertNoContent();
		assert.isNull(await Guest.find(id));
	});

	test("it should export guests as CSV and QR codes", async ({ client, assert }) => {
		const user = await UserFactory.create();
		const guest = await GuestFactory.merge({ lastName: "=Danger" }).create();

		const csv = await client.visit("inauguration.backoffice.guests.export").loginAs(user);
		csv.assertOk();
		assert.include(csv.header("content-type"), "text/csv");
		assert.include(csv.header("content-disposition"), "attachment");
		assert.include(csv.text(), "'=Danger");

		const svg = await client
			.visit("inauguration.backoffice.guests.qr_svg", { id: guest.id })
			.loginAs(user);
		svg.assertOk();
		assert.equal(svg.header("content-type"), "image/svg+xml");

		const png = await client
			.visit("inauguration.backoffice.guests.qr_png", { id: guest.id })
			.loginAs(user);
		png.assertOk();
		assert.equal(png.header("content-type"), "image/png");

		const sheet = await client.visit("inauguration.backoffice.guests.qr_sheet").loginAs(user);
		sheet.assertOk();
		const entry = (sheet.body() as { guest: { id: number }; url: string; qrSvg: string }[]).find(
			(item) => item.guest.id === guest.id,
		);
		assert.equal(entry?.url, guest.qrUrl);
		assert.include(entry?.qrSvg, "<svg");
	});

	test("it should return dashboard stats and manage handoffs", async ({ client }) => {
		const user = await UserFactory.create();
		const guest = await GuestFactory.merge({ checkedInAt: null }).apply("confirmed").create();
		const handoff = await Handoff.create({
			guestId: guest.id,
			referentUserId: user.id,
			reason: "Souhaite un RDV",
		});

		const stats = await client.visit("inauguration.backoffice.dashboard.view").loginAs(user);
		stats.assertOk();
		stats.assertBodyContains({
			guests: { total: 1, confirmed: 1 },
			handoffs: { pending: 1, seen: 0, done: 0 },
		});

		const mine = await client
			.visit("inauguration.backoffice.handoffs.list")
			.loginAs(user)
			.qs({ mine: true, status: "pending" });
		mine.assertOk();
		mine.assertBodyContains([{ id: handoff.id, guest: { id: guest.id } }]);

		const updated = await client
			.visit("inauguration.backoffice.handoffs.update", { id: handoff.id })
			.loginAs(user)
			.json({ status: "done" });
		updated.assertOk();
		updated.assertBodyContains({ status: "done" });
	});

	test("it should respond with E_UNAUTHENTICATED when not logged in", async ({ client }) => {
		const response = await client.visit("inauguration.backoffice.guests.list");

		response.assertUnauthorized();
		response.assertBodyContains({ code: "E_UNAUTHENTICATED" });
	});

	test("it should remove the plus-one when staff mark the host as declined", async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const host = await GuestFactory.apply("confirmed").create();
		await GuestFactory.merge({
			kind: "plus_one",
			status: "confirmed",
			hostGuestId: host.id,
		}).create();

		const response = await client
			.visit("inauguration.backoffice.guests.update", { id: host.id })
			.loginAs(user)
			.json({ status: "declined", company: "Analytical Engines" });

		response.assertOk();
		await host.refresh();
		assert.equal(host.status, "declined");
		assert.equal(host.company, "Analytical Engines");
		assert.isNotNull(host.respondedAt);
		assert.isNull(await Guest.findBy("host_guest_id", host.id));
	});
});
