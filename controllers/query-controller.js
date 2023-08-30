const googlePlaceController = require("./google-place-controller");
const chatgptController = require("./chatgpt-controller");
const routesSuggestController = require("./route-suggest-controller");
const ENV = process.env.ENV;
const {
	checkFilledAllFieldObject,
	checkEmptyObject,
} = require("../utils/checkerUtils");

const keywordQueryFlow = async (payload) => {
	const { query_keyword, duration, longitude, latitude, radius, opennow_only } =
		payload;

	try {
		// get places for different keywords
		const allKeywordPlacesResults = [];

		for (const keyword in query_keyword) {
			const thisKeyword = query_keyword[keyword];
			const additionParams = {
				keyword: thisKeyword,
			};
			if (opennow_only) {
				additionParams.opennow = true;
			}
			const keywordPlaceResult = await googlePlaceController.getGooglePlace(
				latitude,
				longitude,
				radius,
				1,
				additionParams
			);

			keywordPlaceResult.keyword = thisKeyword;

			allKeywordPlacesResults.push(keywordPlaceResult);
		}

		// form route suggestions
		const routes = routesSuggestController.routeSuggest(
			allKeywordPlacesResults,
			latitude,
			longitude,
			duration
		);

		// return places data and route data
		return routes;
	} catch (err) {
		throw err;
	}
};

const placeTypeQueryFlow = async (payload) => {
	const { query_mood, duration, longitude, latitude, radius, opennow_only, user_id } =
		payload;

	try {
		// get google place type conversion from chatGPT
		const placeType = await chatgptController.getPlaceType(query_mood);

		// get places for different keywords
		const allMoodPlacesResults = [];

		if (placeType) {
			for (const place in placeType) {
				const thisMood = placeType[place];
				const additionParams = {
					type: thisMood,
				};
				if (opennow_only) {
					additionParams.opennow = true;
				}
				const moodPlacesResults = await googlePlaceController.getGooglePlace(
					latitude,
					longitude,
					radius,
					1,
					additionParams
				);

				moodPlacesResults.mood = thisMood;

				allMoodPlacesResults.push(moodPlacesResults);
			}
		}else{
			const additionParams = {
				keyword: query_mood,
			};
			if (opennow_only) {
				additionParams.opennow = true;
			}
			const moodPlacesResults = await googlePlaceController.getGooglePlace(
				latitude,
				longitude,
				radius,
				1,
				additionParams
			);

			allMoodPlacesResults.push(moodPlacesResults);
		}

		// form route suggestions
		const routes = routesSuggestController.routeSuggest(
			allMoodPlacesResults,
			latitude,
			longitude,
			duration
		);

		// return places data and route data
		return routes;
	} catch (err) {
		throw err;
	}
};

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
		keyword: keywordQueryFlow,
		mood: placeTypeQueryFlow,
		random: placeTypeQueryFlow,
	};

	try {
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		const results = await queryFlow[payload.query_mode](payload);

		res.json(results);
	} catch (err) {
		const error = {
			message: err.message ? err.message : "Error creating query",
		};
		if (ENV === "DEV") {
			error.native_error = err.native_error ? err.native_error : err;
		}
		res.status(err.statusCode ? err.statusCode : 500).json(error);
	}
};
