import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "guests";

	async up() {
		this.schema.alterTable(this.tableName, (table) => {
			// Each plus-one creation/replacement emails a third party: capped per guest.
			table.integer("plus_one_changes").notNullable().defaultTo(0);
		});
	}

	async down() {
		this.schema.alterTable(this.tableName, (table) => {
			table.dropColumn("plus_one_changes");
		});
	}
}
