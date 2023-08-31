const {
	checkFilledAllFieldObject,
	checkEmptyObject,
	checkValidEmail,
} = require("../utils/checkerUtils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");

exports.createUser = async (req, res) => {
	const payload = req.body;
	const requiredFields = [
		"user_name",
		"first_name",
		"last_name",
		"password",
		"email",
	];

	try {
		const { user_name, first_name, last_name, password, email } = req.body;
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);
		checkValidEmail(email);

		const hashedPassword = bcrypt.hashSync(password);
		const newUser = {
			user_name,
			first_name,
			last_name,
			email,
			password: hashedPassword,
		};

		const results = await userModel.create(newUser);

		res.status(201).json(results);
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
