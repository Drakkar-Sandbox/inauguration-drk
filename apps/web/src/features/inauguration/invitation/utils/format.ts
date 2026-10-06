import type { Invitation } from "#/features/inauguration/leif/types";

type EventInfo = Invitation["event"];

/** « jeudi 3 décembre », in the event timezone. */
export function eventDayLabel(event: EventInfo) {
	return new Intl.DateTimeFormat("fr-FR", {
		weekday: "long",
		day: "numeric",
		month: "long",
		timeZone: event.timezone,
	}).format(new Date(event.startsAt));
}

/** « 30 novembre » for deadlines. */
export function shortDateLabel(date: Date | string, timeZone: string) {
	return new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", timeZone }).format(
		new Date(date),
	);
}

export function capitalize(value: string) {
	return value.charAt(0).toUpperCase() + value.slice(1);
}
