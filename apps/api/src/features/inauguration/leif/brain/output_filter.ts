/**
 * Last-resort filters on LLM text before it reaches a screen or a speaker: the avatar
 * never talks money and never reveals the private angle sheet.
 */

const SHINGLE_SIZE = 5;

const PRICE_PATTERN =
	/(€|\$|\b(eur|euros?|k€|mille|budgets?|prix|tarifs?|tarification|devis|couts?|tjm)\b|\bjours?[\s-]hommes?\b)/;

const normalizeWords = (text: string) =>
	text
		.toLowerCase()
		.normalize("NFD")
		.replace(/\p{Diacritic}/gu, "")
		.split(/[^\p{L}\p{N}€$]+/u)
		.filter(Boolean);

const shingles = (words: string[]) => {
	const result = new Set<string>();
	for (let index = 0; index + SHINGLE_SIZE <= words.length; index++) {
		result.add(words.slice(index, index + SHINGLE_SIZE).join(" "));
	}

	return result;
};

export function mentionsMoney(text: string) {
	return PRICE_PATTERN.test(normalizeWords(text).join(" ")) || /[€$]/.test(text);
}

/**
 * True when the text repeats any 5-word sequence of the angle notes (case, accent and
 * punctuation insensitive).
 */
export function quotesAngleNotes(text: string, angleNotes: string | null) {
	if (!angleNotes) return false;

	const notes = shingles(normalizeWords(angleNotes));
	if (notes.size === 0) return false;

	for (const shingle of shingles(normalizeWords(text))) {
		if (notes.has(shingle)) return true;
	}

	return false;
}

export function isBlockedOutput(text: string, angleNotes: string | null = null) {
	return mentionsMoney(text) || quotesAngleNotes(text, angleNotes);
}
