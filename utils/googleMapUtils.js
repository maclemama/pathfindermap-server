"use strict";

// code copied and modified from google offcial document https://developers.google.com/maps/documentation/maps-static/digital-signature#get-secret

const crypto = require("crypto");
const url = require("url");

/**
 * Convert from 'web safe' base64 to true base64.
 *
 * @param  {string} safeEncodedString The code you want to translate
 *                                    from a web safe form.
 * @return {string}
 */
const removeWebSafe = (safeEncodedString) => {
	return safeEncodedString.replace(/-/g, "+").replace(/_/g, "/");
};

/**
 * Convert from true base64 to 'web safe' base64
 *
 * @param  {string} encodedString The code you want to translate to a
 *                                web safe form.
 * @return {string}
 */
const makeWebSafe = (encodedString) => {
	return encodedString.replace(/\+/g, "-").replace(/\//g, "_");
};

/**
 * Takes a base64 code and decodes it.
 *
 * @param  {string} code The encoded data.
 * @return {string}
 */
const decodeBase64Hash = (code) => {
	// "new Buffer(...)" is deprecated. Use Buffer.from if it exists.
	return Buffer.from ? Buffer.from(code, "base64") : new Buffer(code, "base64");
};

/**
 * Takes a key and signs the data with it.
 *
 * @param  {string} key  Your unique secret key.
 * @param  {string} data The url to sign.
 * @return {string}
 */
const encodeBase64Hash = (key, data) => {
	return crypto.createHmac("sha1", key).update(data).digest("base64");
};

/**
 * Sign a URL using a secret key.
 *
 * @param  {string} path   The url you want to sign.
 * @param  {string} secret Your unique secret key.
 * @return {string}
 */
exports.sign = (path, secret) => {
	const uri = url.parse(path);
	const safeSecret = decodeBase64Hash(removeWebSafe(secret));
	const hashedSignature = makeWebSafe(encodeBase64Hash(safeSecret, uri.path));
	return url.format(uri) + "&signature=" + hashedSignature;
};
