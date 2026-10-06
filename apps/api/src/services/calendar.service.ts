import { DateTime } from "luxon";

type CalendarEvent = {
	uid: string;
	start: DateTime;
	end: DateTime;
	summary: string;
	description?: string;
	location?: string;
	url?: string;
	organizer?: { name: string; email: string };
};

export default class CalendarService {
	/**
	 * Builds a RFC 5545 iCalendar document containing a single event.
	 */
	toIcs(event: CalendarEvent) {
		const lines = [
			"BEGIN:VCALENDAR",
			"VERSION:2.0",
			"PRODID:-//Drakkar//Inauguration//FR",
			"CALSCALE:GREGORIAN",
			"METHOD:PUBLISH",
			"BEGIN:VEVENT",
			`UID:${event.uid}`,
			`DTSTAMP:${this.#formatDate(DateTime.now())}`,
			`DTSTART:${this.#formatDate(event.start)}`,
			`DTEND:${this.#formatDate(event.end)}`,
			`SUMMARY:${this.#escape(event.summary)}`,
		];

		if (event.description) lines.push(`DESCRIPTION:${this.#escape(event.description)}`);
		if (event.location) lines.push(`LOCATION:${this.#escape(event.location)}`);
		if (event.url) lines.push(`URL:${event.url}`);
		if (event.organizer) {
			lines.push(
				`ORGANIZER;CN=${this.#escape(event.organizer.name)}:mailto:${event.organizer.email}`,
			);
		}

		lines.push("END:VEVENT", "END:VCALENDAR");

		return `${lines.map((line) => this.#fold(line)).join("\r\n")}\r\n`;
	}

	#formatDate(date: DateTime) {
		return date.toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'");
	}

	/**
	 * TEXT value escaping (RFC 5545 §3.3.11): backslash, semicolon, comma and newlines.
	 */
	#escape(value: string) {
		return value
			.replace(/\\/g, "\\\\")
			.replace(/;/g, "\\;")
			.replace(/,/g, "\\,")
			.replace(/\r?\n/g, "\\n");
	}

	/**
	 * Folds lines longer than 75 octets as required by RFC 5545.
	 */
	#fold(line: string) {
		const chunks: string[] = [];
		let current = "";

		for (const char of line) {
			const limit = chunks.length === 0 ? 75 : 74;
			if (Buffer.byteLength(current + char) > limit) {
				chunks.push(current);
				current = char;
			} else {
				current += char;
			}
		}
		chunks.push(current);

		return chunks.join("\r\n ");
	}
}
