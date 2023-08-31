const knex = require("knex")(require("../knexfile"));

exports.getQuery = async () => {
	try {
		const result = await knex("query");
		return result;
	} catch (error) {}
};
