const {
	checkFilledAllFieldObject,
	checkEmptyObject,
	checkValidEmail,
} = require("../utils/checkerUtils");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user");
const emailService = require("../services/email-service");
const { setError } = require("../utils/errorUtils");

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

		await emailService.send(
			`Pathfinder Map <${process.env.EMAIL_USER}>`,
			email,
			"verify",
			{
				verification_url: `${process.env.DEV_HOST}:${process.env.PORT}/user/verify/${results.verification_code}`,
			}
		);

		res.status(201).json({
			success: true,
			user_id: results.id,
		});
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};

exports.verifyUser = async (req, res) => {
	const payload = req.body;
	const requiredFields = ["verification_code"];

	try {
		const { verification_code } = req.body;
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		await userModel.verify(verification_code);

		res.status(201).json({
			success: true,
		});
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};


exports.loginUser = async (req, res) => {
	const payload = req.body;
	const requiredFields = ["email", "password"];

	try {
		const { email, password } = req.body;
		checkEmptyObject(payload);
		checkFilledAllFieldObject(payload, requiredFields);

		// Find the user
		const user = await userModel.get({ email, email });

		// Check if user verified
		if(!user.verified){
			setError("Unverified user.", 400);
		}

		// Check the password
		const isPasswordCorrect = bcrypt.compareSync(password, user.password);
		if (!isPasswordCorrect) {
			setError("Invalid password.", 400);
		}

		// Generate a token
		const token = jwt.sign(
			{ id: user.id, email: user.email },
			process.env.JWT_KEY,
			{ expiresIn: "24h" }
		);
		
		res.status(200).json({ token: token });
	} catch (error) {
		res.status(error.statusCode ? error.statusCode : 500).json(error);
	}
};
