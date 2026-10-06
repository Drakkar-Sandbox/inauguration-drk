import { DateTime } from "luxon";

import eventConfig from "#config/event";
import CalendarService from "#services/calendar.service";

export default class EventService {
	startsAt() {
		return DateTime.fromISO(`${eventConfig.date}T${eventConfig.startTime}`, {
			zone: eventConfig.timezone,
		});
	}

	endsAt() {
		return DateTime.fromISO(`${eventConfig.date}T${eventConfig.endTime}`, {
			zone: eventConfig.timezone,
		});
	}

	/**
	 * Last moment (event timezone) when a primary guest can add, replace or remove a plus-one.
	 */
	plusOneDeadline() {
		return DateTime.fromISO(eventConfig.date, { zone: eventConfig.timezone })
			.minus({ days: eventConfig.plusOneDeadlineDaysBefore })
			.endOf("day");
	}

	isPlusOneEditable(now: DateTime = DateTime.now()) {
		return now <= this.plusOneDeadline();
	}

	fullAddress() {
		const { street, postalCode, city } = eventConfig.address;

		return `${street}, ${postalCode} ${city}`;
	}

	/**
	 * iCalendar document of the event, linking back to the guest invitation page.
	 */
	toIcs(invitationUrl: string) {
		return new CalendarService().toIcs({
			uid: `inauguration-${eventConfig.date}@drakkar`,
			start: this.startsAt(),
			end: this.endsAt(),
			summary: eventConfig.title,
			description: `Votre invitation : ${invitationUrl}`,
			location: this.fullAddress(),
			url: invitationUrl,
		});
	}

	/**
	 * Event information that can be shown to any guest (no internal data).
	 */
	publicInfo() {
		const startsAt = this.startsAt().setLocale("fr");
		const endsAt = this.endsAt().setLocale("fr");

		return {
			avatarName: eventConfig.avatarName,
			title: eventConfig.title,
			organizer: eventConfig.organizer,
			timezone: eventConfig.timezone,
			startsAt: startsAt.toISO()!,
			endsAt: endsAt.toISO()!,
			dateLabel: startsAt.toFormat("cccc d LLLL yyyy"),
			timeLabel: `${startsAt.toFormat("HH'h'mm")} – ${endsAt.toFormat("HH'h'mm")}`,
			address: {
				...eventConfig.address,
				full: this.fullAddress(),
			},
			access: eventConfig.access,
			parking: eventConfig.parking,
			dressCode: eventConfig.dressCode,
			programme: eventConfig.programme,
			hostName: eventConfig.hostName,
			faq: eventConfig.faq,
			dataPolicy: eventConfig.dataPolicy,
			dataRetentionMonths: eventConfig.dataRetentionMonths,
		};
	}
}
