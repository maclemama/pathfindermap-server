const {
	checkEmptyArray,
	checkEmptyObject,
	checkFilledAllFieldObject,
} = require("../utils/checkerUtils");
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

	const pageID = Number(req.params.page);

	// parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		// verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const userID = Number(decodedToken.id);

		const allRoutes = await routeModel.get({
			user_id: userID,
			user_saved: true,
		});

		const recordsPerPage = 10;
		const totalPage =
			allRoutes.length === 0 ? 0 : Math.ceil(allRoutes.length / recordsPerPage);

		const results = {
			total_page: totalPage,
			current_page: pageID,
			next_page: pageID >= totalPage ? false : pageID + 1,
			data: allRoutes,
		};

		// return data
		res.status(200).json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};

exports.getRouteDetails = async (req, res) => {
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
		const routes = await routeModel.getByID(routeIDs);

		const results = await Promise.all(
			routes.map(async (route) => {
				if (route.user_id !== userID) {
					setError("Permission denied.", 403);
				}
				const routeOutput = {
					route_duration: route.duration,
					route_id: route.id,
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
						rating,
						user_ratings_total,
						distance,
						walking_time,
						place_score,
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
							rating,
							user_ratings_total,
							distance,
							walking_time,
							place_score,
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

exports.createRoute = async (payload) => {
	const requiredFields = ["longitude", "latitude", "duration"];

	try {
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		const route = await routeModel.create(payload);

		return route.id;
	} catch (error) {
		throw error;
	}
};

exports.saveUnsaveRoute = async (req, res) => {
	// if there is no auth header provided
	if (!req.headers.authorization) {
		res.status(401).send("Please login");
		return;
	}

	const action = req.params.action;
	const routeID = req.params.route_id;

	// parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		// verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const userID = Number(decodedToken.id);
		let toggle
		if(action === "save"){
			toggle = true;
		}

		if(action === "unsave"){
			toggle = false;
		}
		
		const allRoutes = await routeModel.saveUnsave(routeID,toggle );

		// return data
		res.status(200).json({
			success: true,
		});
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
