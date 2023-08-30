const queryData = require("../seed-data/query");
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function (knex) {
	// Deletes ALL existing entries
	await knex("query").del();
	await knex("query").insert(queryData);
};
