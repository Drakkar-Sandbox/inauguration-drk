import ace from "@adonisjs/core/services/ace";
import testUtils from "@adonisjs/core/services/test_utils";
import { test } from "@japa/runner";
import { DateTime } from "luxon";

import InaugurationPurge from "#commands/inauguration/purge";
import eventConfig from "#config/event";
import { GuestFactory } from "#database/factories/guest.factory";
import Conversation from "#models/conversation";
import Handoff from "#models/handoff";

test.group("Features / Inauguration / Backoffice / Conversations / Purge command", (group) => {
	group.each.setup(() => testUtils.db().withGlobalTransaction());

	test("it should delete conversations older than the retention period", async ({ assert }) => {
		const guest = await GuestFactory.create();
		const old = DateTime.now().minus({ months: eventConfig.dataRetentionMonths, days: 1 });
		const expired = await Conversation.create({
			guestId: guest.id,
			channel: "kiosk",
			startedAt: old,
			transcript: [{ role: "guest", text: "Ancien", at: old.toISO()! }],
			summary: null,
			createdAt: old,
		});
		const recent = await Conversation.create({
			guestId: guest.id,
			channel: "signup",
			startedAt: DateTime.now(),
			transcript: [],
			summary: null,
		});
		const oldHandoff = await Handoff.create({
			guestId: guest.id,
			reason: "Dernier propos : « secret »",
			status: "done",
			createdAt: old,
		});

		const dryRun = await ace.create(InaugurationPurge, ["--dry-run"]);
		await dryRun.exec();
		dryRun.assertSucceeded();
		assert.isNotNull(await Conversation.find(expired.id));

		const command = await ace.create(InaugurationPurge, []);
		await command.exec();

		command.assertSucceeded();
		assert.isNull(await Conversation.find(expired.id));
		assert.isNotNull(await Conversation.find(recent.id));
		await oldHandoff.refresh();
		assert.notInclude(oldHandoff.reason, "secret");
	});
});
