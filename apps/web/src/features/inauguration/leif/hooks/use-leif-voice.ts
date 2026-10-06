import { useCallback, useEffect, useRef, useState } from "react";

import type { LeifSubtitleWord } from "@workspace/ui-react/components/leif-subtitles";

import type { SynthesizedSpeech } from "#/features/inauguration/leif/types";
import {
	analyserLevel,
	decodeSpeechAudio,
	getAudioContext,
	prefersReducedMotion,
} from "#/features/inauguration/leif/utils/audio";
import { createVoiceFrameStore } from "#/features/inauguration/leif/utils/frame-store";
import { estimateWords, wordsFromSpeech } from "#/features/inauguration/leif/utils/subtitles";

const DEFAULT_SYNTHESIS_TIMEOUT_MS = 6_000;
const TAIL_MS = 350;
/** Safety margin after the expected end of a clip before forcing it to finish. */
const WATCHDOG_MARGIN_MS = 1_500;
const END_OF_LINE = Number.MAX_SAFE_INTEGER;

export type LeifLine = {
	id: number;
	text: string;
	/** Word timings; empty when the line is shown at once (reduced motion, voiced variant). */
	words: LeifSubtitleWord[];
};

type SpeakOptions = {
	/** Already synthesized speech (kiosk greeting, prefetched cue); `null` forces text only. */
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
	/** Give up on synthesis after this delay (staff screens can wait longer). @default 6_000 */
	synthesisTimeoutMs?: number;
};

type Playback = { cancel: () => void };

/**
 * Leif's voice: plays a synthesized line through Web Audio, drives the avatar mouth from the
 * signal level and the subtitles from the alignment. Without audio (no voice configured, muted,
 * autoplay still locked, network failure) the line is revealed at reading pace instead, so every
 * surface behaves the same with or without the voice.
 *
 * Mouth and playback position change every frame: they live in `frame` (an external store read
 * with `useVoiceFrame`), so only the avatar and the subtitles re-render at 60 fps.
 */
