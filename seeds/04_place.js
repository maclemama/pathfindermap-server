const placeData = require("../seed-data/place");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("place").del();
	await knex("place").insert(placeData);
};
