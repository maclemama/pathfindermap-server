/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema
		.createTable("user", (table) => {
			table.increments("id").primary();
			table.string("user_name").notNullable();
			table.string("first_name").notNullable();
			table.string("last_name").notNullable();
			table.string("password").notNullable();
			table.string("email").notNullable();
			table.boolean("verified").defaultTo(false).notNullable();
			table.uuid("verification_code").defaultTo(knex.fn.uuid());
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
		})
		.createTable("query", (table) => {
			table.uuid("id").notNullable().primary().defaultTo(knex.fn.uuid());
			table.integer("user_id").unsigned().notNullable();
			table.string("query_mode").notNullable();
			table.integer("duration").notNullable();
			table.integer("radius").notNullable();
			table.boolean("opennow_only").notNullable();
			table.float("longitude").notNullable();
			table.float("latitude").notNullable();
			table.string("query_keyword").nullable();
			table.string("query_mood").nullable();
			table.uuid("route_id").nullable().defaultTo(knex.fn.uuid());
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
			table.foreign("user_id").references("id").inTable("user");
		})
		.createTable("route", (table) => {
			table.uuid("id").notNullable().primary();
			table.integer("user_id").unsigned().notNullable();
			table.uuid("query_id").notNullable();
			table.float("longitude").notNullable();
			table.float("latitude").notNullable();
			table.integer("route_duration").notNullable();
			table.boolean("user_saved").notNullable().defaultTo(false);
			table.boolean("user_selected").notNullable().defaultTo(false);
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
			table.foreign("query_id").references("id").inTable("query");
			table.foreign("user_id").references("id").inTable("user");
		});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("route").dropTable("query").dropTable("user");
};
