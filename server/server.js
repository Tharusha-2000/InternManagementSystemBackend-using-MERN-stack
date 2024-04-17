const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dbconfig = require("./utils/db.js");
const ENV= require('./config.js');


const cvfilesRoutes = require('./routes/cvfiles.js');
const userRoute = require("./routes/usersRoute.js");
const internRoute = require("./routes/internRoute.js");

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


// Routes for CV files

app.use("/api/cvfiles", cvfilesRoutes)



app.use("/api/users", internRoute);
app.use("/api/users", userRoute);
app.use(express.static('Public'))
app.use(body.json());
/*
const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if(token) {
      jwt.verify(token, ENV.JWT_SECRET, (err ,decoded) => {
          if(err) return res.json({Status: false, Error: "Wrong Token"})
          req.id = decoded.id;
          req.role = decoded.role;
          next()
          
      })
  } else {
      return res.json({Status: false, Error: "Not autheticated"})
  }
 }

   app.get('/verify',verifyUser, (req, res)=> {
       return res.json({Status: true, role: req.role, id: req.id})
    })
*/


 
  app.listen(8001, () => {
      console.log("Server is running")
      
    })




