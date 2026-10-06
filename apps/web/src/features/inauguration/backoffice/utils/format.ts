const dateTimeFormat = new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" });
const timeFormat = new Intl.DateTimeFormat("fr-FR", { timeStyle: "short" });

export function formatDateTime(date: Date | string | null | undefined) {
	return date ? dateTimeFormat.format(new Date(date)) : null;
}

export function formatTime(date: Date | string | null | undefined) {
	return date ? timeFormat.format(new Date(date)) : null;
}

export function fullName(person: { firstName: string; lastName: string } | null | undefined) {
	return person ? `${person.firstName} ${person.lastName}` : null;
}
