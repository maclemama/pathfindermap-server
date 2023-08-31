const express = require("express");
const router = express.Router();
const userController = require("../controllers/user-controller");

router.route("/register").post(userController.createUser);

module.exports = router;
