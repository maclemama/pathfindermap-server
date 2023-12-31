exports.checkEmptyObject = (inputObj) => {
	if (inputObj.constructor !== Object) {
		throw {
			message: "The input should be an object.",
			statusCode: 400,
		};
	}
	if (Object.keys(inputObj).length === 0) {
		throw {
			message: "The input should not be empty.",
			statusCode: 400,
		};
	}
	return;
};

exports.checkEmptyArray = (inputAry) => {
	if (!Array.isArray(inputAry)) {
		throw {
			message: "The input should be an Array.",
			statusCode: 400,
		};
	}
	if (!inputAry[0]) {
		throw {
			message: "The input should not be empty.",
			statusCode: 400,
		};
	}
	return;
};

exports.checkFilledAllFieldObject = (inputObj, requiredFieldsAry) => {
	const notFound = [];
	let allFilled = true;
	requiredFieldsAry.forEach((field) => {
		if (inputObj[field] === undefined || inputObj[field] === "") {
			notFound.push(field);
			allFilled = false;
		}
	});
	if (allFilled) {
		return;
	} else {
		throw {
			message: `All fields are required, missing ${notFound.join()}.`,
			statusCode: 400,
		};
	}
};

exports.checkValidEmail = (email) => {
	let emailReg = new RegExp("^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+[.][a-zA-Z]{2,})$");
	let validEmail = emailReg.test(email);
	if (!validEmail) {
		throw {
			message:
				"Invalid email, please enter email in following format abc@example.com",
			statusCode: 400,
		};
	}
	return;
};
