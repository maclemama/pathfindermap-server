require("dotenv").config();
const express = require("express");
const cors = require("cors");

const queryRoutes = require("./routes/query-routes");
const userRoutes = require("./routes/user-routes");
const routeRoutes = require("./routes/route-routes");

const ENV = process.env.ENV;
const PORT = ENV === "PROD" ? "" : process.env.PORT || 8080;
const HOST = ENV === "PROD" ? process.env.PROD_HOST : process.env.DEV_HOST;

const app = express();

app.use(express.json());

app.use(cors());

app.use("/user", userRoutes);
app.use("/query", queryRoutes);
app.use("/route", routeRoutes);

app.listen(PORT, () => {
	console.log(`Server is running on ${HOST}${ENV === "DEV" ? ":" : ""}${PORT}`);
});
