import ace from "@adonisjs/core/services/ace";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";

import KioskCreateUser from "#commands/kiosk/create_user";
import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";
import User from "#models/user";

test.group("Features / Inauguration / Kiosk / Access", (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test("it should restrict a kiosk account to the kiosk routes", async ({ client }) => {
		const kiosk = await UserFactory.merge({ role: "kiosk" }).create();

		const backoffice = await client.visit("inauguration.backoffice.guests.list").loginAs(kiosk);
		backoffice.assertForbidden();
		backoffice.assertBodyContains({ code: "E_AUTHORIZATION_FAILURE" });

		const dashboard = await client.visit("inauguration.backoffice.dashboard.view").loginAs(kiosk);
		dashboard.assertForbidden();

		const updateProfile = await client
			.visit("web.account_management.profile.update")
			.loginAs(kiosk)
			.json({ name: "Hacked" });
		updateProfile.assertForbidden();

		const me = await client.visit("web.account_management.profile.view").loginAs(kiosk);
		me.assertOk();
		me.assertBodyContains({ role: "kiosk" });

		const cues = await client.visit("inauguration.kiosk.speech.cues").loginAs(kiosk);
		cues.assertOk();
	});

	test("it should keep admins on every staff route", async ({ client }) => {
		const admin = await UserFactory.create();

		const backoffice = await client.visit("inauguration.backoffice.guests.list").loginAs(admin);
		backoffice.assertOk();

		const me = await client.visit("web.account_management.profile.view").loginAs(admin);
		me.assertBodyContains({ role: "admin" });
	});

	test("it should check a guest in by id after a manual search, without exposing tokens", async ({
		client,
		assert,
	}) => {
		const kiosk = await UserFactory.merge({ role: "kiosk" }).create();
		const guest = await GuestFactory.merge({ lastName: "Zyxwvutsr" }).create();

		const search = await client
			.visit("inauguration.kiosk.search")
			.loginAs(kiosk)
			.qs({ q: "Zyxwvutsr" });
		search.assertOk();
		const [found] = search.body() as { id: number }[];
		assert.equal(found.id, guest.id);
		assert.notInclude(JSON.stringify(search.body()), guest.token);

		const checkin = await client
			.visit("inauguration.kiosk.checkin")
			.loginAs(kiosk)
			.json({ guestId: found.id });
		checkin.assertOk();
		checkin.assertBodyContains({ guest: { id: guest.id }, alreadyCheckedIn: false });
		assert.notInclude(JSON.stringify(checkin.body()), guest.token);

		const neither = await client.visit("inauguration.kiosk.checkin").loginAs(kiosk).json({});
		neither.assertUnprocessableEntity();
	});

	test("it should create a kiosk account from the command line", async ({ assert }) => {
		const command = await ace.create(KioskCreateUser, ["borne-1@example.com", "a-long-password!"]);
		await command.exec();

		command.assertSucceeded();
		const user = await User.findByOrFail("email", "borne-1@example.com");
		assert.equal(user.role, "kiosk");
		assert.notEqual(user.password, "a-long-password!");

		const weak = await ace.create(KioskCreateUser, ["borne-2@example.com", "short"]);
		await weak.exec();
		weak.assertFailed();
	});

	test("it should not lock out polling staff devices sharing one IP", async ({ client }) => {
		const kiosk = await UserFactory.merge({ role: "kiosk" }).create();

		for (let index = 0; index < 120; index++) {
			const response = await client.visit("inauguration.kiosk.speech.current").loginAs(kiosk);
			response.assertOk();
		}
	});
});
