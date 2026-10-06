import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "conversations";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments("id").notNullable();

			table
				.integer("guest_id")
				.unsigned()
				.notNullable()
				.references("id")
				.inTable("guests")
				.onDelete("CASCADE");
			table.enum("channel", ["signup", "kiosk"]).notNullable();
			table.timestamp("started_at", { useTz: true }).notNullable();
			table.timestamp("ended_at", { useTz: true }).nullable();
			table.jsonb("transcript").nullable();
			table.jsonb("summary").nullable();

			table.timestamps(true, true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
