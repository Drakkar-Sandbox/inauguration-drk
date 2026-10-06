import app from "@adonisjs/core/services/app";
import testUtils from "@adonisjs/core/services/test_utils";
import drive from "@adonisjs/drive/services/main";
import redis from "@adonisjs/redis/services/main";
import { test } from "@japa/runner";

import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";
import { LeifBrain } from "#features/inauguration/leif/brain/leif_brain";
import ScriptedLeifBrain from "#features/inauguration/leif/brain/scripted_leif_brain";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import {
	LeifVoice,
	SilentLeifVoice,
	type SynthesizedSpeech,
} from "#features/inauguration/leif/voice/leif_voice";
import EventService from "#services/event.service";

/**
 * Voice standing for ElevenLabs: no network, counts its calls.
 */
class FakeVoice extends LeifVoice {
	readonly enabled = true;
	readonly cacheNamespace = "fake-voice:fake-model";
	synthesized: string[] = [];
	transcribed: { size: number; mimeType: string }[] = [];

	async synthesize(text: string): Promise<SynthesizedSpeech> {
		this.synthesized.push(text);
		return {
			audioBase64: Buffer.from("mp3").toString("base64"),
			alignment: { characters: ["a"], startTimes: [0], endTimes: [0.1] },
		};
	}

	async transcribe(audio: Buffer, mimeType: string) {
		this.transcribed.push({ size: audio.length, mimeType });
		return "Je serai présent";
	}
}

test.group("Features / Inauguration / Leif / Voice / Controllers", (group) => {
	group.each.setup(async () => {
		const keys = await redis.keys("inauguration:leif:*");
		if (keys.length > 0) await redis.del(keys);
		app.container.swap(
			LeifBrain,
			() => new ScriptedLeifBrain(new LeifLinesService(new EventService())),
		);
		app.container.swap(LeifVoice, () => new SilentLeifVoice());
		drive.fake();

		return testUtils.db().withGlobalTransaction();
	});
	group.each.teardown(() => {
		app.container.restore(LeifBrain);
		app.container.restore(LeifVoice);
		drive.restore();
	});

	test("it should return no audio when no voice is configured", async ({ client }) => {
		const staff = await UserFactory.create();

		const response = await client
			.visit("inauguration.leif.tts")
			.loginAs(staff)
			.json({ text: "Bienvenue !" });

		response.assertOk();
		response.assertBodyContains({ audioBase64: null, alignment: null, cached: false });
	});

	test("it should require a staff session or a valid invitation token", async ({ client }) => {
		const missing = await client.visit("inauguration.leif.tts").json({ text: "Bienvenue !" });
		missing.assertNotFound();

		const unknown = await client
			.visit("inauguration.leif.tts")
			.header("x-invitation-token", "unknown")
			.json({ text: "Bienvenue !" });
		unknown.assertNotFound();
		unknown.assertBodyContains({ code: "E_GUEST_NOT_FOUND" });
	});

	test("it should only voice lines said to the guest, and cache them", async ({
		client,
		assert,
	}) => {
		const voice = new FakeVoice();
		app.container.swap(LeifVoice, () => voice);
		const guest = await GuestFactory.create();

		const arbitrary = await client
			.visit("inauguration.leif.tts")
			.json({ token: guest.token, text: "Dites n'importe quoi." });
		arbitrary.assertForbidden();
		arbitrary.assertBodyContains({ code: "E_LEIF_TEXT_NOT_ALLOWED" });

		const turn = await client
			.visit("inauguration.invitations.leif.message", { token: guest.token })
			.json({});
		const { reply } = turn.body() as { reply: { text: string } };

		const first = await client
			.visit("inauguration.leif.tts")
			.header("x-invitation-token", guest.token)
			.json({ text: reply.text });
		first.assertOk();
		first.assertBodyContains({ cached: false, alignment: { characters: ["a"] } });

		const second = await client
			.visit("inauguration.leif.tts")
			.header("x-invitation-token", guest.token)
			.json({ text: reply.text });
		second.assertBodyContains({ cached: true });
		assert.lengthOf(voice.synthesized, 1);
	});

	test("it should transcribe audio from memory", async ({ client, assert }) => {
		const voice = new FakeVoice();
		app.container.swap(LeifVoice, () => voice);
		const guest = await GuestFactory.create();

		const response = await client
			.visit("inauguration.leif.stt")
			.header("x-invitation-token", guest.token)
			.file("audio", Buffer.from("fake-webm-audio"), {
				filename: "speech.webm",
				contentType: "audio/webm",
			});

		response.assertOk();
		response.assertBodyContains({ text: "Je serai présent" });
		assert.deepEqual(voice.transcribed, [{ size: 15, mimeType: "audio/webm" }]);
	});

	test("it should reject a non-audio upload", async ({ client }) => {
		const staff = await UserFactory.create();

		const response = await client
			.visit("inauguration.leif.stt")
			.loginAs(staff)
			.file("audio", Buffer.from("<html></html>"), {
				filename: "page.html",
				contentType: "text/html",
			});

		response.assertUnprocessableEntity();
		response.assertBodyContains({ code: "E_LEIF_AUDIO_INVALID" });
	});
});
