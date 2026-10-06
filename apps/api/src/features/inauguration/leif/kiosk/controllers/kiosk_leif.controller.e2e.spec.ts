import app from "@adonisjs/core/services/app";
import testUtils from "@adonisjs/core/services/test_utils";
import redis from "@adonisjs/redis/services/main";
import { test } from "@japa/runner";
import { DateTime } from "luxon";

import { GuestFactory } from "#database/factories/guest.factory";
import { UserFactory } from "#database/factories/user.factory";
import {
	type KioskContext,
	type KioskReply,
	LeifBrain,
} from "#features/inauguration/leif/brain/leif_brain";
import ScriptedLeifBrain from "#features/inauguration/leif/brain/scripted_leif_brain";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import { LeifVoice, SilentLeifVoice } from "#features/inauguration/leif/voice/leif_voice";
import Conversation, { type ConversationSummary } from "#models/conversation";
import Handoff from "#models/handoff";
import EventService from "#services/event.service";

type Turn = {
	sessionId: string;
	reply: { text: string };
	offerHandoff: boolean;
	referentFirstName: string | null;
	choices: { value: string }[];
};

/**
 * Brain standing for the LLM: records what it was given.
 */
class FakeBrain extends ScriptedLeifBrain {
	contexts: KioskContext[] = [];
	reply = "Une piste : un assistant qui prépare vos chiffrages clients.";

	constructor() {
		super(new LeifLinesService(new EventService()));
	}

	async kioskReply(context: KioskContext): Promise<KioskReply> {
		this.contexts.push(context);
		return { text: this.reply, offerHandoff: true };
	}

	async summarizeKiosk(): Promise<ConversationSummary> {
		return {
			need: "Devis plus rapides",
			idea: "Assistant devis",
			interestLevel: "high",
			notes: null,
		};
	}
}

