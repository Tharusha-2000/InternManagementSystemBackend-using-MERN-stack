const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const dbconfig = require("./utils/db.js");
const ENV= require('./config.js');
const userRoute = require("./routes/usersRoute.js");
const adminRoute = require("./routes/adminRoute.js");
const internRoute = require("./routes/internRoute.js");
const managerRoute = require("./routes/managerRoute.js");
const mentorRoute = require("./routes/mentorRoute.js");
const evaluvatorRoute = require("./routes/evaluvatorRoute.js");
const app = express() 

app.use(cors({
    origin: ["http://localhost:5173"],
    methods: ['GET', 'POST', 'PUT', "DELETE"],
    credentials: true
}))

app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());

app.use("/api/users", userRoute);
app.use('/api/users', adminRoute);
app.use("/api/users", internRoute);
app.use('/api/users', managerRoute);
app.use('/api/users', mentorRoute); 
app.use('/api/users', evaluvatorRoute);
app.use(express.static('Public'))


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

 
  app.listen(8190, () => {
      console.log("Server is running")
    })