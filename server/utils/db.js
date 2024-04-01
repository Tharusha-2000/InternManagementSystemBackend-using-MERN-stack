const ENV= require('../config.js');
const  mongoose  = require("mongoose");
require("dotenv").config();
var mongoURL = ENV.DBUrl;

mongoose.connect(process.env.MONGODB_URI || mongoURL)
    .then(() => {
        console.log('MongoDB Connection Successful');
      })
      .catch((error) => {
        console.error('MongoDB Connection Failed:', error);
      });
  

module.exports = mongoose;