/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable("place", (table) => {
		table.uuid("id").defaultTo(knex.fn.uuid()).primary();
		table.string("google_place_id").notNullable();
		table.specificType("longitude", "double precision").notNullable();
		table.specificType("latitude", "double precision").notNullable();
		table.string("name").notNullable();
		table.integer("waypoints_position").notNullable();
		table.integer("rating").nullable();
		table.string("vicinity").nullable();
		table.string("photo_reference").nullable();
		table.string("query_keyword").nullable();
		table
			.uuid("route_id")
			.notNullable()
			.references("route.id")
			.onDelete("CASCADE");
		table.timestamp("created_at").defaultTo(knex.fn.now());
		table
			.timestamp("updated_at")
			.defaultTo(knex.raw("CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"));
	});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("place");
};
