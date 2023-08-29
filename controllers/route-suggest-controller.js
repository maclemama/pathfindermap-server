const { getDistance } = require("geolib");
const ENV = process.env.ENV;

const getWalkingTime = (pointA, pointB) => {
	const avgWalkingMeterPerMinite = 80;
	const distanceMeters = getDistance(pointA, pointB);
	const walkingMintes = Math.floor(distanceMeters / avgWalkingMeterPerMinite);
	return walkingMintes;
};

exports.routeSuggest = (placesAry, latitude, longitude, duration) => {
	try {
		const maxRoute = 5;

		const newPlaceAry = [...placesAry];

		// sort results by rating
		for (const waypoint in newPlaceAry) {
			const thisWaypoint = newPlaceAry[waypoint];
			if (thisWaypoint.status === "OK") {
				let results = thisWaypoint.results;
				results.sort(
					(firstItem, secondItem) => secondItem.rating - firstItem.rating
				);
			}
		}

		let routes = [];

		//start select places for route
		for (let i = 0; i < maxRoute; i++) {
			const suggestedRoute = {
				route_duration: 0,
				route_waypoints: [],
			};
			// specify starting latlng for commute time calculation
			let startingLatLng = { latitude: latitude, longitude: longitude };

			//
			for (const waypoint in newPlaceAry) {
				const thisWaypoint = newPlaceAry[waypoint];

				if (thisWaypoint.status === "OK") {
					let thisPlaces = thisWaypoint.results;
					let wayPointSelectedPlace = false;

					for (const place in thisPlaces) {
						let thisPlace = thisPlaces[place];

						if (!thisPlace.selected || wayPointSelectedPlace) {
							const thisLatitude = thisPlace.geometry.location.lat;
							const thisLongitude = thisPlace.geometry.location.lng;
							const walking_duration = getWalkingTime(startingLatLng, {
								latitude: thisLatitude,
								longitude: thisLongitude,
							});

							const newRouteDuration =
								suggestedRoute.route_duration + walking_duration;

							if (newRouteDuration <= duration) {
								suggestedRoute.route_waypoints.push({
									latitude: thisLatitude,
									longitude: thisLongitude,
									open_now: thisPlace.opening_hours.open_now,
									place_id: thisPlace.place_id,
									price_level: thisPlace.price_level,
									rating: thisPlace.rating,
									name: thisPlace.name,
									user_ratings_total: thisPlace.user_ratings_total,
									vicinity: thisPlace.vicinity,
									walking_duration: walking_duration,
								});

								suggestedRoute.route_duration = newRouteDuration;
								startingLatLng = {
									latitude: thisLatitude,
									longitude: thisLongitude,
								};
								thisPlace.selected = true;
								wayPointSelectedPlace = true;
								break;
							}
						}
					}
				}
			}

			if (suggestedRoute.route_waypoints.length > 0) {
				routes.push(suggestedRoute);
			}
		}

		return routes;
	} catch (err) {
		console.error(err);
		throw {
			message: "Error calculating routes",
			native_error: err,
		};
	}
};
