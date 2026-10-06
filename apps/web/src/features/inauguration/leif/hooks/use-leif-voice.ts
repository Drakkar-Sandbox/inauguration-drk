import { useCallback, useEffect, useRef, useState } from "react";

import type { LeifSubtitleWord } from "@workspace/ui-react/components/leif-subtitles";

import type { SynthesizedSpeech } from "#/features/inauguration/leif/types";
import {
	analyserLevel,
	decodeBase64,
	getAudioContext,
	prefersReducedMotion,
} from "#/features/inauguration/leif/utils/audio";
import { estimateWords, wordsFromSpeech } from "#/features/inauguration/leif/utils/subtitles";

const SYNTHESIS_TIMEOUT_MS = 6_000;
const TAIL_MS = 350;

export type LeifLine = {
	id: number;
	text: string;
	/** Word timings; empty when the line is shown at once (reduced motion). */
	words: LeifSubtitleWord[];
};

type SpeakOptions = {
	/** Already synthesized speech (kiosk greeting); `null` forces the text-only mode. */
	speech?: SynthesizedSpeech | null;
	/**
	 * Text to synthesize when it differs from the displayed one (public signup: only the server's
	 * `spoken` variant may be voiced). Subtitles then show the displayed text without word timing.
	 */
	voicedText?: string;
};

type UseLeifVoiceParams = {
	/** Synthesizes a line. Resolve `null` (or reject) to fall back to text only. */
	synthesize: (text: string) => Promise<SynthesizedSpeech | null>;
	/** Never play audio (guest entered without sound). Subtitles keep their rhythm. */
	muted?: boolean;
};

type Playback = { cancel: () => void };

/**
 * Leif's voice: plays a synthesized line through Web Audio, drives the avatar mouth from the
 * signal level and the subtitles from the alignment. Without audio (no voice configured, muted,
 * autoplay still locked, network failure) the line is revealed at reading pace instead, so every
 * surface behaves the same with or without the voice.
 */
