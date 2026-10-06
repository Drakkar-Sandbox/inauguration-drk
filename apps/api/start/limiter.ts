import limiter from "@adonisjs/limiter/services/main";

/**
 * Credential endpoints (login, forgot/reset password). Keyed by IP and account so that
 * staff sharing the venue's NAT address do not lock each other out.
 */
export const brutForceLimiter = limiter.define("global", (ctx) => {
	const account = String(ctx.request.input("uid") ?? ctx.request.input("email") ?? "")
		.trim()
		.toLowerCase()
		.slice(0, 254);

	return limiter
		.allowRequests(10)
		.every("1 minute")
		.blockFor("10 minutes")
		.usingKey(`${ctx.request.ip()}_${account}`);
});

/**
 * Public invitation routes, keyed by IP and invitation token (guests share the venue NAT).
 */
export const invitationLimiter = limiter.define("invitation", (ctx) => {
	return limiter
		.allowRequests(60)
		.every("1 minute")
		.blockFor("5 minutes")
		.usingKey(`${ctx.request.ip()}_${String(ctx.params.token ?? "").slice(0, 64)}`);
});

/**
 * Avatar voice (TTS/STT) is costly: guests are limited per IP and token, staff per user.
 */
export const leifVoiceLimiter = limiter.define("leif_voice", (ctx) => {
	if (ctx.auth.user) {
		return limiter.allowRequests(300).every("1 minute").usingKey(`user_${ctx.auth.user.id}`);
	}

	const token = String(
		ctx.request.header("x-invitation-token") ?? ctx.request.input("token") ?? "",
	).slice(0, 64);

	return limiter
		.allowRequests(30)
		.every("1 minute")
		.blockFor("5 minutes")
		.usingKey(`${ctx.request.ip()}_${token}`);
});
