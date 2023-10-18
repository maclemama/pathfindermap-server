const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth-controller");
const userController = require("../controllers/user-controller");

router.route("/").get(userController.geteUser);

router.route("/register").post(authController.createUser);

router.route("/verify").post(authController.verifyUser);

router.route("/login").post(authController.loginUser);

router.route("/sign-google-url").post(userController.signGoogleURL);


module.exports = router;
