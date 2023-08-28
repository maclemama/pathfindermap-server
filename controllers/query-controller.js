const googlePlaceController = require("./google-place-controller");
const chatgptController = require("./chatgpt-controller");
const routesSuggestController = require("./route-suggest-controller");
const ENV = process.env.ENV;

const keywordQueryFlow = async (payload) => {
	const {
		query_mode, // keyword, mood, random
		query_mood, // string
		query_keyword, // array
		duration,
		longitude,
		latitude,
		radius,
		price_range,
		include_indoor,
		include_outdoor,
		opennow_only,
	} = payload;

	// get places for different keywords

	try {
		const allKeywordPlacesResults = [];
		const routeResults = [];
		let inOutDoor = "";

		if (include_indoor && !include_outdoor) {
			inOutDoor = " indoor";
		}

		if (!include_indoor && include_outdoor) {
			inOutDoor = " outdoor";
		}

		for (const keyword in query_keyword) {
			const thisKeyword = query_keyword[keyword];
			const additionParams = {
				keyword: `${thisKeyword}${inOutDoor}`,
				maxprice: price_range[1],
				minprice: price_range[0],
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

exports.createQuery = async (req, res) => {
	const {
		query_mode, // keyword, mood, random
		query_mood, // string
		query_keyword, // array
		duration,
		longitude,
		latitude,
		radius,
		include_indoor,
		include_outdoor,
		opennow_only,
	} = req.body;

	const googlePlaceParamConfig = {
		keyword: {},
	};

	try {
		const results = await keywordQueryFlow(req.body);
		res.json(results);
	} catch (err) {
		const error = {
			message: err.message ? err.message : "Error creating query",
		};
		if (ENV === "DEV") {
			error.native_error = err.native_error ? err.native_error : err;
		}
		res.status(500).json(error);
	}
};
