import {
	type LeifSubtitleWord,
	wordsFromCharacterAlignment,
} from "@workspace/ui-react/components/leif-subtitles";

import type { SynthesizedSpeech } from "#/features/inauguration/leif/types";

export function wordsFromSpeech(speech: SynthesizedSpeech): LeifSubtitleWord[] {
	return wordsFromCharacterAlignment({
		characters: speech.alignment.characters,
		character_start_times_seconds: speech.alignment.startTimes,
		character_end_times_seconds: speech.alignment.endTimes,
	});
}

const MS_PER_CHARACTER = 58;
const MS_BETWEEN_WORDS = 70;
const MS_AFTER_PUNCTUATION = 260;

/**
 * Reading-pace timings used when no voice is configured: the line is revealed word by word as
 * if it were spoken, so the text-only mode keeps the same rhythm as the voiced one.
 */
export function estimateWords(text: string): LeifSubtitleWord[] {
	const words: LeifSubtitleWord[] = [];
	let cursor = 0;

	for (const word of text.split(/\s+/).filter(Boolean)) {
		const startMs = cursor;
		const endMs = startMs + Math.max(140, word.length * MS_PER_CHARACTER);
		words.push({ text: word, startMs, endMs });
		cursor = endMs + (/[.!?…:;,]$/.test(word) ? MS_AFTER_PUNCTUATION : MS_BETWEEN_WORDS);
	}

	return words;
}
