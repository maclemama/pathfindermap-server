const {
	checkEmptyArray,
	checkEmptyObject,
	checkFilledAllFieldObject,
} = require("../utils/checkerUtils");
const jwt = require("jsonwebtoken");
const routeModel = require("../models/route");
const placeModel = require("../models/place");
const placeController = require("../controllers/place-controller");
const { setError } = require("../utils/errorUtils");
const { getObjectValueByName } = require("../utils/dataUtils");

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

		const resultRoutes = [...allRoutes].splice(pageID * 10 - 10, 10);

		const results = {
			total_page: totalPage,
			current_page: pageID,
			next_page: pageID >= totalPage ? false : pageID + 1,
			data: resultRoutes,
		};

		// return data
		res.status(200).json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};

exports.searchRoute = async (req, res) => {
	// if there is no auth header provided
	if (!req.headers.authorization) {
		res.status(401).send("Please login");
		return;
	}

	const query = req.query.search;

	// parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		// verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const userID = Number(decodedToken.id);

		const allRoutes = await routeModel.getByQuery(query,{
			"user_id": userID,
			"user_saved": true,
		});
		console.log(allRoutes.length)

		const results = {
			total_page: 1,
			current_page: 1,
			next_page: null,
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
					created_at: route.created_at,
					route_waypoints: [],
					walking_distance: route.walking_distance,
					walking_time: route.walking_time,
					address: route.address,
					place_id: route.place_id,
					title: route.title,
					type: route.type,
					polyline: route.polyline,
					summary: route.summary,
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
						query_keyword,
						query_mood,
						created_at,
					}) => {
						return {
							query_keyword,
							query_mood,
							waypoints_position,
							latitude,
							longitude,
							place_id: google_place_id,
							name,
							vicinity,
							created_at,
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

exports.createRoute = async (req, res) => {
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
		if (!userID) {
			setError("Please login to save path", 400);
		}

		// check payload
		const payload = req.body;

		checkEmptyObject(payload);
		const requiredFields = [
			"id",
			"longitude",
			"latitude",
			"address",
			"place_id",
			"user_saved",
			"polyline",
			"summary",
		];
		checkFilledAllFieldObject(payload, requiredFields);

		const allFields = [
			"id",
			"longitude",
			"latitude",
			"user_saved",
			"user_selected",
			"walking_distance",
			"walking_time",
			"address",
			"place_id",
			"title",
			"type",
			"polyline",
			"summary",
		];

		const routeConfig = getObjectValueByName(payload, allFields);
		routeConfig.user_id = userID;

		const { existed_route, new_route } = await routeModel.create(routeConfig);
		if (!existed_route) {
			// if it is not an exsiting route, create place records.
			await placeController.createPlace(payload.route_waypoints, payload.id);
		}

		res.status(200).json(new_route);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};

exports.deleteRoute = async (req, res) => {
	try {
		// if there is no auth header provided
		if (!req.headers.authorization) {
			setError("Please login to continue", 401);
			return;
		}

		// parse the bearer token
		const authToken = req.headers.authorization.split(" ")[1];

		// verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const userID = Number(decodedToken.id);
		if (!userID) {
			setError("Please login to save path", 400);
		}

		// check payload
		const payload = req.body;
		checkEmptyObject(payload);
		const requiredFields = ["route_id"];
		checkFilledAllFieldObject(payload, requiredFields);

		const targetRouteToDelete = await routeModel.get({
			user_id: userID,
			id: payload.route_id,
		});

		if (targetRouteToDelete[0]) {
			await routeModel.delete(payload.route_id);
			res.status(200).json({
				success: true,
			});
		} else {
			setError("Path doesn't exist or not belong to current user", 401);
		}
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
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
		let toggle;
		if (action === "save") {
			toggle = true;
		}

		if (action === "unsave") {
			toggle = false;
		}

		const result = await routeModel.saveUnsave(routeID, toggle);

		// return data
		res.status(200).json({
			user_saved: !!result[0].user_saved,
		});
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
