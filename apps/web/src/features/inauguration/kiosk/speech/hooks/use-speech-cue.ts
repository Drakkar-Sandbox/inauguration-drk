import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useLeifState } from "#/features/inauguration/leif/hooks/use-leif-state";
import { useLeifVoice } from "#/features/inauguration/leif/hooks/use-leif-voice";
import { synthesizeSpeech } from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

const POLL_INTERVAL_MS = 500;
/** Subtitles stay readable a moment after the last word. */
const LINGER_MS = 4_000;

/**
 * Speech screen driver: polls the operator state and has Leif say each newly triggered cue
 * (speech is cached server-side, so lines are synthesized once). A reset silences Leif. The cue
 * already active when the screen loads is not replayed.
 */
export function useSpeechCue() {
	const voice = useLeifVoice({ synthesize: (text) => synthesizeSpeech(text) });
	const lastSequence = useRef<number | null>(null);
	const linger = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const spoken = useRef(0);

	const { data: current } = useQuery(
		inauguration.kiosk.speech.current.queryOptions(
			{},
			{
				refetchInterval: POLL_INTERVAL_MS,
				refetchIntervalInBackground: true,
				retry: true,
				retryDelay: 1_000,
			},
		),
	);

	useEffect(() => {
		if (!current) return;
		const previous = lastSequence.current;
		lastSequence.current = current.sequence;
		// First poll, or the state store was flushed (sequence went backwards).
		if (previous === null || current.sequence <= previous) return;

		clearTimeout(linger.current);
		const id = ++spoken.current;
		if (!current.cue) {
			voice.clear();
			return;
		}
		void voice.speak(current.cue.text).then(() => {
			// Interrupted by a newer cue: that one owns the subtitles now.
			if (id !== spoken.current) return;
			linger.current = setTimeout(voice.clear, LINGER_MS);
		});
	}, [current, voice.clear, voice.speak]);

	useEffect(() => () => clearTimeout(linger.current), []);

	const state = useLeifState({
		speaking: voice.speaking,
		listening: false,
		waiting: voice.preparing,
		thinkingDelayMs: 600,
	});

	return { voice, state };
}
