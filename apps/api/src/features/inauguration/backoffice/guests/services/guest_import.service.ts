import { inject } from "@adonisjs/core";
import vine from "@vinejs/vine";

import Guest from "#models/guest";
import User from "#models/user";
import CsvService from "#services/csv.service";

export const GUEST_IMPORT_COLUMNS = [
	"first_name",
	"last_name",
	"email",
	"company",
	"referent_email",
	"angle_topic",
	"angle_notes",
] as const;

const REQUIRED_COLUMNS = ["first_name", "last_name"];

const rowValidator = vine.create({
	first_name: vine.string().minLength(1).maxLength(100),
	last_name: vine.string().minLength(1).maxLength(100),
	email: vine.string().email().maxLength(254).optional(),
	company: vine.string().maxLength(200).optional(),
	referent_email: vine.string().email().optional(),
	angle_topic: vine.string().maxLength(2000).optional(),
	angle_notes: vine.string().maxLength(10000).optional(),
});

export type GuestImportReport = {
	created: number;
	updated: number;
	errors: { line: number; messages: string[] }[];
};

@inject()
export default class GuestImportService {
	constructor(protected csvService: CsvService) {}

	/**
	 * Imports primary guests from CSV. Rows with an email update the existing primary
	 * guest having that email; other rows create a new guest. Invalid rows are skipped
	 * and reported with their line number (header is line 1).
	 */
	async import(content: string): Promise<GuestImportReport> {
		const report: GuestImportReport = { created: 0, updated: 0, errors: [] };

		const [header = []] = this.csvService.parse(content);
		const columns = header.map((column) => column.trim().toLowerCase());
		const missingColumns = REQUIRED_COLUMNS.filter((column) => !columns.includes(column));
		if (missingColumns.length > 0) {
			report.errors.push({
				line: 1,
				messages: [`Colonnes obligatoires manquantes : ${missingColumns.join(", ")}`],
			});
			return report;
		}

		const records = this.csvService.parseWithHeader(content);
		const referents = await this.#loadReferents();

		for (const [index, record] of records.entries()) {
			const line = index + 2;
			const values = Object.fromEntries(Object.entries(record).filter(([, value]) => value !== ""));

			const [error, row] = await rowValidator.tryValidate(values);
			if (error) {
				report.errors.push({
					line,
					messages: error.messages.map(
						(message: { field: string; message: string }) =>
							`${message.field} : ${message.message}`,
					),
				});
				continue;
			}

			let referentUserId: number | undefined;
			if (row.referent_email) {
				referentUserId = referents.get(row.referent_email.toLowerCase());
				if (!referentUserId) {
					report.errors.push({
						line,
						messages: [
							`referent_email : aucun membre de l'équipe avec l'email ${row.referent_email}`,
						],
					});
					continue;
				}
			}

			const email = row.email?.toLowerCase();
			const attributes = {
				firstName: row.first_name,
				lastName: row.last_name,
				...(row.company !== undefined && { company: row.company }),
				...(referentUserId !== undefined && { referentUserId }),
				...(row.angle_topic !== undefined && { angleTopic: row.angle_topic }),
				...(row.angle_notes !== undefined && { angleNotes: row.angle_notes }),
			};

			const existing = email
				? await Guest.query().where("kind", "primary").whereRaw("lower(email) = ?", [email]).first()
				: null;

			if (existing) {
				await existing.merge(attributes).save();
				report.updated++;
			} else {
				await Guest.create({ ...attributes, email: email ?? null, kind: "primary" });
				report.created++;
			}
		}

		return report;
	}

	async #loadReferents() {
		const users = await User.query().select("id", "email");

		return new Map(users.map((user) => [user.email.toLowerCase(), user.id]));
	}
}
