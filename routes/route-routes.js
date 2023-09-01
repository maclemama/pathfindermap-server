const express = require("express");
const router = express.Router();
const routeController = require("../controllers/route-controller");

router.route("/details").get(routeController.getRouteDetails);

router.route("/page/:page").get(routeController.getRoute);

router.route("/:route_id/:action").patch(routeController.saveUnsaveRoute);

module.exports = router;
