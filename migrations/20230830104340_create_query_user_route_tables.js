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
			table.string("email").notNullable().unique();
			table.boolean("verified").defaultTo(false).notNullable();
			table.uuid("verification_code").defaultTo(knex.fn.uuid());
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
		})
		.createTable("query", (table) => {
			table.increments("id").primary();
			table.integer("user_id").unsigned().nullable();
			table.string("query_mode").notNullable();
			table.integer("duration").notNullable();
			table.integer("radius").notNullable();
			table.boolean("opennow_only").notNullable();
			table.integer("max_route").notNullable();
			table.specificType('longitude', 'double precision').notNullable();
			table.specificType('latitude', 'double precision').notNullable();
			table.string("query_keyword").nullable();
			table.string("query_mood").nullable();
			table.uuid("route_id").nullable().defaultTo(knex.fn.uuid());
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
			table
				.foreign("user_id")
				.references("id")
				.inTable("user")
				.onDelete("CASCADE");
		})
		.createTable("route", (table) => {
			table.uuid("id").notNullable().primary();
			table.integer("user_id").unsigned().nullable();
			table.integer("query_id").unsigned().notNullable();
			table.specificType('longitude', 'double precision').notNullable();
			table.specificType('latitude', 'double precision').notNullable();
			table.integer("duration").notNullable();
			table.boolean("user_saved").notNullable().defaultTo(false);
			table.boolean("user_selected").notNullable().defaultTo(false);
			table.timestamp("created_at").defaultTo(knex.fn.now());
			table
				.timestamp("updated_at")
				.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
			table
				.foreign("query_id")
				.references("id")
				.inTable("query")
				.onDelete("CASCADE");
			table
				.foreign("user_id")
				.references("id")
				.inTable("user")
				.onDelete("CASCADE");
		});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("route").dropTable("query").dropTable("user");
};
