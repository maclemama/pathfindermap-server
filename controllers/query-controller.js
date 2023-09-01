const routeSuggestService = require("../services/route-suggest-service");
const {
	checkFilledAllFieldObject,
	checkEmptyObject,
} = require("../utils/checkerUtils");
const queryModel = require("../models/query");
const placeController = require("../controllers/place-controller");
const routeController = require("../controllers/route-controller");
const jwt = require("jsonwebtoken");

exports.createQuery = async (req, res) => {
	// parse the bearer token
	const authToken = req.headers.authorization
		? req.headers.authorization.split(" ")[1]
		: false;

	const payload = req.body;
	const requiredFields = [
		"query_mode",
		"max_route",
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
		const decodedToken = authToken
			? jwt.verify(authToken, process.env.JWT_KEY)
			: false;
		const userID = decodedToken ? Number(decodedToken.id) : null;

		const createdQuery = await queryModel.create(payload);

		// call different control flow service based on different "query_mode"
		let results = await queryFlow[payload.query_mode](createdQuery);

		// save route to database

		const createdRoutePlace = await Promise.all(
			results.map(async (route, index) => {
				let newRoute = {
					longitude: createdQuery.longitude,
					latitude: createdQuery.latitude,
					duration: route.route_duration,
				};
		
				if(userID){
					newRoute.user_id = userID;
				}
		
				const routeID = await routeController.createRoute(newRoute);
				results[index].route_id = routeID;
				await placeController.createPlace(route.route_waypoints, routeID);
				return;
			})
		);

		// console.log(createdRoutePlace)

		res.status(200).json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
