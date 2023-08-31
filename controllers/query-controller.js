const routeSuggestService = require("../services/route-suggest-service");
const {
	checkFilledAllFieldObject,
	checkEmptyObject,
} = require("../utils/checkerUtils");

exports.createQuery = async (req, res) => {
	const payload = req.body;
	const requiredFields = [
		"query_mode",
		"duration",
		"longitude",
		"latitude",
		"radius",
		"opennow_only",
	];
	const queryFlow = {
		keyword: routeSuggestService.keywordQueryFlow,
		mood: routeSuggestService.placeTypeQueryFlow,
		random: routeSuggestService.placeTypeQueryFlow,
	};

	try {
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		// call different control flow service based on different "query_mode"
		const results = await queryFlow[payload.query_mode](payload);

		res.json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
