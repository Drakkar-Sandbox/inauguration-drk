import limiter from "@adonisjs/limiter/services/main";

export const brutForceLimiter = limiter.define("global", () => {
	return limiter.allowRequests(10).every("1 minute").blockFor("10 minutes");
});

export const invitationLimiter = limiter.define("invitation", () => {
	return limiter.allowRequests(60).every("1 minute").blockFor("5 minutes");
});

/**
 * Avatar voice (TTS/STT) is costly: guests are limited per IP, staff kiosks per user.
 */
export const leifVoiceLimiter = limiter.define("leif_voice", (ctx) => {
	if (ctx.auth.user) {
		return limiter.allowRequests(300).every("1 minute").usingKey(`user_${ctx.auth.user.id}`);
	}

	return limiter.allowRequests(30).every("1 minute").blockFor("5 minutes");
});
