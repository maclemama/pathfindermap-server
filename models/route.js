const knex = require("knex")(require("../knexfile"));
const { setError } = require("../utils/errorUtils");

const requiredFields = [
    "id",
    "longitude",
    "latitude",
    "duration"
]

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
		const routes = await knex("route")
			.whereIn("id", routeIDs)

		if (!routes) {
			setError("No route found.", 400);
			return;
		}

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};
