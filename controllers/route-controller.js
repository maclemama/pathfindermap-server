const { checkEmptyArray } = require("../utils/checkerUtils");
const jwt = require("jsonwebtoken");
const routeModel = require("../models/route");
const placeModel = require("../models/place");
const { setError } = require("../utils/errorUtils");

exports.getRoute = async (req, res) => {
	// if there is no auth header provided
	if (!req.headers.authorization) {
		res.status(401).send("Please login");
		return;
	}

	// parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		// verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const userID = Number(decodedToken.id);

		// check payload
		const routeIDs = req.body.route;
		checkEmptyArray(routeIDs);

		// get route and place data
		const routes = await routeModel.get(routeIDs);

		const results = await Promise.all(
			routes.map(async (route) => {
				if (route.user_id !== userID) {
					setError("Permission denied.", 403);
				}
				const routeOutput = {
					route_duration: route.duration,
					longitude: route.longitude,
					latitude: route.latitude,
					user_saved: !!route.user_saved,
					route_waypoints: [],
				};

				const places = await placeModel.get({ route_id: route.id });
		
				const allPlaces = places.map(
					({
						longitude,
						latitude,
						google_place_id,
						waypoints_position,
						name,
						vicinity,
						photo_reference,
						query_keyword,
					}) => {
						return {
							query_keyword,
							waypoints_position,
							latitude,
							longitude,
							place_id: google_place_id,
							name,
							vicinity,
							photo_reference,
						};
					}
				);
				routeOutput.route_waypoints = allPlaces;
				return routeOutput;
			})
		);

		// return data
		res.status(200).json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
