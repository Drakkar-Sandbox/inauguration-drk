import limiter from "@adonisjs/limiter/services/main";

export const brutForceLimiter = limiter.define("global", () => {
	return limiter.allowRequests(10).every("1 minute").blockFor("10 minutes");
});

export const invitationLimiter = limiter.define("invitation", () => {
	return limiter.allowRequests(60).every("1 minute").blockFor("5 minutes");
});
