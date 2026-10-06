import { Exception } from "@adonisjs/core/exceptions";

import { LeifVoice, type SynthesizedSpeech } from "#features/inauguration/leif/voice/leif_voice";

const API_URL = "https://api.elevenlabs.io/v1";
const TIMEOUT_MS = 15_000;

type TimestampsResponse = {
	audio_base64: string;
	alignment: {
		characters: string[];
		character_start_times_seconds: number[];
		character_end_times_seconds: number[];
	} | null;
};

type TranscriptionResponse = {
	text?: string;
};

/**
 * ElevenLabs text-to-speech with timestamps and Scribe speech-to-text.
 * Docs: https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps
 * and https://elevenlabs.io/docs/api-reference/speech-to-text/convert
 */
export default class ElevenLabsLeifVoice extends LeifVoice {
	readonly enabled = true;
	readonly cacheNamespace: string;

	constructor(
		protected config: { apiKey: string; voiceId: string; ttsModel: string; sttModel: string },
	) {
		super();
		this.cacheNamespace = `${config.voiceId}:${config.ttsModel}`;
	}

	async synthesize(text: string): Promise<SynthesizedSpeech> {
		const url = new URL(
			`${API_URL}/text-to-speech/${encodeURIComponent(this.config.voiceId)}/with-timestamps`,
		);
		url.searchParams.set("output_format", "mp3_44100_128");

		const response = await fetch(url, {
			method: "POST",
			headers: { "xi-api-key": this.config.apiKey, "Content-Type": "application/json" },
			body: JSON.stringify({ text, model_id: this.config.ttsModel }),
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		await this.#assertOk(response);

		const body = (await response.json()) as TimestampsResponse;

		return {
			audioBase64: body.audio_base64,
			alignment: {
				characters: body.alignment?.characters ?? [],
				startTimes: body.alignment?.character_start_times_seconds ?? [],
				endTimes: body.alignment?.character_end_times_seconds ?? [],
			},
		};
	}

	async transcribe(audio: Buffer, mimeType: string) {
		const form = new FormData();
		form.set("model_id", this.config.sttModel);
		form.set("language_code", "fr");
		form.set("tag_audio_events", "false");
		form.set("file", new Blob([new Uint8Array(audio)], { type: mimeType }), "audio");

		const response = await fetch(`${API_URL}/speech-to-text`, {
			method: "POST",
			headers: { "xi-api-key": this.config.apiKey },
			body: form,
			signal: AbortSignal.timeout(TIMEOUT_MS),
		});
		await this.#assertOk(response);

		const body = (await response.json()) as TranscriptionResponse;

		return body.text?.trim() || null;
	}

	async #assertOk(response: Response) {
		if (response.ok) return;

		// Body is dropped on purpose: it may echo the submitted text.
		await response.body?.cancel();
		throw new Exception(`ElevenLabs request failed with status ${response.status}`, {
			status: 502,
			code: "E_LEIF_VOICE_UNAVAILABLE",
		});
	}
}
