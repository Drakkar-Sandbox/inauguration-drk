import { createHash } from "node:crypto";

import { inject } from "@adonisjs/core";
import drive from "@adonisjs/drive/services/main";

import { LeifVoice, type SynthesizedSpeech } from "#features/inauguration/leif/voice/leif_voice";

/**
 * Text-to-speech with a persistent cache (Drive), keyed by voice, model and text, so
 * repeated lines (greetings, speech cues) are synthesized once — and can be
 * pre-generated before day J with `node ace leif:pregenerate`.
 */
@inject()
export default class LeifSpeechService {
	constructor(protected voice: LeifVoice) {}

	get enabled() {
		return this.voice.enabled;
	}

	async cached(text: string): Promise<SynthesizedSpeech | null> {
		const key = this.#cacheKey(text);
		if (!key) return null;

		const disk = drive.use();
		if (!(await disk.exists(key))) return null;

		return JSON.parse(await disk.get(key)) as SynthesizedSpeech;
	}

	/**
	 * Returns the cached speech or synthesizes (and caches) it. Null when the voice is disabled.
	 */
	async speak(text: string) {
		const cached = await this.cached(text);
		if (cached) return { speech: cached, cached: true };

		const key = this.#cacheKey(text);
		const speech = await this.voice.synthesize(text.trim());
		if (!key || !speech) return { speech: null, cached: false };

		await drive.use().put(key, JSON.stringify(speech));

		return { speech, cached: false };
	}

	transcribe(audio: Buffer, mimeType: string) {
		return this.voice.transcribe(audio, mimeType);
	}

	#cacheKey(text: string) {
		if (!this.voice.cacheNamespace) return null;

		const hash = createHash("sha256")
			.update(`${this.voice.cacheNamespace}\n${text.trim()}`)
			.digest("hex");

		return `leif/tts/${hash}.json`;
	}
}
