const routePlaceData = require("../seed-data/route_place");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("route_place").del();
	await knex("route_place").insert(routePlaceData);
};
