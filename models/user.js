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
		const result = {
			success: true,
			user_id: newRecordIndex[0],
		};
		return result;
	} catch (error) {
		let errorMessage, statusCode;
		if (error.code === "ER_DUP_ENTRY") {
			errorMessage =
				"The same email has been registered. Please use the email to signin instead.";
			statusCode = 400;
		} else {
			errorMessage = "Error register user.";
			statusCode = "500";
		}
		setError(errorMessage, statusCode, error);
	}
};
