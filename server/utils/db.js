const  mongoose  = require("mongoose");
require("dotenv").config();
var mongoURL = 'mongodb+srv://IMS:IMS123@imsdb.af3d7jt.mongodb.net/'

mongoose.connect(process.env.MONGODB_URI || mongoURL)
    .then(() => {
        console.log('MongoDB Connection Successful');
      })
      .catch((error) => {
        console.error('MongoDB Connection Failed:', error);
      });
  
module.exports = mongoose;