test.group("Features / Inauguration / Leif / Kiosk / Controllers", (group) => {
	let brain: FakeBrain;

	group.each.setup(async () => {
		const keys = await redis.keys("inauguration:leif:*");
		if (keys.length > 0) await redis.del(keys);
		brain = new FakeBrain();
		app.container.swap(LeifBrain, () => brain);
		app.container.swap(LeifVoice, () => new SilentLeifVoice());

		return testUtils.db().withGlobalTransaction();
	});
	group.each.teardown(() => {
		app.container.restore(LeifBrain);
		app.container.restore(LeifVoice);
	});

	test("it should run a session, hand over to the referent and store the summary with consent", async ({
		client,
		assert,
	}) => {
		const staff = await UserFactory.create();
		const referent = await UserFactory.merge({ name: "Camille Martin" }).create();
		const guest = await GuestFactory.merge({
			referentUserId: referent.id,
			consentGivenAt: DateTime.now(),
			angleTopic: "Automatisation des devis",
			angleNotes: "Très intéressé par l'IA générative depuis le salon de mars.",
		}).create();

		const started = await client
			.visit("inauguration.kiosk.leif.start_session")
			.loginAs(staff)
			.json({ token: guest.qrUrl });
		started.assertOk();
		const { sessionId, reply } = started.body() as Turn;
		assert.include(reply.text, guest.firstName);
		assert.notInclude(JSON.stringify(started.body()), "salon de mars");

		const message = await client
			.visit("inauguration.kiosk.leif.message", { id: sessionId })
			.loginAs(staff)
			.json({ text: "Je dirige une PME de menuiserie, les devis nous prennent un temps fou." });
		message.assertOk();
		message.assertBodyContains({ offerHandoff: true, referentFirstName: "Camille" });
		assert.deepEqual(
			(message.body() as Turn).choices.map((choice) => choice.value),
			["handoff"],
		);
		assert.equal(brain.contexts[0].angleTopic, "Automatisation des devis");
		assert.equal(brain.contexts[0].transcript.at(-1)?.role, "guest");

		const handoff = await client
			.visit("inauguration.kiosk.leif.handoff", { id: sessionId })
			.loginAs(staff);
		handoff.assertOk();
		handoff.assertBodyContains({ handoffRequested: true });
		assert.include((handoff.body() as Turn).reply.text, "Camille");
		// Idempotent.
		await client.visit("inauguration.kiosk.leif.handoff", { id: sessionId }).loginAs(staff);

		const ended = await client
			.visit("inauguration.kiosk.leif.end_session", { id: sessionId })
			.loginAs(staff);
		ended.assertOk();
		ended.assertBodyContains({ stored: true, handoffRequested: true });

		const conversation = await Conversation.query()
			.where("guest_id", guest.id)
			.where("channel", "kiosk")
			.firstOrFail();
		assert.lengthOf(conversation.transcript!, 4);
		assert.deepEqual(conversation.summary, {
			need: "Devis plus rapides",
			idea: "Assistant devis",
			interestLevel: "high",
			notes: null,
		});

		const handoffs = await Handoff.query().where("guest_id", guest.id);
		assert.lengthOf(handoffs, 1);
		assert.equal(handoffs[0].status, "pending");
		assert.equal(handoffs[0].referentUserId, referent.id);
		assert.equal(handoffs[0].conversationId, conversation.id);

		const again = await client
			.visit("inauguration.kiosk.leif.message", { id: sessionId })
			.loginAs(staff)
			.json({ text: "Encore là ?" });
		again.assertNotFound();
		again.assertBodyContains({ code: "E_LEIF_SESSION_NOT_FOUND" });
	});

	test("it should store no transcript nor summary without consent but keep the handoff", async ({
		client,
		assert,
	}) => {
		const staff = await UserFactory.create();
		const guest = await GuestFactory.create();

		const started = await client
			.visit("inauguration.kiosk.leif.start_session")
			.loginAs(staff)
			.json({ token: guest.token });
		const { sessionId } = started.body() as Turn;
		await client
			.visit("inauguration.kiosk.leif.message", { id: sessionId })
			.loginAs(staff)
			.json({ text: "Je travaille dans la logistique." });
		await client.visit("inauguration.kiosk.leif.handoff", { id: sessionId }).loginAs(staff);

		const ended = await client
			.visit("inauguration.kiosk.leif.end_session", { id: sessionId })
			.loginAs(staff);
		ended.assertOk();
		ended.assertBodyContains({ stored: false, handoffRequested: true });

		const conversation = await Conversation.query().where("guest_id", guest.id).firstOrFail();
		assert.isNull(conversation.transcript);
		assert.isNull(conversation.summary);
		assert.isNotNull(conversation.endedAt);

		const handoff = await Handoff.query().where("guest_id", guest.id).firstOrFail();
		assert.notInclude(handoff.reason, "logistique");
	});

	test("it should greet a plus-one with their host name, text only without voice", async ({
		client,
		assert,
	}) => {
		const staff = await UserFactory.create();
		const host = await GuestFactory.apply("confirmed").create();
		const plusOne = await GuestFactory.merge({
			kind: "plus_one",
			status: "confirmed",
			hostGuestId: host.id,
		}).create();

		const response = await client
			.visit("inauguration.kiosk.leif.greeting")
			.loginAs(staff)
			.json({ token: plusOne.token });

		response.assertOk();
		response.assertBodyContains({ guest: { firstName: plusOne.firstName }, audio: null });
		const { reply } = response.body() as { reply: { text: string } };
		assert.include(reply.text, plusOne.firstName);
		assert.include(reply.text, host.firstName);
	});

	test("it should require a staff session", async ({ client }) => {
		const guest = await GuestFactory.create();

		const response = await client
			.visit("inauguration.kiosk.leif.start_session")
			.json({ token: guest.token });

		response.assertUnauthorized();
	});

	test("it should respond with E_GUEST_NOT_FOUND for an unknown QR code", async ({ client }) => {
		const staff = await UserFactory.create();

		const response = await client
			.visit("inauguration.kiosk.leif.start_session")
			.loginAs(staff)
			.json({ token: "unknown" });

		response.assertNotFound();
		response.assertBodyContains({ code: "E_GUEST_NOT_FOUND" });
	});

	test("it should replace AI replies that talk money or quote the angle notes", async ({
		client,
		assert,
	}) => {
		const staff = await UserFactory.create();
		const guest = await GuestFactory.merge({
			angleNotes: "Très intéressé par l'IA générative depuis le salon de mars.",
		}).create();
		const started = await client
			.visit("inauguration.kiosk.leif.start_session")
			.loginAs(staff)
			.json({ guestId: guest.id });
		const { sessionId } = started.body() as Turn;
		const send = async (reply: string) => {
			brain.reply = reply;
			const response = await client
				.visit("inauguration.kiosk.leif.message", { id: sessionId })
				.loginAs(staff)
				.json({ text: "Et donc ?" });
			response.assertOk();
			return response.body() as Turn;
		};

		const leak = await send("Vous êtes très intéressé par l'IA GENERATIVE depuis le salon !");
		assert.notInclude(leak.reply.text.toLowerCase(), "salon");
		assert.isTrue(leak.offerHandoff);

		const price = await send("Comptez environ 15 k€ pour un prototype.");
		assert.notInclude(price.reply.text, "€");

		const fine = await send("Une piste : trier automatiquement vos demandes.");
		assert.equal(fine.reply.text, "Une piste : trier automatiquement vos demandes.");
	});
});
