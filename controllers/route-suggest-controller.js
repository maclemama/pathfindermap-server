const { getDistance } = require("geolib");
const ENV = process.env.ENV;

const formatPlaceOutput = (placeData, startingLatLng) => {
	const formattedPlace = [];

	for (const place in placeData) {
		let thisPlace = placeData[place];

		const thisLatLng = {
			latitude: thisPlace.geometry.location.lat,
			longitude: thisPlace.geometry.location.lng,
		};

		const distance = getDistance(startingLatLng, thisLatLng);
		const walkingTimeMinute = Math.floor(distance / 80); //80m is average walking distance per mintue

		const placeOutput = {
			latitude: thisLatLng.latitude,
			longitude: thisLatLng.longitude,
			open_now: thisPlace.opening_hours ? thisPlace.opening_hours.open_now : "",
			place_id: thisPlace.place_id,
			price_level: thisPlace.price_level,
			rating: thisPlace.rating,
			name: thisPlace.name,
			user_ratings_total: thisPlace.user_ratings_total,
			vicinity: thisPlace.vicinity,
			photo_reference:
				thisPlace.photos &&
				thisPlace.photos[0] &&
				thisPlace.photos[0].photo_reference,
			walking_time: walkingTimeMinute,
			distance: distance,
			is_selected: false,
		};

		formattedPlace.push(placeOutput);
	}

	return formattedPlace;
};

const orderBestPlace = (placeData) => {
	const scoreWeight = {
		distance: 40,
		not_selected: 20,
		rating: 30,
	};
	const newPlaceData = [...placeData];

	// sort place by distance, most far away come first
	newPlaceData.sort(
		(firstItem, secondItem) => secondItem.distance - firstItem.distance
	);

	newPlaceData.forEach((place, index) => {
		const distanceScore =
			((index + 1) / newPlaceData.length) * scoreWeight.distance;
		let ratingScore;
		if (place.user_ratings_total === 0) {
			ratingScore = scoreWeight.rating / 2;
		} else {
			ratingScore = (place.rating / 5) * scoreWeight.rating;
		}
		const notSelectedSocre = place.is_selected ? 0 : scoreWeight.not_selected;
		const placeScoreTotal = distanceScore + ratingScore + notSelectedSocre;

		newPlaceData[index].place_score = placeScoreTotal;
	});

	// sort place by distance, most far away come first
	newPlaceData.sort(
		(firstItem, secondItem) => secondItem.place_score - firstItem.place_score
	);

	return newPlaceData;
};

exports.routeSuggest = (placesAry, latitude, longitude, duration, max_route) => {
	try {
		const maxRoute = max_route;
		const centerLatLng = { latitude: latitude, longitude: longitude };

		// get the first waypoint suggestion by distance
		let firstLayerWaypoints;
		let firstLayerWaypointsIndex = 0;

		for (const waypoint in placesAry) {
			const thisWaypoint = placesAry[waypoint];

			// check api response status for this layer of waypoints
			if (thisWaypoint.status === "OK") {
				const thisPlaces = thisWaypoint.results;
				const formattedPlaces = formatPlaceOutput(thisPlaces, centerLatLng);
				const bestPlaces = orderBestPlace(formattedPlaces);

				firstLayerWaypoints = bestPlaces.slice(0, maxRoute);
				firstLayerWaypointsIndex = Number(waypoint);
				break;
			}
		}

		const routes = firstLayerWaypoints.map((firstSuggestion) => {
			const suggestedRoute = {
				route_duration: firstSuggestion.walking_time,
				route_waypoints: [firstSuggestion],
			};
			let startingLatLng = firstSuggestion;

			for (
				let i = firstLayerWaypointsIndex + 1;
				i < placesAry.length - firstLayerWaypointsIndex;
				i++
			) {
				const thisWaypoint = placesAry[i];
				if (
					thisWaypoint.status === "OK" &&
					suggestedRoute.route_duration < duration
				) {
					const formattedPlaces = formatPlaceOutput(
						thisWaypoint.results,
						startingLatLng
					);
					const bestPlace = orderBestPlace(formattedPlaces)[0];
					suggestedRoute.route_waypoints.push(bestPlace);
					suggestedRoute.route_duration =
						suggestedRoute.route_duration + bestPlace.walking_time;
					startingLatLng = bestPlace;
				}
			}

			return suggestedRoute;
		});

		return routes;
	} catch (err) {
		console.error(err);
		throw {
			message: "Error calculating routes",
			native_error: err,
		};
	}
};
