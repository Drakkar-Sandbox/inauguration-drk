import type { ApplicationService } from "@adonisjs/core/types";
import Anthropic from "@anthropic-ai/sdk";

import AnthropicLeifBrain from "#features/inauguration/leif/brain/anthropic_leif_brain";
import { LeifBrain } from "#features/inauguration/leif/brain/leif_brain";
import ScriptedLeifBrain from "#features/inauguration/leif/brain/scripted_leif_brain";
import LeifLinesService from "#features/inauguration/leif/services/leif_lines.service";
import ElevenLabsLeifVoice from "#features/inauguration/leif/voice/elevenlabs_leif_voice";
import { LeifVoice, SilentLeifVoice } from "#features/inauguration/leif/voice/leif_voice";
import EventService from "#services/event.service";
import env from "#start/env";

/**
 * Picks Leif's brain and voice from the environment. Without API keys the avatar runs
 * in the deterministic scripted mode, text only. Tests swap these bindings with fakes.
 */
export default class LeifProvider {
	constructor(protected app: ApplicationService) {}

	register() {
		this.app.container.singleton(LeifBrain, () => {
			const scripted = new ScriptedLeifBrain(new LeifLinesService(new EventService()));
			const apiKey = env.get("ANTHROPIC_API_KEY");
			if (!apiKey) return scripted;

			return new AnthropicLeifBrain(
				// Short timeout: a slow answer falls back to the scripted line instead.
				new Anthropic({ apiKey, timeout: 8_000, maxRetries: 1 }),
				{
					main: env.get("ANTHROPIC_MODEL") || "claude-sonnet-5-5",
					fast: env.get("ANTHROPIC_FAST_MODEL") || "claude-haiku-4-5",
				},
				scripted,
			);
		});

		this.app.container.singleton(LeifVoice, () => {
			const apiKey = env.get("ELEVENLABS_API_KEY");
			const voiceId = env.get("ELEVENLABS_VOICE_ID");
			if (!apiKey || !voiceId) return new SilentLeifVoice();

			return new ElevenLabsLeifVoice({
				apiKey,
				voiceId,
				ttsModel: env.get("ELEVENLABS_TTS_MODEL") || "eleven_flash_v2_5",
				sttModel: env.get("ELEVENLABS_STT_MODEL") || "scribe_v2",
			});
		});
	}
}
