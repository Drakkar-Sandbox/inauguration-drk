import { indexEntities } from "@adonisjs/core";
import { defineConfig } from "@adonisjs/core/app";
import { generateRegistry } from "@tuyau/core/hooks";

export default defineConfig({
	directories: {
		httpControllers: "src/controllers",
		models: "src/models",
		services: "src/services",
		exceptions: "src/exceptions",
		mails: "src/mails",
		middleware: "src/middlewares",
		validators: "src/validators",
		views: "src/views",
		policies: "src/policies",
	},

	experimental: {},

	commands: [
		() => import("@adonisjs/core/commands"),
		() => import("@adonisjs/lucid/commands"),
		() => import("@adonisjs/session/commands"),
		() => import("@adonisjs/mail/commands"),
		() => import("@adonisjs/queue/commands"),
		() => import("@adonisjs/bouncer/commands"),
	],

	providers: [
		() => import("@adonisjs/core/providers/app_provider"),
		() => import("@adonisjs/core/providers/hash_provider"),
		{
			file: () => import("@adonisjs/core/providers/repl_provider"),
			environment: ["repl", "test"],
		},
		() => import("@adonisjs/core/providers/vinejs_provider"),
		() => import("@adonisjs/lucid/database_provider"),
		() => import("@adonisjs/cors/cors_provider"),
		() => import("@adonisjs/core/providers/edge_provider"),
		() => import("@adonisjs/session/session_provider"),
		() => import("@adonisjs/auth/auth_provider"),
		() => import("@adonisjs/mail/mail_provider"),
		() => import("@adonisjs/redis/redis_provider"),
		() => import("@adonisjs/limiter/limiter_provider"),
		() => import("@adonisjs/queue/queue_provider"),
		() => import("@adonisjs/bouncer/bouncer_provider"),
		() => import("@adonisjs/drive/drive_provider"),
		() => import("#features/inauguration/leif/leif_provider"),
	],

	preloads: [
		() => import("#start/routes"),
		() => import("#start/kernel"),
		() => import("#start/view"),
	],

	tests: {
		suites: [
			{
				files: ["./src/**/*.unit.spec.{ts,js}"],
				name: "unit",
				timeout: 2000,
			},
			{
				files: ["./src/**/*.e2e.spec.{ts,js}"],
				name: "e2e",
				timeout: 30000,
			},
		],
		forceExit: false,
	},

	hooks: {
		init: [
			indexEntities({
				controllers: {
					enabled: true,
					source: "src",
					importAlias: "#src",
					glob: ["**/*.controller.{ts,js}"],
				},
				events: {
					enabled: true,
					source: "src",
					importAlias: "#src",
					glob: ["**/*.event.{ts,js}"],
				},
				listeners: {
					enabled: true,
					source: "src",
					importAlias: "#src",
					glob: ["**/*.listener.{ts,js}"],
				},
				transformers: {
					enabled: false,
				},
				manifest: {
					enabled: true,
				},
			}),
			generateRegistry(),
			() => import("#hooks/generate_data_type.hook"),
		],
	},
});
