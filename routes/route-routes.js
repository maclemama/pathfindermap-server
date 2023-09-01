const express = require("express");
const router = express.Router();
const routeController = require("../controllers/route-controller");

router.route("/").get(routeController.getRoute);

module.exports = router;