export function useLeifVoice(params: UseLeifVoiceParams) {
	const { synthesize, muted = false, synthesisTimeoutMs = DEFAULT_SYNTHESIS_TIMEOUT_MS } = params;

	const [line, setLine] = useState<LeifLine | null>(null);
	const [preparing, setPreparing] = useState(false);
	const [speaking, setSpeaking] = useState(false);
	const [frame] = useState(createVoiceFrameStore);

	const generation = useRef(0);
	const playback = useRef<Playback | null>(null);
	const synthesizeRef = useRef(synthesize);
	synthesizeRef.current = synthesize;
	const mutedRef = useRef(muted);
	mutedRef.current = muted;
	const timeoutRef = useRef(synthesisTimeoutMs);
	timeoutRef.current = synthesisTimeoutMs;

	const stop = useCallback(() => {
		generation.current++;
		playback.current?.cancel();
		playback.current = null;
		setPreparing(false);
		setSpeaking(false);
		frame.set({ mouthOpenness: 0, currentTimeMs: frame.get().currentTimeMs });
	}, [frame]);

	const clear = useCallback(() => {
		stop();
		setLine(null);
	}, [stop]);

	/** Speaks a line; resolves when it has been fully said or interrupted. */
	// biome-ignore lint/correctness/useExhaustiveDependencies: the playback helpers only read refs, setters and the frame store
	const speak = useCallback(
		async (text: string, options: SpeakOptions = {}) => {
			stop();
			const current = generation.current;
			const isCurrent = () => generation.current === current;
			const voiced = options.voicedText ?? text;

			// Nothing may be voiced (empty `spoken`): never call the synthesis.
			let speech = voiced.trim() ? options.speech : null;
			if (speech === undefined && !mutedRef.current) {
				setPreparing(true);
				speech = await withTimeout(synthesizeRef.current(voiced), timeoutRef.current).catch(
					() => null,
				);
				if (!isCurrent()) return;
				setPreparing(false);
			}

			const context = getAudioContext();
			if (!mutedRef.current && speech && context && context.state === "running") {
				try {
					await playSpeech(context, speech, text, current, voiced === text);
					return;
				} catch {
					if (!isCurrent()) return;
				}
			}
			await playEstimated(text, current);
		},
		[stop],
	);

	/** Marks the current line as fully said (unless a newer one took over). */
	function settle(current: number) {
		if (generation.current !== current) return;
		playback.current = null;
		frame.set({ mouthOpenness: 0, currentTimeMs: END_OF_LINE });
		setSpeaking(false);
	}

	async function playSpeech(
		context: AudioContext,
		speech: SynthesizedSpeech,
		text: string,
		current: number,
		karaoke: boolean,
	) {
		const buffer = await decodeSpeechAudio(context, speech);
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
			let animation = 0;
			let mouth = 0;
			let finished = false;
			const startedAt = context.currentTime + 0.05;

			const finish = () => {
				if (finished) return;
				finished = true;
				cancelAnimationFrame(animation);
				clearTimeout(watchdog);
				context.removeEventListener("statechange", handleStateChange);
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
			const end = () => {
				settle(current);
				finish();
			};
			// A suspended or closed context (iOS interruption, device change) never fires `ended`.
			const handleStateChange = () => {
				if (context.state !== "running") end();
			};
			// Some browsers drop `ended` for interrupted clips: never stay "speaking" forever.
			const watchdog = setTimeout(end, buffer.duration * 1000 + WATCHDOG_MARGIN_MS);

			const tick = () => {
				const level = analyserLevel(analyser, samples);
				// Fast attack, slower release: reads as syllables instead of jitter.
				const target = Math.min(1, Math.max(0, (level - 0.015) * 5.5));
				mouth = target > mouth ? mouth + (target - mouth) * 0.6 : mouth + (target - mouth) * 0.25;
				frame.set({
					mouthOpenness: mouth,
					currentTimeMs: Math.max(0, (context.currentTime - startedAt) * 1000),
				});
				animation = requestAnimationFrame(tick);
			};

			playback.current = { cancel: finish };
			source.onended = end;
			context.addEventListener("statechange", handleStateChange);

			setLine({ id: current, text, words });
			frame.set({ mouthOpenness: 0, currentTimeMs: 0 });
			setSpeaking(true);
			source.start(startedAt);
			animation = requestAnimationFrame(tick);
		});
	}

	async function playEstimated(text: string, current: number) {
		const reduced = prefersReducedMotion();
		const words = estimateWords(text);
		const durationMs = (words.at(-1)?.endMs ?? 0) + TAIL_MS;

		await new Promise<void>((resolve) => {
			let animation = 0;
			let timeout: ReturnType<typeof setTimeout> | undefined;
			const startedAt = performance.now();
			const finish = () => {
				cancelAnimationFrame(animation);
				clearTimeout(timeout);
				resolve();
			};
			const end = () => {
				settle(current);
				finish();
			};

			playback.current = { cancel: finish };
			setLine({ id: current, text, words: reduced ? [] : words });
			frame.set({ mouthOpenness: 0, currentTimeMs: 0 });
			setSpeaking(true);

			if (reduced) {
				timeout = setTimeout(end, durationMs);
				return;
			}

			const tick = (now: number) => {
				const elapsed = now - startedAt;
				if (elapsed >= durationMs) return end();

				const inWord = words.some((word) => elapsed >= word.startMs && elapsed < word.endMs);
				const syllables =
					Math.abs(Math.sin(elapsed / 62)) * 0.55 + Math.abs(Math.sin(elapsed / 151)) * 0.3;
				frame.set({ mouthOpenness: inWord ? 0.15 + syllables : 0, currentTimeMs: elapsed });
				animation = requestAnimationFrame(tick);
			};
			animation = requestAnimationFrame(tick);
		});
	}

	useEffect(() => stop, [stop]);

	return { speak, stop, clear, line, preparing, speaking, frame };
}

export type LeifVoice = ReturnType<typeof useLeifVoice>;

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
