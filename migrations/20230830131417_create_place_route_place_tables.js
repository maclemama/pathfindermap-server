/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema
		.createTable("place", (table) => {
			table.uuid("id").defaultTo(knex.fn.uuid()).primary();
			table.uuid("google_place_id").notNullable();
			table.float("longitude").notNullable();
			table.float("latitude").notNullable();
			table.string("name").notNullable();
			table.integer("waypoints_position").notNullable();
			table.integer("rating").nullable();
			table.integer("price_level").nullable();
			table.string("vicinity").nullable();
			table.string("photo_reference").nullable();
			table.string("query_keyword").nullable();
			table.timestamp("created_at").defaultTo(knex.fn.now());
		})
		.createTable("route_place", (table) => {
			table.uuid("place_id").notNullable().references("place.id");
			table.uuid("route_id").notNullable().references("route.id");
			table.timestamp("created_at").defaultTo(knex.fn.now());
		});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
	return knex.schema.dropTable("route_place").dropTable("place");
};
