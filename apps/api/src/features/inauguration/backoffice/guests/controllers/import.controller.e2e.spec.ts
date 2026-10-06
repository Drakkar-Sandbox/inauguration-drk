import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";

import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";
import Guest from "#models/guest";

test.group(
	"Features / Inauguration / Backoffice / Guests / Controllers / Import Controller",
	(group) => {
		group.each.setup(() => testUtils.db().withGlobalTransaction());

		test("it should import, upsert by email and report row errors", async ({ client, assert }) => {
			const user = await UserFactory.merge({ email: "referent@drakkar.test" }).create();
			const existing = await GuestFactory.merge({
				email: "known@example.com",
				company: "Old Co",
			}).create();

			const csv = [
				"first_name;last_name;email;company;referent_email;angle_topic;angle_notes",
				"Ada;Lovelace;ada@example.com;Analytical;referent@drakkar.test;IA générative;notes",
				`${existing.firstName};${existing.lastName};KNOWN@example.com;New Co;;;`,
				";Missing;;;;;",
				"Bad;Email;not-an-email;;;;",
				"No;Referent;;;nobody@drakkar.test;;",
			].join("\n");

			const response = await client
				.visit("inauguration.backoffice.guests.import")
				.loginAs(user)
				.file("file", Buffer.from(csv), { filename: "guests.csv", contentType: "text/csv" });

			response.assertOk();
			response.assertBodyContains({ created: 1, updated: 1 });
			const { errors } = response.body() as { errors: { line: number }[] };
			assert.deepEqual(
				errors.map((error) => error.line),
				[4, 5, 6],
			);

			const ada = await Guest.findByOrFail("email", "ada@example.com");
			assert.equal(ada.referentUserId, user.id);
			assert.equal(ada.angleTopic, "IA générative");
			assert.equal(ada.kind, "primary");

			await existing.refresh();
			assert.equal(existing.company, "New Co");
		});

		test("it should report missing required columns", async ({ client }) => {
			const user = await UserFactory.create();

			const response = await client
				.visit("inauguration.backoffice.guests.import")
				.loginAs(user)
				.file("file", Buffer.from("email\nada@example.com\n"), {
					filename: "guests.csv",
					contentType: "text/csv",
				});

			response.assertOk();
			response.assertBodyContains({ created: 0, updated: 0, errors: [{ line: 1 }] });
		});
	},
);
