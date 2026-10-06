import { defineConfig } from "@adonisjs/core/http";
import app from "@adonisjs/core/services/app";

import env from "#start/env";

/**
 * Which proxies may set `X-Forwarded-For` (used by `request.ip()`, hence rate limiting).
 * TRUST_PROXY: "loopback" (default, as AdonisJS), "false" (socket address only), "true" (any),
 * a hop count ("1"), or a comma-separated list of proxy IPs.
 */
const trustProxy = (setting: string) => {
	const value = setting.trim().toLowerCase();
	if (value === "" || value === "false") return () => false;
	if (value === "true") return () => true;
	if (/^\d+$/.test(value)) {
		const hops = Number(value);
		return (_address: string, distance: number) => distance < hops;
	}

	const trusted = new Set(
		value === "loopback"
			? ["127.0.0.1", "::1", "::ffff:127.0.0.1"]
			: value.split(",").map((address) => address.trim()),
	);
	return (address: string) => trusted.has(address);
};

export const http = defineConfig({
	generateRequestId: true,
	trustProxy: trustProxy(env.get("TRUST_PROXY", "loopback")),
	allowMethodSpoofing: false,
	useAsyncLocalStorage: false,

	cookie: {
		domain: env.get("COOKIE_DOMAIN", ""),
		path: "/",
		maxAge: "2h",
		httpOnly: true,
		secure: app.inProduction,
		sameSite: "lax",
	},
});
