import { inject } from "@adonisjs/core";

import Guest from "#models/guest";
import CsvService from "#services/csv.service";

const HEADER = [
	"id",
	"first_name",
	"last_name",
	"email",
	"company",
	"kind",
	"host_first_name",
	"host_last_name",
	"status",
	"responded_at",
	"consent",
	"checked_in_at",
	"referent_name",
	"referent_email",
	"angle_topic",
	"angle_notes",
	"meeting_status",
	"interest_level",
	"need",
	"idea",
	"summary_notes",
	"kiosk_conversations",
];

@inject()
export default class GuestExportService {
	constructor(protected csvService: CsvService) {}

	/**
	 * CSV export of every guest with angle sheet, meeting status and the most recent
	 * conversation summary (only stored when the guest gave consent).
	 */
	async toCsv() {
		const guests = await Guest.query()
			.preload("host")
			.preload("referent")
			.preload("conversations", (query) => query.orderBy("started_at", "desc"))
			.orderBy("last_name", "asc")
			.orderBy("first_name", "asc")
			.orderBy("id", "asc");

		const rows = guests.map((guest) => {
			const summary = guest.conversations.find((conversation) => conversation.summary)?.summary;

			return [
				guest.id,
				guest.firstName,
				guest.lastName,
				guest.email,
				guest.company,
				guest.kind,
				guest.host?.firstName,
				guest.host?.lastName,
				guest.status,
				guest.respondedAt?.toISO(),
				guest.consentGivenAt ? "given" : guest.consentRefusedAt ? "refused" : "unknown",
				guest.checkedInAt?.toISO(),
				guest.referent?.name,
				guest.referent?.email,
				guest.angleTopic,
				guest.angleNotes,
				guest.meetingStatus,
				summary?.interestLevel,
				summary?.need,
				summary?.idea,
				summary?.notes,
				guest.conversations.filter((conversation) => conversation.channel === "kiosk").length,
			];
		});

		return this.csvService.stringify([HEADER, ...rows]);
	}
}
