const OpenAI = require("openai");
const { getCurrentTimeFormatted } = require("../utils/timeUtils");

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

exports.getPlaceType = async (mood) => {
	try {
		const currentTime = getCurrentTimeFormatted();
		
		const chatResult = await openai.chat.completions.create({
			messages: [
				{
					role: "user",
					content: `Select relevant Google Maps Places API place type for the objective \"${mood}\" that suitable to go now at ${currentTime}. include answer in javascript array format without explanation`,
				},
			],
			model: "gpt-3.5-turbo",
			temperature: 0.2,
		});

		const responseContent =
			chatResult.choices &&
			chatResult.choices[0] &&
			chatResult.choices[0].message.content;
		const placeTypes = JSON.parse(responseContent);

		if (Array.isArray(placeTypes)) {
			return placeTypes;
		} else {
			//return false to trigger using the mood input as a keyword to search google place in next step.
			return false;
		}

	} catch (error) {
		return false;
	}
};
