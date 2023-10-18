const {
	checkFilledAllFieldObject,
	checkEmptyObject,
} = require("../utils/checkerUtils");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const googleMapUtils = require("../utils/googleMapUtils");
const { setError } = require("../utils/errorUtils");

exports.geteUser = async (req, res) => {
	// If there is no auth header provided
	if (!req.headers.authorization) {
		res.status(401).send("Please login");
		return;
	}

	// Parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		// Verify the token
		const decodedToken = jwt.verify(authToken, process.env.JWT_KEY);

		// Respond user data
		const user = await userModel.get({ id: decodedToken.id }, [
			"id",
			"first_name",
			"last_name",
		]);

		res.status(200).json(user);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};

exports.signGoogleURL = async (req, res) => {
	// If there is no auth header provided
	if (!req.headers.authorization) {
		res.status(401).send("Please login");
		return;
	}

	// Parse the bearer token
	const authToken = req.headers.authorization.split(" ")[1];

	try {
		const decoedToken = jwt.verify(authToken, process.env.JWT_KEY);
		const payload = req.body;
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, ["url"]);

		const goolgeMapAPISecret = process.env.GOOGLE_MAP_API_SECRET;
		const url = googleMapUtils.sign(payload.url, goolgeMapAPISecret);

		res.status(200).json({ url });
	} catch (error) {
		console.log(error);
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
