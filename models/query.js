const knex = require("knex")(require("../knexfile"));
const {
	checkEmptyObject,
	checkFilledAllFieldObject,
} = require("../utils/checkerUtils");
const { getObjectValueByName } = require("../utils/dataUtils");

const requiredFields = [
	"query_mode",
	"duration",
	"radius",
	"opennow_only",
	"longitude",
	"latitude",
];

const allFields = [
	"id",
	"user_id",
	"query_mode",
	"duration",
	"radius",
	"opennow_only",
	"longitude",
	"latitude",
	"query_keyword",
	"query_mood",
	"route_id",
	"max_route",
	"created_at",
	"updated_at",
];

exports.create = async (payload) => {
	try {
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		const newQuery = getObjectValueByName(payload, allFields);
		const newRecordIndex = await knex("query").insert([newQuery]);
		const result = await knex("query")
			.select(allFields)
			.where({
				id: newRecordIndex[0],
			})
			.first();

		return result;
	} catch (error) {
		throw error; // handle error from service layer
	}
};
