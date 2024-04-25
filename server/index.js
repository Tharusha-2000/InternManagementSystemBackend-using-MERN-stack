require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dbconfig = require("./utils/db.js");
const Evaluationformdetails = require('./models/Evaluationformdetails.js');
const userRoute = require("./routes/usersRoute.js");

const body=require('body-parser');

const app = express() 

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', "DELETE"],
    credentials: true
 }))

app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());



app.use("/api/users", userRoute);
app.use(express.static('Public'))
app.use(body.json());

app.listen(8000, () => {
      console.log("Server is running")
      
    })



