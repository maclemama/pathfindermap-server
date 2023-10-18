const ENV = process.env.ENV;

exports.setError = (errorMessage, statusCode, nativeError) => {
	let error = {};

	if (nativeError && nativeError.message && nativeError.statusCode) {
		error = nativeError;
	} else {
		error.message = errorMessage ? errorMessage : "Unknown error.";
		if (ENV === "DEV" && nativeError) {
			error.native_error = nativeError;
		}
		error.statusCode = statusCode ? statusCode : 500;
	}
	console.error(nativeError)
	throw error;
};
