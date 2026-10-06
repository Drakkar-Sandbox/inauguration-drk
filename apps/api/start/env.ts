import { Env } from "@adonisjs/core/env";
import app from "@adonisjs/core/services/app";

export default await Env.create(new URL("../", import.meta.url), {
	// Server Config
	NODE_ENV: Env.schema.enum(["development", "production", "test"] as const),
	PORT: Env.schema.number(),
	APP_KEY: Env.schema.string(),
	APP_URL: Env.schema.string({ format: "url", tld: false }),
	HOST: Env.schema.string({ format: "host" }),
	LOG_LEVEL: Env.schema.string(),
	TRUST_PROXY: Env.schema.string.optional(),

	// Frontend Config
	FRONTEND_URL: Env.schema.string({ format: "url", tld: app.inProduction }),

	// Event Config
	EVENT_AVATAR_NAME: Env.schema.string.optional(),

	// Leif AI Config (optional: without keys the avatar runs scripted, text only)
	ANTHROPIC_API_KEY: Env.schema.string.optional(),
	ANTHROPIC_MODEL: Env.schema.string.optional(),
	ANTHROPIC_FAST_MODEL: Env.schema.string.optional(),
	ELEVENLABS_API_KEY: Env.schema.string.optional(),
	ELEVENLABS_VOICE_ID: Env.schema.string.optional(),
	ELEVENLABS_TTS_MODEL: Env.schema.string.optional(),
	ELEVENLABS_STT_MODEL: Env.schema.string.optional(),

	// Cookie Config
	COOKIE_DOMAIN: Env.schema.string.optionalWhen(process.env.NODE_ENV !== "production"),

	// Session Config
	SESSION_DRIVER: Env.schema.enum(["cookie", "memory"] as const),

	// CORS Config
	CORS_AUTHORIZED_ORIGINS: Env.schema.string.optionalWhen(process.env.NODE_ENV !== "production"),

	// Database Config
	DB_HOST: Env.schema.string({ format: "host" }),
	DB_PORT: Env.schema.number(),
	DB_USER: Env.schema.string(),
	DB_PASSWORD: Env.schema.string.optional(),
	DB_DATABASE: Env.schema.string(),

	// Mail Config
	MAIL_MAILER: Env.schema.enum(["smtp"] as const),
	MAIL_FROM_NAME: Env.schema.string(),
	MAIL_FROM_ADDRESS: Env.schema.string(),

	// SMTP Config
	SMTP_HOST: Env.schema.string.optionalWhen(process.env.MAILER_DRIVER !== "local", {
		format: "host",
	}),
	SMTP_PORT: Env.schema.number.optionalWhen(process.env.MAILER_DRIVER !== "local"),

	// Redis Config
	REDIS_CONNECTION: Env.schema.enum(["main", "test"] as const),
	REDIS_HOST: Env.schema.string({ format: "host" }),
	REDIS_PORT: Env.schema.number(),
	REDIS_PASSWORD: Env.schema.string.optional(),

	// Limiter Config
	LIMITER_STORE: Env.schema.enum(["redis", "memory"] as const),

	// Queue Config
	QUEUE_DRIVER: Env.schema.enum(["redis", "sync"] as const),

	// Drive Config
	DRIVE_DRIVER: Env.schema.enum(["fs", "s3"] as const),

	// S3 Config
	S3_ACCESS_KEY_ID: Env.schema.string.optionalWhen(process.env.DRIVE_DRIVER !== "s3"),
	S3_SECRET_ACCESS_KEY: Env.schema.string.optionalWhen(process.env.DRIVE_DRIVER !== "s3"),
	S3_REGION: Env.schema.string.optionalWhen(process.env.DRIVE_DRIVER !== "s3"),
	S3_BUCKET: Env.schema.string.optionalWhen(process.env.DRIVE_DRIVER !== "s3"),

	// Sentry Config
	SENTRY_ENABLED: Env.schema.boolean(),
	SENTRY_DSN: Env.schema.string.optionalWhen(process.env.SENTRY_ENABLED === "false", {
		format: "url",
		tld: true,
	}),
	SENTRY_ENV: Env.schema.string.optionalWhen(process.env.SENTRY_ENABLED === "false"),
});
