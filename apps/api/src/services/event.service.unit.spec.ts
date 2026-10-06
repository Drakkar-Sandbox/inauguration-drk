import { test } from "@japa/runner";
import { DateTime } from "luxon";

import EventService from "#services/event.service";

test.group("Services / Event Service", () => {
	test("it should close plus-one changes at the end of J-3 in the event timezone", ({ assert }) => {
		const eventService = new EventService();
		const deadline = eventService.plusOneDeadline();

		assert.equal(deadline.toISO(), "2026-11-30T23:59:59.999+01:00");
		assert.isTrue(eventService.isPlusOneEditable(deadline.minus({ minutes: 1 })));
		assert.isFalse(eventService.isPlusOneEditable(deadline.plus({ minutes: 1 })));
		assert.isFalse(eventService.isPlusOneEditable(DateTime.fromISO("2026-12-01T08:00Z")));
	});
});
