const ENV = process.env.ENV;

exports.setError = (errorMessage, statusCode, nativeError) => {
	let error = {};
	console.log(errorMessage)
	console.log(nativeError)

	if (nativeError.message && nativeError.statusCode) {
		error = nativeError;
	} else {
		error.message = errorMessage ? errorMessage : "Unknown error.";
		if (ENV === "DEV" && nativeError) {
			error.native_error = nativeError;
			console.error(error)
		}
		error.statusCode = statusCode ? statusCode : 500;
	}

	throw error;
};