export function useLeifVoice(params: UseLeifVoiceParams) {
	const { synthesize, muted = false } = params;

	const [line, setLine] = useState<LeifLine | null>(null);
	const [preparing, setPreparing] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [currentTimeMs, setCurrentTimeMs] = useState(0);
	const [mouthOpenness, setMouthOpenness] = useState(0);

	const generation = useRef(0);
	const playback = useRef<Playback | null>(null);
	const synthesizeRef = useRef(synthesize);
	synthesizeRef.current = synthesize;
	const mutedRef = useRef(muted);
	mutedRef.current = muted;

	const stop = useCallback(() => {
		generation.current++;
		playback.current?.cancel();
		playback.current = null;
		setPreparing(false);
		setSpeaking(false);
		setMouthOpenness(0);
	}, []);

	const clear = useCallback(() => {
		stop();
		setLine(null);
	}, [stop]);

	/** Speaks a line; resolves when it has been fully said or interrupted. */
	// biome-ignore lint/correctness/useExhaustiveDependencies: the playback helpers only read refs and state setters
	const speak = useCallback(
		async (text: string, options: SpeakOptions = {}) => {
			stop();
			const current = generation.current;
			const isCurrent = () => generation.current === current;

			let speech = options.speech;
			if (speech === undefined && !mutedRef.current) {
				setPreparing(true);
				speech = await withTimeout(
					synthesizeRef.current(options.voicedText ?? text),
					SYNTHESIS_TIMEOUT_MS,
				).catch(() => null);
				if (!isCurrent()) return;
				setPreparing(false);
			}

			const context = getAudioContext();
			const canPlay = !mutedRef.current && speech && context && context.state === "running";

			if (canPlay) {
				try {
					await playSpeech(context, speech as SynthesizedSpeech, text, current, {
						karaoke: (options.voicedText ?? text) === text,
					});
					return;
				} catch {
					if (!isCurrent()) return;
				}
			}
			await playEstimated(text, current);
		},
		[stop],
	);

	async function playSpeech(
		context: AudioContext,
		speech: SynthesizedSpeech,
		text: string,
		current: number,
		{ karaoke }: { karaoke: boolean },
	) {
		const buffer = await context.decodeAudioData(decodeBase64(speech.audioBase64));
		if (generation.current !== current) return;

		const source = context.createBufferSource();
		const analyser = context.createAnalyser();
		analyser.fftSize = 1024;
		analyser.smoothingTimeConstant = 0.2;
		source.buffer = buffer;
		source.connect(analyser);
		analyser.connect(context.destination);

		const samples = new Float32Array(analyser.fftSize);
		const words = karaoke ? wordsFromSpeech(speech) : [];

		await new Promise<void>((resolve) => {
			let frame = 0;
			let mouth = 0;
			const startedAt = context.currentTime + 0.05;
			const finish = () => {
				cancelAnimationFrame(frame);
				source.onended = null;
				try {
					source.stop();
				} catch {
					// Already stopped.
				}
				source.disconnect();
				analyser.disconnect();
				resolve();
			};

			const tick = () => {
				const level = analyserLevel(analyser, samples);
				// Fast attack, slower release: reads as syllables instead of jitter.
				const target = Math.min(1, Math.max(0, (level - 0.015) * 5.5));
				mouth = target > mouth ? mouth + (target - mouth) * 0.6 : mouth + (target - mouth) * 0.25;
				setMouthOpenness(mouth);
				setCurrentTimeMs(Math.max(0, (context.currentTime - startedAt) * 1000));
				frame = requestAnimationFrame(tick);
			};

			playback.current = { cancel: finish };
			source.onended = () => {
				if (generation.current === current) {
					playback.current = null;
					setCurrentTimeMs(Number.MAX_SAFE_INTEGER);
					setMouthOpenness(0);
					setSpeaking(false);
				}
				finish();
			};

			setLine({ id: current, text, words });
			setCurrentTimeMs(0);
			setSpeaking(true);
			source.start(startedAt);
			frame = requestAnimationFrame(tick);
		});
	}

	async function playEstimated(text: string, current: number) {
		const reduced = prefersReducedMotion();
		const words = estimateWords(text);
		const durationMs = (words.at(-1)?.endMs ?? 0) + TAIL_MS;

		await new Promise<void>((resolve) => {
			let frame = 0;
			let timeout: ReturnType<typeof setTimeout> | undefined;
			const startedAt = performance.now();
			const finish = () => {
				cancelAnimationFrame(frame);
				clearTimeout(timeout);
				resolve();
			};
			const done = () => {
				if (generation.current === current) {
					playback.current = null;
					setCurrentTimeMs(Number.MAX_SAFE_INTEGER);
					setMouthOpenness(0);
					setSpeaking(false);
				}
				finish();
			};

			playback.current = { cancel: finish };
			setLine({ id: current, text, words: reduced ? [] : words });
			setCurrentTimeMs(0);
			setSpeaking(true);

			if (reduced) {
				timeout = setTimeout(done, durationMs);
				return;
			}

			const tick = (now: number) => {
				const elapsed = now - startedAt;
				if (elapsed >= durationMs) return done();

				const inWord = words.some((word) => elapsed >= word.startMs && elapsed < word.endMs);
				const syllables =
					Math.abs(Math.sin(elapsed / 62)) * 0.55 + Math.abs(Math.sin(elapsed / 151)) * 0.3;
				setMouthOpenness(inWord ? 0.15 + syllables : 0);
				setCurrentTimeMs(elapsed);
				frame = requestAnimationFrame(tick);
			};
			frame = requestAnimationFrame(tick);
		});
	}

	useEffect(() => stop, [stop]);

	return { speak, stop, clear, line, preparing, speaking, currentTimeMs, mouthOpenness };
}

function withTimeout<T>(promise: Promise<T>, ms: number) {
	return new Promise<T>((resolve, reject) => {
		const timeout = setTimeout(() => reject(new Error("timeout")), ms);
		promise.then(
			(value) => {
				clearTimeout(timeout);
				resolve(value);
			},
			(error) => {
				clearTimeout(timeout);
				reject(error);
			},
		);
	});
}
