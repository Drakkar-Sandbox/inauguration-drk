import { useQueries } from "@tanstack/react-query";
import { useCallback, useEffect } from "react";

import type { SpeechCue, SynthesizedSpeech } from "#/features/inauguration/leif/types";
import { synthesizeSpeech } from "#/features/inauguration/leif/utils/api";
import { decodeSpeechAudio, getAudioContext } from "#/features/inauguration/leif/utils/audio";

const SYNTHESIS_TIMEOUT_MS = 30_000;

/** `audio`: voiced and ready; `text`: no voice configured (subtitles only). */
export type CueSpeechStatus = "loading" | "audio" | "text" | "error";

/**
 * Synthesizes (server-cached) and decodes every speech cue ahead of time, so the speech screen
 * plays a trigger from memory and the operator console can show what is ready.
 */
export function useCueSpeeches(cues: SpeechCue[] | undefined) {
	const results = useQueries({
		queries: (cues ?? []).map((cue) => ({
			queryKey: ["inauguration", "speech-cue-audio", cue.text],
			queryFn: () => synthesizeSpeech(cue.text, undefined, SYNTHESIS_TIMEOUT_MS),
			staleTime: Number.POSITIVE_INFINITY,
			gcTime: Number.POSITIVE_INFINITY,
			retry: 3,
		})),
	});

	const speeches = results.map((result) => result.data);
	// Decode as soon as audio arrives: decoding works even before the context is unlocked.
	useEffect(() => {
		const context = getAudioContext();
		if (!context) return;
		for (const speech of speeches) {
			if (speech) void decodeSpeechAudio(context, speech).catch(() => undefined);
		}
	}, [speeches]);

	const texts = (cues ?? []).map((cue) => cue.text);
	const speechFor = useCallback(
		(text: string): SynthesizedSpeech | null | undefined => {
			const index = texts.indexOf(text);
			return index === -1 ? undefined : speeches[index];
		},
		[texts, speeches],
	);

	const statuses: Record<string, CueSpeechStatus> = {};
	for (const [index, cue] of (cues ?? []).entries()) {
		const result = results[index];
		statuses[cue.id] = result?.isError
			? "error"
			: result?.data === undefined
				? "loading"
				: result.data
					? "audio"
					: "text";
	}

	return { speechFor, statuses };
}
