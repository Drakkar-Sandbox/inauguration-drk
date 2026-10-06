import logger from "@adonisjs/core/services/logger";
import Anthropic from "@anthropic-ai/sdk";
import vine from "@vinejs/vine";

import eventConfig from "#config/event";
import {
	type KioskContext,
	type KioskReply,
	LeifBrain,
	SIGNUP_INTENTS,
	type SignupUnderstandInput,
	type SignupUnderstanding,
} from "#features/inauguration/leif/brain/leif_brain";
import {
	kioskSummarySystemPrompt,
	kioskSummaryUserPrompt,
	kioskSystemPrompt,
	kioskUserPrompt,
	signupSystemPrompt,
	signupUserPrompt,
} from "#features/inauguration/leif/brain/leif_prompts";
import type ScriptedLeifBrain from "#features/inauguration/leif/brain/scripted_leif_brain";
import { type ConversationSummary, INTEREST_LEVELS } from "#models/conversation";

const nullable = (schema: Record<string, unknown>) => ({ anyOf: [schema, { type: "null" }] });

const SIGNUP_SCHEMA = {
	type: "object",
	properties: {
		intent: { type: "string", enum: [...SIGNUP_INTENTS] },
		firstName: nullable({ type: "string" }),
		lastName: nullable({ type: "string" }),
		email: nullable({ type: "string" }),
		faqIndex: nullable({ type: "integer" }),
		answer: nullable({ type: "string" }),
	},
	required: ["intent", "firstName", "lastName", "email", "faqIndex", "answer"],
	additionalProperties: false,
};

const KIOSK_REPLY_SCHEMA = {
	type: "object",
	properties: { text: { type: "string" }, offerHandoff: { type: "boolean" } },
	required: ["text", "offerHandoff"],
	additionalProperties: false,
};

const SUMMARY_SCHEMA = {
	type: "object",
	properties: {
		need: nullable({ type: "string" }),
		idea: nullable({ type: "string" }),
		interestLevel: { type: "string", enum: [...INTEREST_LEVELS] },
		notes: nullable({ type: "string" }),
	},
	required: ["need", "idea", "interestLevel", "notes"],
	additionalProperties: false,
};

const signupValidator = vine.create({
	intent: vine.enum(SIGNUP_INTENTS),
	firstName: vine.string().maxLength(100).nullable(),
	lastName: vine.string().maxLength(100).nullable(),
	email: vine.string().maxLength(254).nullable(),
	faqIndex: vine
		.number()
		.withoutDecimals()
		.min(0)
		.max(Math.max(eventConfig.faq.length - 1, 0))
		.nullable(),
	answer: vine.string().maxLength(600).nullable(),
});

const kioskReplyValidator = vine.create({
	text: vine.string().minLength(1).maxLength(600),
	offerHandoff: vine.boolean(),
});

const summaryValidator = vine.create({
	need: vine.string().maxLength(2000).nullable(),
	idea: vine.string().maxLength(2000).nullable(),
	interestLevel: vine.enum(INTEREST_LEVELS),
	notes: vine.string().maxLength(2000).nullable(),
});

/**
 * Leif powered by Claude. Every output is constrained by a JSON schema and validated
 * again here; any failure (network, refusal, invalid output) falls back to the scripted
 * brain so the dialogue never breaks. Guest texts are never logged.
 */
export default class AnthropicLeifBrain extends LeifBrain {
	readonly mode = "ai" as const;

	constructor(
		protected client: Anthropic,
		protected models: { main: string; fast: string },
		protected fallback: ScriptedLeifBrain,
	) {
		super();
	}

	async understandSignup(input: SignupUnderstandInput): Promise<SignupUnderstanding> {
		try {
			const output = await this.#generate({
				model: this.models.fast,
				system: signupSystemPrompt(input.event),
				user: signupUserPrompt({ ...input, avatarName: input.event.avatarName }),
				schema: SIGNUP_SCHEMA,
				maxTokens: 400,
			});
			const understanding = await signupValidator.validate(output);

			return this.#hasLeak(understanding.answer)
				? { ...understanding, answer: null }
				: understanding;
		} catch (error) {
			this.#warn("understandSignup", error);
			return this.fallback.understandSignup(input);
		}
	}

	async kioskReply(context: KioskContext): Promise<KioskReply> {
		try {
			const output = await this.#generate({
				model: this.models.main,
				system: kioskSystemPrompt(context.event),
				user: kioskUserPrompt(context),
				schema: KIOSK_REPLY_SCHEMA,
				maxTokens: 400,
			});
			const reply = await kioskReplyValidator.validate(output);
			if (this.#hasLeak(reply.text, context.angleNotes)) return this.fallback.kioskReply(context);

			return reply;
		} catch (error) {
			this.#warn("kioskReply", error);
			return this.fallback.kioskReply(context);
		}
	}

	async summarizeKiosk(context: KioskContext): Promise<ConversationSummary> {
		try {
			const output = await this.#generate({
				model: this.models.main,
				system: kioskSummarySystemPrompt(context.event),
				user: kioskSummaryUserPrompt(context),
				schema: SUMMARY_SCHEMA,
				maxTokens: 800,
			});

			return await summaryValidator.validate(output);
		} catch (error) {
			this.#warn("summarizeKiosk", error);
			return this.fallback.summarizeKiosk(context);
		}
	}

	async #generate(request: {
		model: string;
		system: string;
		user: string;
		schema: Record<string, unknown>;
		maxTokens: number;
	}): Promise<unknown> {
		const isHaiku = request.model.startsWith("claude-haiku");

		const response = await this.client.messages.create({
			model: request.model,
			max_tokens: request.maxTokens,
			system: [{ type: "text", text: request.system, cache_control: { type: "ephemeral" } }],
			messages: [{ role: "user", content: request.user }],
			output_config: {
				// Short, latency-sensitive answers: lowest effort (Haiku has no effort setting).
				...(isHaiku ? {} : { effort: "low" as const }),
				format: { type: "json_schema", schema: request.schema },
			},
			// Sonnet 5.5 can skip thinking entirely, which keeps spoken replies under 2 s.
			...(request.model.startsWith("claude-sonnet-5-5")
				? { thinking: { type: "between_tools" as const } }
				: {}),
		});

		if (response.stop_reason !== "end_turn") {
			throw new Error(`Unexpected stop reason: ${response.stop_reason}`);
		}
		const text = response.content.find((block) => block.type === "text")?.text;
		if (!text) throw new Error("Empty response");

		return JSON.parse(text);
	}

	/**
	 * Last-resort output filter: no prices and no verbatim angle notes on screen.
	 */
	#hasLeak(text: string | null, angleNotes?: string | null) {
		if (!text) return false;
		if (/\d\s?(€|euros?|k€)|\b(tarif|devis)\b/i.test(text)) return true;

		return Boolean(angleNotes && angleNotes.length >= 20 && text.includes(angleNotes));
	}

	#warn(operation: string, error: unknown) {
		const reason =
			error instanceof Anthropic.APIError
				? `${error.status ?? "network"} ${error.name}`
				: error instanceof Error
					? error.name
					: "unknown";
		logger.warn({ operation, reason }, "Leif brain fell back to the scripted mode");
	}
}
