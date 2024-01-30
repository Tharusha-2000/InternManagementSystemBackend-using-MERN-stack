const express = require("express");
const path = require("path");

const app = express();

const dbconfig = require("./utils/db.js");
const userRoute = require("./routes/usersRoute.js");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api/users", userRoute);

const port = process.env.PORT || 5000;

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => console.log("Node Server Started using Nodemon!"));