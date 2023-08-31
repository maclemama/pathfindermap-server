const knex = require("knex")(require("../knexfile"));
const { setError } = require("../utils/errorUtils");

const {
	checkEmptyObject,
	checkFilledAllFieldObject,
} = require("../utils/checkerUtils");
const { getObjectValueByName } = require("../utils/dataUtils");

const allFields = [
	"id",
	"user_name",
	"first_name",
	"last_name",
	"password",
	"email",
	"verified",
	"verification_code",
	"created_at",
];

exports.create = async (payload) => {
	try {
		const newRecordIndex = await knex("user").insert([payload]);
		const results = await knex("user")
			.select(allFields)
			.where({
				id: newRecordIndex[0],
			})
			.first();

		return results;
	} catch (error) {
		let errorMessage, statusCode;
		if (error.code === "ER_DUP_ENTRY") {
			errorMessage =
				"The same email has been registered. Please use the email to signin instead.";
			statusCode = 400;
		} else {
			errorMessage = "Error register user.";
			statusCode = 500;
		}
		setError(errorMessage, statusCode, error);
	}
};

exports.verify = async (verification_code) => {
	try {
		const user = await knex("user")
			.where({ verification_code: verification_code })
			.first();
		console.log(user);
		if (!user) {
			setError("Invalid verification code.", 400);
			return;
		}
		await knex("user").where({ id: user.id }).update({ verified: true });
		return;
	} catch (error) {
		setError("Error verifying user.", 500, error);
	}
};
