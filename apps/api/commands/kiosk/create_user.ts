import { args, BaseCommand, flags } from "@adonisjs/core/ace";
import type { CommandOptions } from "@adonisjs/core/types/ace";
import vine from "@vinejs/vine";

import User from "#models/user";

/**
 * Creates the restricted account a day-J screen logs in with: it can only reach the
 * kiosk and avatar routes, never the back-office.
 */
export default class KioskCreateUser extends BaseCommand {
	static commandName = "kiosk:create-user";
	static description = "Create a kiosk-only account for a day-J screen";

	static options: CommandOptions = {
		startApp: true,
	};

	@args.string({ description: "Login email of the kiosk account" })
	declare email: string;

	@args.string({ description: "Password (at least 12 characters)" })
	declare password: string;

	@flags.string({ description: "Display name", default: "Borne" })
	declare name: string;

	async run() {
		const [error, payload] = await vine
			.create({
				email: vine.string().email().unique({ table: "users", column: "email" }),
				password: vine.string().minLength(12),
				name: vine.string().minLength(1).maxLength(100),
			})
			.tryValidate({ email: this.email, password: this.password, name: this.name });

		if (error) {
			this.logger.error(
				error.messages.map((message: { message: string }) => message.message).join(", "),
			);
			this.exitCode = 1;
			return;
		}

		await User.create({ ...payload, role: "kiosk" });

		this.logger.success(`Kiosk account created for ${payload.email}`);
	}
}
