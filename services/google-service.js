const { Client } = require("@googlemaps/google-maps-services-js");
const { setTimeout } = require("timers/promises");
const client = new Client({});
const { setError } = require("../utils/errorUtils");

exports.getGooglePlace = async (lat, lng, radius, page, additionalOptions) => {
	try {
		const params = {
			location: { lat: lat, lng: lng },
			radius: radius,
			key: process.env.GOOGLE_MAP_API_KEY,
			...additionalOptions,
		};

		const { data } = await client.placesNearby({ params: params });

		// handle requests with more than 1 page (20 results)
		if (page > 1) {
			let nextPageToken = data.next_page_token;

			if (nextPageToken) {
				for (let i = 1; i < page; i++) {
					// google map prevent api users from making multiple calls at once, delay 2 seconds
					await setTimeout(2000);

					// call api to get next page data
					const nextPageRes = await client.placesNearby({
						params: {
							...params,
							key: process.env.GOOGLE_MAP_API_KEY,
							pagetoken: nextPageToken,
						},
					});

					// inject next page data into final result and replace next page token for next api call
					const nextPageResult = nextPageRes.data.results;
					nextPageToken = nextPageRes.data.next_page_token;
					data.results = [...data.results, ...nextPageResult];
				}
			}

			data.next_page_token = nextPageToken;
		}

		return data;
	} catch (error) {
		setError("Error getting Google Place data", 500, error)
	}
};
