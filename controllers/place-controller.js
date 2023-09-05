const {
	checkEmptyArray,
	checkEmptyObject,
	checkFilledAllFieldObject,
} = require("../utils/checkerUtils");
const placeModel = require("../models/place");
const { setError } = require("../utils/errorUtils");

exports.createPlace = async (places, routeID) => {
	try {
		checkEmptyArray(places);

		const allPlaces = await Promise.all(
			places.map(async (place, index) => {
				const newPlace = {
                    route_id: routeID,
					latitude: place.latitude,
					longitude: place.longitude,
					google_place_id: place.place_id,
					name: place.name,
					vicinity: place.vicinity,
					photo_reference: place.photo_reference,
					query_keyword: place.query_keyword,
					query_mood: place.query_mood,
					waypoints_position: index,
					rating: place.rating,
					user_ratings_total: place.user_ratings_total,
					walking_time: place.walking_time,
					distance: place.distance,
					place_score: place.place_score,
				};
				await placeModel.create(newPlace);
			})
		);

		return;
	} catch (error) {
		throw error;
	}
};
