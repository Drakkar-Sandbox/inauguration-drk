import { test } from "@japa/runner";

import eventConfig from "#config/event";
import ScriptedLeifBrain from "#features/inauguration/leif/brain/scripted_leif_brain";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import EventService from "#services/event.service";

test.group("Features / Inauguration / Leif / Brain / Scripted", () => {
	const brain = new ScriptedLeifBrain(new LeifLinesService(new EventService()));
	const understand = (text: string) =>
		brain.understandSignup({
			event: eventConfig,
			guestFirstName: "Ada",
			question: "",
			history: [],
			text,
		});

	test("it should extract plus-one details from free text", async ({ assert }) => {
		const result = await understand("Je viens avec marie-claire Dupont, marie@example.com");

		assert.deepInclude(result, {
			intent: "plus_one_details",
			firstName: "Marie-Claire",
			lastName: "Dupont",
			email: "marie@example.com",
		});

		const partial = await understand("son email est marie@example.com");
		assert.deepInclude(partial, { firstName: null, lastName: null, email: "marie@example.com" });
	});

	test("it should recognize closed answers", async ({ assert }) => {
		assert.equal((await understand("Oui, avec plaisir")).intent, "yes");
		assert.equal((await understand("Non merci")).intent, "no");
		assert.equal((await understand("Je ne pourrai pas venir")).intent, "decline_attendance");
		assert.equal((await understand("Quel temps fera-t-il à Tokyo ?")).intent, "other");
	});

	test("it should match a practical question to the FAQ", async ({ assert }) => {
		const index = eventConfig.faq.findIndex((entry) => entry.question.includes("tenue"));

		const result = await understand("Quelle tenue dois-je porter ?");

		assert.equal(result.intent, "faq");
		assert.equal(result.faqIndex, index);
		assert.equal(result.answer, eventConfig.faq[index].answer);
	});

	test("it should start the handoff offer with a capital letter without referent", async ({
		assert,
	}) => {
		const reply = await brain.kioskReply({
			event: eventConfig,
			guest: { firstName: "Ada", company: null },
			angleTopic: null,
			angleNotes: null,
			referentFirstName: null,
			handoffRequested: false,
			transcript: [
				{ role: "guest", text: "Je fais de la logistique.", at: "" },
				{ role: "guest", text: "Intéressant !", at: "" },
			],
		});

		assert.isTrue(reply.offerHandoff);
		assert.isTrue(reply.text.startsWith("Un membre de l'équipe"));
	});
});
