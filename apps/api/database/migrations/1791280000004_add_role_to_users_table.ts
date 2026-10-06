import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "users";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// Existing accounts are staff admins; kiosk devices get a restricted "kiosk" account.
			table.enum("role", ["admin", "kiosk"]).notNullable().defaultTo("admin");
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("role");
		});
	}
}
