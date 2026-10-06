import { BaseSchema } from "@adonisjs/lucid/schema";

export default class extends BaseSchema {
	protected tableName = "guests";

	async up() {
		this.schema.createTable(this.tableName, (table) => {
			table.increments("id").notNullable();

			table.string("token", 64).notNullable().unique();
			table.string("first_name").notNullable();
			table.string("last_name").notNullable();
			table.string("email", 254).nullable().index();
			table.string("company").nullable();

			table.enum("kind", ["primary", "plus_one"]).notNullable().defaultTo("primary");
			table
				.integer("host_guest_id")
				.unsigned()
				.nullable()
				.unique()
				.references("id")
				.inTable("guests")
				.onDelete("CASCADE");

			table.enum("status", ["invited", "confirmed", "declined"]).notNullable().defaultTo("invited");
			table.timestamp("responded_at", { useTz: true }).nullable();
			table.timestamp("consent_given_at", { useTz: true }).nullable();
			table.timestamp("consent_refused_at", { useTz: true }).nullable();
			table.timestamp("checked_in_at", { useTz: true }).nullable();

			table
				.integer("referent_user_id")
				.unsigned()
				.nullable()
				.references("id")
				.inTable("users")
				.onDelete("SET NULL");
			table.text("angle_topic").nullable();
			table.text("angle_notes").nullable();
			table
				.enum("meeting_status", ["none", "to_propose", "proposed", "held", "mission"])
				.notNullable()
				.defaultTo("none");

			table.timestamps(true, true);
		});
	}

	async down() {
		this.schema.dropTable(this.tableName);
	}
}
