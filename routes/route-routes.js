const express = require("express");
const router = express.Router();
const routeController = require("../controllers/route-controller");

router.route("/details").get(routeController.getRouteDetails);

router.route("/:page").get(routeController.getRoute);

module.exports = router;
