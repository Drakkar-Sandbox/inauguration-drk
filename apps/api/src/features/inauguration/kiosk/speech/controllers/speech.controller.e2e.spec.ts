import { test } from "@japa/runner";

import eventConfig from "#config/event";
import { UserFactory } from "#database/factories/user.factory";

test.group("Features / Inauguration / Kiosk / Speech / Controllers", () => {
	test("it should trigger a cue with an increasing sequence and reset it", async ({
		client,
		assert,
	}) => {
		const user = await UserFactory.create();
		const [cue] = eventConfig.speechCues;

		const triggered = await client
			.visit("inauguration.kiosk.speech.trigger")
			.loginAs(user)
			.json({ cueId: cue.id });
		triggered.assertOk();
		triggered.assertBodyContains({ cue: { id: cue.id } });
		const { sequence } = triggered.body() as { sequence: number };

		const current = await client.visit("inauguration.kiosk.speech.current").loginAs(user);
		current.assertBodyContains({ cue: { id: cue.id }, sequence });

		const reset = await client.visit("inauguration.kiosk.speech.reset").loginAs(user);
		reset.assertOk();
		reset.assertBodyContains({ cue: null });
		assert.isAbove((reset.body() as { sequence: number }).sequence, sequence);
	});

	test("it should reject an unknown cue", async ({ client }) => {
		const user = await UserFactory.create();

		const response = await client
			.visit("inauguration.kiosk.speech.trigger")
			.loginAs(user)
			.json({ cueId: "unknown" });

		response.assertUnprocessableEntity();
	});
});
