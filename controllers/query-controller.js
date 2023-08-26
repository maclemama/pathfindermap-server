const googlePlaceController = require("./google-place-controller");
const chatgptController = require("./chatgpt-controller");
const ENV = process.env.ENV;

exports.createQuery = async (req, res) => {
	const {
		query_mode,
		query_mood,
		query_purpose,
		duration,
		longitude,
		latitude,
		radius,
	} = req.body;

	try {
		const { results, next_page_token } =
			await googlePlaceController.getGooglePlace(
				latitude,
				longitude,
				radius,
				3
			);

		console.log(next_page_token);
		res.json(results);
        
	} catch (err) {
		const error = {
			message: "Error creating query",
		};
		if (ENV === "DEV") {
			error.native_error = err;
		}
		res.status(500).json();
	}
};
