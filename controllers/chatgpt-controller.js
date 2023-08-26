const OpenAI = require("openai");
const ENV = process.env.ENV;

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

exports.getPlaceType = async () => {
	const chatCompletion = await openai.chat.completions.create({
		messages: [{ role: "user", content: "Say this is a test" }],
		model: "gpt-3.5-turbo",
	});
};
