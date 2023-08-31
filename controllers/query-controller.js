const googlePlaceController = require("./google-place-controller");
const chatgptController = require("./chatgpt-controller");
const routesSuggestController = require("./route-suggest-controller");
const ENV = process.env.ENV;
const {
	checkFilledAllFieldObject,
	checkEmptyObject,
} = require("../utils/checkerUtils");
const { getRandomElementsFromArray } = require("../utils/dataUtils");

const keywordQueryFlow = async (payload) => {
	const { query_keyword, duration, longitude, latitude, radius, opennow_only, max_route } =
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
			duration,
			max_route
		);

		// return places data and route data
		return routes;
	} catch (err) {
		throw err;
	}
};

const placeTypeQueryFlow = async (payload) => {
	const {
		query_mode,
		query_mood,
		duration,
		longitude,
		latitude,
		radius,
		opennow_only,
		max_route,
		user_id,
	} = payload;

	try {
		let placeType;
		// get google place type conversion from chatGPT
		if (query_mode === "mood") {
			placeType = await chatgptController.getPlaceType(query_mood);
		} else if (query_mode === "random") {
			const allRecommendedPlaceTypes = [
				"amusement_park",
				"aquarium",
				"art_gallery",
				"bakery",
				"beauty_salon",
				"book_store",
				"bowling_alley",
				"cafe",
				"campground",
				"church",
				"city_hall",
				"department_store",
				"electronics_store",
				"furniture_store",
				"home_goods_store",
				"library",
				"movie_theater",
				"museum",
				"park",
				"restaurant",
				"spa",
				"stadium",
				"supermarket",
				"tourist_attraction",
				"zoo",
			];
			placeType = getRandomElementsFromArray(allRecommendedPlaceTypes, 10);
		}

		// get places for different keywords
		const allPlaceResults = [];

		if (placeType) {
			for (const place in placeType) {
				const thisPlaceType = placeType[place];
				const additionParams = {
					type: thisPlaceType,
				};
				if (opennow_only) {
					additionParams.opennow = true;
				}
				const placesResults = await googlePlaceController.getGooglePlace(
					latitude,
					longitude,
					radius,
					1,
					additionParams
				);

				if (query_mode === "mood") {
					placesResults.mood = thisPlaceType;
				}

				allPlaceResults.push(placesResults);
			}
		} else {
			const additionParams = {
				keyword: query_mood,
			};
			if (opennow_only) {
				additionParams.opennow = true;
			}
			const placesResults = await googlePlaceController.getGooglePlace(
				latitude,
				longitude,
				radius,
				1,
				additionParams
			);

			allPlaceResults.push(placesResults);
		}

		// form route suggestions
		const routes = routesSuggestController.routeSuggest(
			allPlaceResults,
			latitude,
			longitude,
			duration,
			max_route
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
