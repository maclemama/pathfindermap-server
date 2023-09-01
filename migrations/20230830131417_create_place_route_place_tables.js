/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
	return knex.schema.createTable("place", (table) => {
		table.increments("id").primary();
		table.string("google_place_id").notNullable();
		table.specificType("longitude", "double precision").notNullable();
		table.specificType("latitude", "double precision").notNullable();
		table.string("name").notNullable();
		table.integer("waypoints_position").notNullable();
		table.integer("rating").nullable();
		table.string("vicinity").nullable();
		table.string("photo_reference").nullable();
		table.string("query_keyword").nullable();
		table.integer("user_ratings_total").nullable();
		table.integer("walking_time").nullable();
		table.integer("distance").nullable();
		table.integer("place_score").nullable();
		table
			.integer("route_id")
			.unsigned()
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
