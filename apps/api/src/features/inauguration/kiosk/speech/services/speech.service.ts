import redis from "@adonisjs/redis/services/main";

import eventConfig from "#config/event";

const CURRENT_KEY = "inauguration:speech:current";
const SEQUENCE_KEY = "inauguration:speech:sequence";

type StoredCue = {
	cueId: string | null;
	sequence: number;
	triggeredAt: string;
};

/**
 * Speech screen state shared between the operator console and the speech screen.
 * The sequence only grows so that the screen can detect a re-triggered cue.
 */
export default class SpeechService {
	cues() {
		return eventConfig.speechCues;
	}

	async current() {
		const raw = await redis.get(CURRENT_KEY);
		const stored: StoredCue | null = raw ? JSON.parse(raw) : null;

		return {
			cue: this.cues().find((cue) => cue.id === stored?.cueId) ?? null,
			sequence: stored?.sequence ?? 0,
			triggeredAt: stored?.triggeredAt ?? null,
		};
	}

	async trigger(cueId: string) {
		return this.#store(cueId);
	}

	async reset() {
		return this.#store(null);
	}

	async #store(cueId: string | null) {
		const sequence = await redis.incr(SEQUENCE_KEY);
		const stored: StoredCue = { cueId, sequence, triggeredAt: new Date().toISOString() };

		await redis.set(CURRENT_KEY, JSON.stringify(stored));

		return this.current();
	}
}
