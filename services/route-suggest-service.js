const { getDistance } = require("geolib");
const googleService = require("../services/google-service");
const chatgptService = require("../services/chatgpt-service");
const { getRandomElementsFromArray } = require("../utils/dataUtils");
const { setError } = require("../utils/errorUtils");

const formatPlaceOutput = (placeData, startingLatLng, keyword, query_mood) => {
	const formattedPlace = [];

	for (const place in placeData) {
		let thisPlace = placeData[place];

		const thisLatLng = {
			latitude: thisPlace.geometry.location.lat,
			longitude: thisPlace.geometry.location.lng,
		};

		const distance = getDistance(startingLatLng, thisLatLng);
		const walkingTimeMinute = Math.floor(distance / 80); //80m is average walking distance per mintue

		let placeOutput = {
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

		if (keyword) {
			placeOutput.query_keyword = keyword;
		}

		if(query_mood){
			placeOutput.query_mood = query_mood;
		}

		formattedPlace.push(placeOutput);
	}

	return formattedPlace;
};

const orderByBestPlace = (placeData) => {
	const scoreWeight = {
		distance: 60,
		not_selected: 15,
		rating: 25,
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
		if (place.user_ratings_total === 0 || !place.rating) {
			ratingScore = scoreWeight.rating / 2;
		} else {
			ratingScore = (place.rating / 5) * scoreWeight.rating;
		}
		const notSelectedSocre = place.is_selected ? 0 : scoreWeight.not_selected;
		const placeScoreTotal = distanceScore + ratingScore + notSelectedSocre;

		newPlaceData[index].place_score = placeScoreTotal;
	});

	// sort place by place score, highest point come first
	newPlaceData.sort(
		(firstItem, secondItem) => secondItem.place_score - firstItem.place_score
	);

	return newPlaceData;
};

const routeSuggest = (placesAry, latitude, longitude, duration, max_route, query_mood) => {
	try {
		const maxRoute = max_route;
		const centerLatLng = { latitude: latitude, longitude: longitude };

		// get the first waypoint suggestion by distance
		let firstLayerWaypoints;
		let firstLayerWaypointsIndex = 0;

		for (const waypoint in placesAry) {
			const thisWaypoint = placesAry[waypoint];
			const keyword = thisWaypoint.keyword;

			// check api response status for this layer of waypoints
			if (thisWaypoint.status === "OK") {
				const thisPlaces = thisWaypoint.results;
				const formattedPlaces = formatPlaceOutput(
					thisPlaces,
					centerLatLng,
					keyword,
					query_mood
				);
				const bestPlaces = orderByBestPlace(formattedPlaces);

				firstLayerWaypoints = bestPlaces.slice(0, maxRoute);
				firstLayerWaypointsIndex = Number(waypoint);
				break;
			}
		}

		const routes = firstLayerWaypoints.map((firstSuggestion) => {
			const suggestedRoute = {
				route_duration: firstSuggestion.walking_time,
				longitude: longitude,
				latitude: latitude,
				user_saved: false,
				route_waypoints: [firstSuggestion],
			};
			let startingLatLng = firstSuggestion;

			for (
				let i = firstLayerWaypointsIndex + 1;
				i < placesAry.length - firstLayerWaypointsIndex;
				i++
			) {
				const thisWaypoint = placesAry[i];
				const keyword = thisWaypoint.keyword;
				if (
					thisWaypoint.status === "OK" &&
					suggestedRoute.route_duration < duration
				) {
					const formattedPlaces = formatPlaceOutput(
						thisWaypoint.results,
						startingLatLng,
						keyword,
						query_mood
					);
					const bestPlace = orderByBestPlace(formattedPlaces)[0];
					suggestedRoute.route_waypoints.push(bestPlace);
					suggestedRoute.route_duration =
						suggestedRoute.route_duration + bestPlace.walking_time;
					startingLatLng = bestPlace;
				}
			}

			return suggestedRoute;
		});

		return routes;
	} catch (error) {
		setError("Error calculating routes", 500, error);
	}
};

exports.keywordQueryFlow = async (payload) => {
	let {
		query_keyword,
		duration,
		longitude,
		latitude,
		radius,
		opennow_only,
		max_route,
	} = payload;

	try {
		query_keyword = query_keyword.split(",");
		// get places for different keywords
		const allKeywordPlacesResults = [];

		for (const keyword in query_keyword) {
			const thisKeyword = query_keyword[keyword];
			const additionParams = {
				keyword: thisKeyword,
			};
			if (opennow_only) {
				additionParams.opennow = true;
			}
			let keywordPlaceResult = await googleService.getGooglePlace(
				latitude,
				longitude,
				radius,
				1,
				additionParams
			);

			keywordPlaceResult.keyword = thisKeyword;

			allKeywordPlacesResults.push(keywordPlaceResult);
		}

		// form route suggestions
		const routes = routeSuggest(
			allKeywordPlacesResults,
			latitude,
			longitude,
			duration,
			max_route
		);

		// return places data and route data
		return routes;
	} catch (error) {
		setError("Error calculating routes", 500, error);
	}
};

exports.placeTypeQueryFlow = async (payload) => {
	const {
		query_mode,
		query_mood,
		duration,
		longitude,
		latitude,
		radius,
		opennow_only,
		max_route,
	} = payload;

	try {
		let placeType;
		// get google place type conversion from chatGPT
		if (query_mode === "mood") {
			placeType = await chatgptService.getPlaceType(query_mood);
		} else if (query_mode === "random") {
			const allRecommendedPlaceTypes = [
				"amusement_park",
				"aquarium",
				"art_gallery",
				"bakery",
				"beauty_salon",
				"book_store",
				"bowling_alley",
				"cafe",
				"campground",
				"church",
				"city_hall",
				"department_store",
				"electronics_store",
				"furniture_store",
				"home_goods_store",
				"library",
				"movie_theater",
				"museum",
				"park",
				"restaurant",
				"spa",
				"stadium",
				"supermarket",
				"tourist_attraction",
				"zoo",
			];
			placeType = getRandomElementsFromArray(allRecommendedPlaceTypes, 4);
		}

		// get places for different keywords
		const allPlaceResults = [];

		if (placeType) {
			for (const place in placeType) {
				const thisPlaceType = placeType[place];
				const additionParams = {
					type: thisPlaceType,
				};
				if (opennow_only) {
					additionParams.opennow = true;
				}
				const placesResults = await googleService.getGooglePlace(
					latitude,
					longitude,
					radius,
					1,
					additionParams
				);

				if (query_mode === "mood") {
					placesResults.mood = thisPlaceType;
				}

				allPlaceResults.push(placesResults);
			}
		} else {
			const additionParams = {
				keyword: query_mood,
			};
			if (opennow_only) {
				additionParams.opennow = true;
			}
			const placesResults = await googleService.getGooglePlace(
				latitude,
				longitude,
				radius,
				1,
				additionParams
			);

			allPlaceResults.push(placesResults);
		}

		// form route suggestions
		const routes = routeSuggest(
			allPlaceResults,
			latitude,
			longitude,
			duration,
			max_route,
			query_mood
		);

		// return places data and route data
		return routes;
	} catch (error) {
		setError("Error calculating routes", 500, error);
	}
};
