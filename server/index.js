require('dotenv').config();
const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const Evaluationformdetails = require('./models/Evaluationformdetails.js');
const userRoute = require("./routes/usersRoute.js");

const body=require('body-parser');
const app = express() 


const connectDB = require('./utils/db.js');
connectDB();


app.use(cors({
    origin: ["https://imsfrontend.vercel.app"],
    methods: ['GET','POST','PUT',"DELETE"],
    credentials: true
}))
app.set('view engine', 'ejs');
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser());


app.use("/api/users", userRoute);

app.use(express.static('Public'))
app.use(body.json());



app.listen(8007, () => {
   console.log("Server is running")
 })


//using the app object in another file
// if (require.main === module) {
//     // This module was run directly from the command line (i.e. this is the main module)
//     app.listen(8007, () => {
//       console.log("Server is running")
//     });
//   }

//   module.exports = app; // Export the app object  


