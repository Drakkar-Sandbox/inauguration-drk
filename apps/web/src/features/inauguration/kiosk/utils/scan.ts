/** Guest tokens are 32 URL-safe characters (`Guest.generateToken()` in the API). */
const TOKEN_LENGTH = 32;

/**
 * Pulls the invitation token out of whatever a scanner produced: a raw token, the full
 * `…/i/<token>` URL, or a URL garbled by a keyboard-layout mismatch (`:` and `/` typed as other
 * characters). Only the trailing run of URL-safe characters is trusted, so the result does not
 * depend on the URL punctuation. Returns null when no token-sized run is present.
 */
export function extractInvitationToken(raw: string) {
	const runs = raw.trim().match(/[A-Za-z0-9_-]+/g);
	const last = runs?.at(-1);
	if (!last || last.length < TOKEN_LENGTH) return null;

	return last.slice(-TOKEN_LENGTH);
}
