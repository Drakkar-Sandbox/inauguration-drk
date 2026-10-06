import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";

import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";

test.group(
	"Features / Inauguration / Kiosk / Checkin / Controllers / Checkin Controller",
	(group) => {
		group.each.setup(() => testUtils.db().withGlobalTransaction());

		test("it should check the guest in and be idempotent", async ({ client, assert }) => {
			const user = await UserFactory.create();
			const guest = await GuestFactory.create();

			const first = await client
				.visit("inauguration.kiosk.checkin")
				.loginAs(user)
				.json({ token: guest.token });

			first.assertOk();
			first.assertBodyContains({
				guest: { firstName: guest.firstName, lastName: guest.lastName, kind: "primary" },
				alreadyCheckedIn: false,
			});
			await guest.refresh();
			const checkedInAt = guest.checkedInAt?.toISO();
			assert.isDefined(checkedInAt);

			const second = await client
				.visit("inauguration.kiosk.checkin")
				.loginAs(user)
				.json({ token: guest.token });

			second.assertOk();
			second.assertBodyContains({ alreadyCheckedIn: true });
			await guest.refresh();
			assert.equal(guest.checkedInAt?.toISO(), checkedInAt);
		});

		test("it should accept the full invitation URL and show the host of a plus-one", async ({
			client,
		}) => {
			const user = await UserFactory.create();
			const host = await GuestFactory.apply("confirmed").create();
			const plusOne = await GuestFactory.merge({ kind: "plus_one", hostGuestId: host.id }).create();

			const response = await client
				.visit("inauguration.kiosk.checkin")
				.loginAs(user)
				.json({ token: plusOne.qrUrl });

			response.assertOk();
			response.assertBodyContains({
				guest: { kind: "plus_one", hostFirstName: host.firstName },
			});
		});

		test("it should respond with E_GUEST_NOT_FOUND for an unknown token", async ({ client }) => {
			const user = await UserFactory.create();

			const response = await client
				.visit("inauguration.kiosk.checkin")
				.loginAs(user)
				.json({ token: "unknown-token" });

			response.assertNotFound();
			response.assertBodyContains({ code: "E_GUEST_NOT_FOUND" });
		});

		test("it should respond with E_UNAUTHENTICATED when not logged in", async ({ client }) => {
			const response = await client.visit("inauguration.kiosk.checkin").json({ token: "x" });

			response.assertUnauthorized();
			response.assertBodyContains({ code: "E_UNAUTHENTICATED" });
		});

		test("it should search guests by name", async ({ client, assert }) => {
			const user = await UserFactory.create();
			const guest = await GuestFactory.merge({ firstName: "Brunhilde", lastName: "Zyx" }).create();

			const response = await client
				.visit("inauguration.kiosk.search")
				.loginAs(user)
				.qs({ q: "brunhilde zy" });

			response.assertOk();
			const ids = (response.body() as { id: number }[]).map((item) => item.id);
			assert.deepEqual(ids, [guest.id]);
		});
	},
);
