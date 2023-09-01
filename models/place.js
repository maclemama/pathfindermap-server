const knex = require("knex")(require("../knexfile"));
const { setError } = require("../utils/errorUtils");

const requiredFields = [
	"route_id",
	"google_place_id",
	"longitude",
	"latitude",
	"name",
	"waypoints_position", // 0 base id
    "query_keyword"
];

const allFields = [
	"id",
	"google_place_id",
	"route_id",
	"longitude",
	"latitude",
	"name",
	"waypoints_position",
	"vicinity",
	"photo_reference",
	"query_keyword",
	"created_at",
	"updated_at",
];

exports.get = async (filter) => {
	try {
		const routes = await knex("place").where(filter);

		if (!routes) {
			setError("No place found.", 400);
			return;
		}

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};
