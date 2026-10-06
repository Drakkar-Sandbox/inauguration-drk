import type { Authenticators } from "@adonisjs/auth/types";
import type { HttpContext } from "@adonisjs/core/http";
import type { NextFn } from "@adonisjs/core/types/http";
import * as Sentry from "@sentry/node";

import AuthorizationFailureException from "#exceptions/authorization_failure.exception";
import type { UserRole } from "#models/user";

export default class AuthMiddleware {
	async handle(
		ctx: HttpContext,
		next: NextFn,
		options: {
			guards?: (keyof Authenticators)[];
			/**
			 * Roles allowed on the route. Admin only by default: kiosk devices must be
			 * explicitly allowed (kiosk and avatar routes, profile view, logout).
			 */
			roles?: UserRole[];
		} = {},
	) {
		const user = await ctx.auth.authenticateUsing(options.guards);

		Sentry.setUser({
			id: user.id,
			email: user.email,
			ip_address: ctx.request.ip(),
		});

		if (!(options.roles ?? ["admin"]).includes(user.role)) {
			throw new AuthorizationFailureException();
		}

		return next();
	}
}
