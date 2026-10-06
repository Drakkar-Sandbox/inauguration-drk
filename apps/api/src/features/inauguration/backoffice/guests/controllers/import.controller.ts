import { readFile } from "node:fs/promises";

import { inject } from "@adonisjs/core";
import { HttpContext } from "@adonisjs/core/http";
import vine from "@vinejs/vine";

import GuestPolicy from "#features/inauguration/backoffice/guests/policies/guest.policy";
import GuestImportService from "#features/inauguration/backoffice/guests/services/guest_import.service";

@inject()
export default class ImportGuestsController {
	constructor(protected guestImportService: GuestImportService) {}

	async handle({ request, bouncer }: HttpContext) {
		await bouncer.with(GuestPolicy).authorize("import");

		// Validated from the raw multipart files: the superjson middleware replaces the
		// request body when the client sends `x-superjson`, which drops multipart data.
		const { file } = await ImportGuestsController.payloadSchema.validate({
			file: request.file("file"),
		});

		const content = await readFile(file.tmpPath!, "utf-8");

		return this.guestImportService.import(content);
	}

	static payloadSchema = vine.create({
		file: vine.file({ size: "2mb", extnames: ["csv", "txt"] }),
	});
}
