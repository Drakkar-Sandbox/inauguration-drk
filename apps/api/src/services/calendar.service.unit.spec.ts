import { test } from "@japa/runner";
import { DateTime } from "luxon";

import CalendarService from "#services/calendar.service";

test.group("Services / Calendar Service", () => {
	test("it should build an escaped and folded iCalendar event in UTC", ({ assert }) => {
		const ics = new CalendarService().toIcs({
			uid: "event@test",
			start: DateTime.fromISO("2026-12-03T18:30", { zone: "Europe/Paris" }),
			end: DateTime.fromISO("2026-12-03T22:30", { zone: "Europe/Paris" }),
			summary: "Inauguration, bureaux; Drakkar",
			description: "x".repeat(200),
		});

		assert.include(ics, "BEGIN:VCALENDAR\r\n");
		assert.include(ics, "DTSTART:20261203T173000Z");
		assert.include(ics, "DTEND:20261203T213000Z");
		assert.include(ics, "SUMMARY:Inauguration\\, bureaux\\; Drakkar");
		for (const line of ics.split("\r\n")) {
			assert.isAtMost(Buffer.byteLength(line), 75);
		}
		assert.include(ics.replace(/\r\n /g, ""), `DESCRIPTION:${"x".repeat(200)}`);
	});

	test("it should escape RFC 5545 text special characters", ({ assert }) => {
		const ics = new CalendarService().toIcs({
			uid: "event@test",
			start: DateTime.fromISO("2026-12-03T18:30", { zone: "Europe/Paris" }),
			end: DateTime.fromISO("2026-12-03T22:30", { zone: "Europe/Paris" }),
			summary: "a;b,c\\d",
			location: "1 rue X\nBâtiment B\r\n2e étage",
		});

		assert.include(ics, "SUMMARY:a\\;b\\,c\\\\d\r\n");
		assert.include(ics, "LOCATION:1 rue X\\nBâtiment B\\n2e étage\r\n");
	});
});
