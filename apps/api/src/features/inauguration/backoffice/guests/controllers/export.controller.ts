import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import { DateTime } from "luxon";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import GuestExportService from "#features/inauguration/backoffice/guests/services/guest_export.service";

@inject()
export default class ExportGuestsController {
	constructor(protected guestExportService: GuestExportService) {}

	async handle({ response, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("export");

		const csv = await this.guestExportService.toCsv();

		response.header("Content-Type", "text/csv; charset=utf-8");
		response.header(
			"Content-Disposition",
			`attachment; filename="invites-${DateTime.now().toFormat("yyyy-MM-dd")}.csv"`,
		);

		// BOM so that spreadsheet software detects UTF-8 (accents).
		return `﻿${csv}`;
	}
}
