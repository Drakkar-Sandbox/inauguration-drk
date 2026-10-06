/**
 * Character-level timing of a synthesized line (subtitles + lip-sync), in seconds.
 */
export type SpeechAlignment = {
	characters: string[];
	startTimes: number[];
	endTimes: number[];
};

export type SynthesizedSpeech = {
	/** MP3 audio, base64 encoded. */
	audioBase64: string;
	alignment: SpeechAlignment;
};

/**
 * Leif's voice. Implementations: ElevenLabs (when `ELEVENLABS_API_KEY` and
 * `ELEVENLABS_VOICE_ID` are set) and a silent one (text only).
 */
export abstract class LeifVoice {
	abstract readonly enabled: boolean;

	/**
	 * Identifies what a given text sounds like (voice + model), for the speech cache.
	 */
	abstract readonly cacheNamespace: string | null;

	abstract synthesize(text: string): Promise<SynthesizedSpeech | null>;

	/**
	 * Transcribes French speech. The audio stays in memory and is dropped afterwards.
	 */
	abstract transcribe(audio: Buffer, mimeType: string): Promise<string | null>;
}

export class SilentLeifVoice extends LeifVoice {
	readonly enabled = false;
	readonly cacheNamespace = null;

	async synthesize() {
		return null;
	}

	async transcribe() {
		return null;
	}
}
