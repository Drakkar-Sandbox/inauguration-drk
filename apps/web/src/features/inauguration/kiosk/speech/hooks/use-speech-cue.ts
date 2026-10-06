import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { useCueSpeeches } from "#/features/inauguration/kiosk/speech/hooks/use-cue-speeches";
import { useLeifState } from "#/features/inauguration/leif/hooks/use-leif-state";
import { useLeifVoice } from "#/features/inauguration/leif/hooks/use-leif-voice";
import { synthesizeSpeech } from "#/features/inauguration/leif/utils/api";
import { inauguration } from "#/libs/tuyau";

const POLL_INTERVAL_MS = 500;
/** Subtitles stay readable a moment after the last word. */
const LINGER_MS = 4_000;
const STAFF_SYNTHESIS_TIMEOUT_MS = 20_000;

/**
 * Speech screen driver: polls the operator state and has Leif say each newly triggered cue. Every
 * cue is synthesized and decoded when the screen opens, so a trigger plays from memory. Any
 * change of (sequence, triggeredAt) counts as a new trigger — even if the state store was reset
 * and the sequence went backwards. The cue already active when the screen loads is not replayed.
 */
export function useSpeechCue() {
	const voice = useLeifVoice({
		synthesize: (text) => synthesizeSpeech(text, undefined, STAFF_SYNTHESIS_TIMEOUT_MS),
		synthesisTimeoutMs: STAFF_SYNTHESIS_TIMEOUT_MS,
	});
	const lastTrigger = useRef<string | null>(null);
	const linger = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
	const spoken = useRef(0);

	const { data: cues } = useQuery(
		inauguration.kiosk.speech.cues.queryOptions({}, { refetchInterval: 60_000, retry: true }),
	);
	const { speechFor } = useCueSpeeches(cues);

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
		const trigger = `${current.sequence}|${current.triggeredAt ?? ""}`;
		const previous = lastTrigger.current;
		lastTrigger.current = trigger;
		if (previous === null || previous === trigger) return;

		clearTimeout(linger.current);
		const id = ++spoken.current;
		if (!current.cue) {
			voice.clear();
			return;
		}
		const prefetched = speechFor(current.cue.text);
		void voice
			.speak(current.cue.text, prefetched === undefined ? {} : { speech: prefetched })
			.then(() => {
				// Interrupted by a newer cue: that one owns the subtitles now.
				if (id !== spoken.current) return;
				clearTimeout(linger.current);
				linger.current = setTimeout(voice.clear, LINGER_MS);
			});
	}, [current, speechFor, voice.clear, voice.speak]);

	useEffect(() => () => clearTimeout(linger.current), []);

	const state = useLeifState({
		speaking: voice.speaking,
		listening: false,
		waiting: voice.preparing,
		thinkingDelayMs: 600,
	});

	return { voice, state };
}
