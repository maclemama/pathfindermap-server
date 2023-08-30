const routeData = require("../seed-data/route");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("route").del();
	await knex("route").insert(routeData);
};
