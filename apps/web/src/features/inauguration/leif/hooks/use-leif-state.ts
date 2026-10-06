import { useEffect, useState } from "react";

import type { LeifAvatarState } from "@workspace/ui-react/components/leif-avatar";

type LeifActivity = {
	/** A line is being said (audio or reading-pace reveal). */
	speaking: boolean;
	/** The guest is talking (push-to-talk held). */
	listening: boolean;
	/** Waiting for the server (transcription, reply, synthesis). */
	waiting: boolean;
	/**
	 * Only show `thinking` once the wait exceeds this delay, so fast answers never flash it.
	 * @default 0
	 */
	thinkingDelayMs?: number;
};

/**
 * Single state machine shared by every surface: speaking wins over listening, which wins over
 * thinking; otherwise Leif idles.
 */
export function useLeifState(activity: LeifActivity): LeifAvatarState {
	const { speaking, listening, waiting, thinkingDelayMs = 0 } = activity;
	const thinking = useDelayedFlag(waiting, thinkingDelayMs);

	if (speaking) return "speaking";
	if (listening) return "listening";
	if (thinking) return "thinking";

	return "idle";
}

/** `true` once `value` has stayed `true` for `delayMs`; resets immediately. */
export function useDelayedFlag(value: boolean, delayMs: number) {
	const [delayed, setDelayed] = useState(false);

	useEffect(() => {
		if (!value) {
			setDelayed(false);
			return;
		}
		if (delayMs <= 0) {
			setDelayed(true);
			return;
		}
		const timeout = setTimeout(() => setDelayed(true), delayMs);
		return () => clearTimeout(timeout);
	}, [value, delayMs]);

	return value && (delayed || delayMs <= 0);
}
