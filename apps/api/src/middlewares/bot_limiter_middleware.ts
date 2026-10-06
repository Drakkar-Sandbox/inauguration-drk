import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import limiter from "@adonisjs/limiter/services/main";

/**
 * Anonymous traffic is limited per IP. Logged-in staff and kiosk devices are limited per
 * account with a generous budget: on day J every venue device shares one NAT address and
 * the screens poll.
 */
const anonymousLimiter = limiter.use({
	requests: 100,
	duration: "1 minute",
	blockDuration: "20 minutes",
});

const userLimiter = limiter.use({
	requests: 1000,
	duration: "1 minute",
	blockDuration: "1 minute",
});

export default class BotLimiterMiddleware {
	async handle(ctx: HttpContext, next: NextFn) {
		const user = ctx.auth.user;

		if (user) await userLimiter.consume(`bot_user_${user.id}`);
		else await anonymousLimiter.consume(ctx.request.ip());

		return next();
	}
}
