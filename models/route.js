const knex = require("knex")(require("../knexfile"));
const { setError } = require("../utils/errorUtils");

const requiredFields = [
	"id",
	"user_id",
	"longitude",
	"latitude",
	"address",
	"place_id",
	"user_saved",
	"polyline",
	"summary",
];

const allFields = [
	"id",
	"user_id",
	"longitude",
	"latitude",
	"user_saved",
	"user_selected",
	"created_at",
	"updated_at",
	"walking_distance",
	"walking_time",
	"address",
	"place_id",
	"title",
	"type",
	"polyline",
	"summary",
];

exports.getByID = async (routeIDs) => {
	try {
		const routes = await knex("route").whereIn("id", routeIDs);

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};

exports.get = async (filter) => {
	try {
		const routes = await knex("route")
			.where(filter)
			.orderBy("created_at", "asc");

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};

exports.getByQuery = async (query, filter) => {
	try {
		const routes = await knex(knex("route").where(filter).as("route_table"))
			.join(
				knex("place").as("place_table"),
				"route_table.id",
				"place_table.route_id"
			)
			.select(
				"route_table.id",
				"route_table.user_id",
				"route_table.longitude",
				"route_table.latitude",
				"route_table.user_saved",
				"route_table.user_selected",
				"route_table.created_at",
				"route_table.updated_at",
				"route_table.walking_distance",
				"route_table.walking_time",
				"route_table.address",
				"route_table.place_id",
				"route_table.title",
				"route_table.type",
				"route_table.polyline",
				"route_table.summary"
			)
			.distinct("route_table.id")
			.whereILike("route_table.address", `%${query}%`)
			.orWhereILike("route_table.title", `%${query}%`)
			.orWhereILike("place_table.name", `%${query}%`)
			.orWhereILike("place_table.query_keyword", `%${query}%`)
			.orWhereILike("place_table.query_mood", `%${query}%`)
			.orWhereILike("place_table.vicinity", `%${query}%`)
			.orderBy("route_table.created_at", "asc");

		return routes;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};

exports.create = async (payload) => {
	try {
		const existingRecord = await this.get({ id: payload.id });

		let result = {
			existed_route: false,
			new_route: null,
		};
		if (existingRecord[0]) {
			result.existed_route = true;
			await knex("route").update(payload).where({ id: payload.id });
		} else {
			await knex("route").insert([payload]);
		}
		result.new_route = await this.get({ id: payload.id });

		return result;
	} catch (error) {
		setError("Error creating route.", 500, error);
	}
};

exports.delete = async (route_id) => {
	try {
		await knex("route").where({ id: route_id }).del();
		return;
	} catch (error) {
		setError("Error creating route.", 500, error);
	}
};

exports.saveUnsave = async (routeID, saveUnsave) => {
	try {
		const updataResult = await knex("route")
			.update({ user_saved: saveUnsave })
			.where({ id: routeID });
		const result = await knex("route")
			.select("user_saved")
			.where({ id: routeID });
		if (!updataResult) {
			setError("No matching route found", 404);
		}

		return result;
	} catch (error) {
		setError("Error getting uesr.", 500, error);
	}
};
