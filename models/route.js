const knex = require("knex")(require("../knexfile"));
const { setError } = require("../utils/errorUtils");

const requiredFields = [ "longitude", "latitude", "duration"];

const allFields = [
	"id",
	"user_id",
	"longitude",
	"latitude",
	"duration",
	"user_saved",
	"user_selected",
	"created_at",
	"updated_at",
];

exports.get = async (routeIDs) => {
	try {
		const routes = await knex("route").whereIn("id", routeIDs);

		if (!routes) {
			setError("No route found.", 400);
			return;
		}

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};

exports.create = async (payload) => {
	try {
		const newRecordIndex = await knex("route").insert([payload]);
		const results = await knex("route")
			.where({
				id: newRecordIndex[0],
			})
			.first();

		return results;
	} catch (error) {
		setError("Error creating route.", 500, error);
	}
};
