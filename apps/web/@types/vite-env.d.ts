interface ViteTypeOptions {
	strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
	readonly VITE_API_BASE_URL: string;

	readonly VITE_SENTRY_ENABLED: boolean;
	readonly VITE_SENTRY_DSN: string;
	readonly VITE_SENTRY_ENVIRONMENT: string;

	/** Avatar name on day-J screens (defaults to "Leif"); mirrors the API `EVENT_AVATAR_NAME`. */
	readonly VITE_AVATAR_NAME?: string;
	/** Generated reference images of the avatar, when available. */
	readonly VITE_LEIF_PORTRAIT_URL?: string;
	readonly VITE_LEIF_FULLBODY_URL?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
