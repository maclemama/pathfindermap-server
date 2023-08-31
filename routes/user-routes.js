const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.route("/register").post(userController.createUser);

router.route("/verify").post(userController.verifyUser);

module.exports = router;
