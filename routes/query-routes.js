const express = require("express");
const router = express.Router();
const queryController = require("../controllers/query-controller");

router.route("/").post(queryController.createQuery);

module.exports = router;
