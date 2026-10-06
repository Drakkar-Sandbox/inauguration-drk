import * as Sentry from "@sentry/tanstackstart-react";

/**
 * Guest invitation tokens are credentials: they appear in public URLs (`/i/<token>`) and API
 * paths (`/invitations/<token>`), and must never reach Sentry (URLs, transaction names, spans,
 * breadcrumbs). Session replay is disabled on the public invitation pages.
 */
const TOKEN_IN_PATH = /\/(i|invitations)\/[A-Za-z0-9_-]+/g;

function scrub<T>(value: T): T {
	return typeof value === "string" ? (value.replace(TOKEN_IN_PATH, "/$1/:token") as T) : value;
}

function scrubRecord(record: Record<string, unknown> | undefined) {
	if (!record) return;
	for (const [key, value] of Object.entries(record)) record[key] = scrub(value);
}

function isInvitationPage() {
	return typeof window !== "undefined" && window.location.pathname.startsWith("/i/");
}

Sentry.init({
	enabled: import.meta.env.VITE_SENTRY_ENABLED,
	environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
	dsn: import.meta.env.VITE_SENTRY_DSN,

	integrations: isInvitationPage() ? [] : [Sentry.replayIntegration()],

	// Set tracesSampleRate to 1.0 to capture 100%
	// of transactions for tracing.
	// We recommend adjusting this value in production.
	// Learn more at https://docs.sentry.io/platforms/javascript/configuration/options/#traces-sample-rate
	tracesSampleRate: 1.0,

	// Capture Replay for 10% of all sessions,
	// plus for 100% of sessions with an error.
	// Learn more at https://docs.sentry.io/platforms/javascript/session-replay/configuration/#general-integration-configuration
	replaysSessionSampleRate: 0,
	replaysOnErrorSampleRate: isInvitationPage() ? 0 : 1.0,

	ignoreErrors: ["TuyauHTTPError"],

	beforeSend(event) {
		if (event.request) {
			event.request.url = scrub(event.request.url);
			event.request.headers = undefined;
			event.request.cookies = undefined;
		}
		event.transaction = scrub(event.transaction);
		for (const exception of event.exception?.values ?? []) exception.value = scrub(exception.value);
		for (const breadcrumb of event.breadcrumbs ?? []) {
			breadcrumb.message = scrub(breadcrumb.message);
			scrubRecord(breadcrumb.data);
		}
		scrubRecord(event.tags as Record<string, unknown> | undefined);
		return event;
	},

	beforeSendTransaction(event) {
		event.transaction = scrub(event.transaction);
		if (event.request) event.request.url = scrub(event.request.url);
		for (const span of event.spans ?? []) {
			span.description = scrub(span.description);
			scrubRecord(span.data);
		}
		scrubRecord(event.contexts?.trace?.data);
		scrubRecord(event.tags as Record<string, unknown> | undefined);
		return event;
	},

	beforeBreadcrumb(breadcrumb) {
		breadcrumb.message = scrub(breadcrumb.message);
		scrubRecord(breadcrumb.data);
		return breadcrumb;
	},
});
