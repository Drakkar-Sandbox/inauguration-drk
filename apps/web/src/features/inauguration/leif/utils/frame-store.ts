import { useSyncExternalStore } from "react";

/** Per-animation-frame voice values: only the avatar, subtitles and backdrop subscribe. */
export type VoiceFrame = {
	mouthOpenness: number;
	currentTimeMs: number;
};

export type VoiceFrameStore = {
	get: () => VoiceFrame;
	set: (frame: VoiceFrame) => void;
	subscribe: (listener: () => void) => () => void;
};

const SILENT: VoiceFrame = { mouthOpenness: 0, currentTimeMs: 0 };

/**
 * Tiny external store so 60 fps updates re-render the consumers that read them, not the whole
 * screen holding the voice.
 */
export function createVoiceFrameStore(): VoiceFrameStore {
	let frame = SILENT;
	const listeners = new Set<() => void>();

	return {
		get: () => frame,
		set: (next) => {
			if (
				next.mouthOpenness === frame.mouthOpenness &&
				next.currentTimeMs === frame.currentTimeMs
			) {
				return;
			}
			frame = next;
			for (const listener of listeners) listener();
		},
		subscribe: (listener) => {
			listeners.add(listener);
			return () => listeners.delete(listener);
		},
	};
}

export function useVoiceFrame(store: VoiceFrameStore) {
	return useSyncExternalStore(store.subscribe, store.get, store.get);
}
