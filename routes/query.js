const express = require("express");
const router = express.Router();
// const googlePlaceController = require("../controllers/google-place-api");
const chatgptController = require("../controllers/chatgpt");

router
	.route("/")
	.post(chatgptController.getPlaceType)

module.exports = router;