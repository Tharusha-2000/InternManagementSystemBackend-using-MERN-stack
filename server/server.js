
const express = require("express");
const path = require("path");
const morgan = require("morgan");


//const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");


const app = express();
const dbconfig = require("./utils/db.js");
const userRoute = require("./routes/usersRoute.js");
const cors = require('cors');
app.use(morgan('tiny'));


// Enable CORS for all routes
app.use(cors({
  origin: ["http://localhost:5173"],
  methods: ['GET', 'POST', 'PUT', "DELETE"],
  credentials: true
}))
app.use(express.json())

app.use(cookieParser())
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(express.json());

app.use("/api/users", userRoute);

const port = process.env.PORT || 9000;

if (process.env.NODE_ENV == "production") {
  app.use(express.static("client/build"));
}

app.listen(port, () => console.log("Node Server Started using Nodemon!"));