const { checkEmptyArray } = require("../utils/checkerUtils");
const placeModel = require("../models/place");

exports.createPlace = async (places, routeID) => {
	try {
		checkEmptyArray(places);

		await Promise.all(
			places.map(async (place, index) => {
				const newPlace = {
					route_id: routeID,
					latitude: place.latitude,
					longitude: place.longitude,
					google_place_id: place.place_id,
					name: place.name,
					vicinity: place.vicinity,
					query_keyword: place.query_keyword,
					query_mood: place.query_mood,
					waypoints_position: index,
				};
				await placeModel.create(newPlace);
			})
		);

		return;
	} catch (error) {
		throw error;
	}
};
