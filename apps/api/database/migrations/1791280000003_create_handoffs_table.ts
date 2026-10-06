import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "handoffs";

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
			table
				.integer("conversation_id")
				.unsigned()
				.nullable()
				.references("id")
				.inTable("conversations")
				.onDelete("SET NULL");
			table
				.integer("referent_user_id")
				.unsigned()
				.nullable()
				.references("id")
				.inTable("users")
				.onDelete("SET NULL");
			table.text("reason").notNullable();
			table.enum("status", ["pending", "seen", "done"]).notNullable().defaultTo("pending");

			table.timestamps(true, true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
