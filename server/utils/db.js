const  mongoose  = require("mongoose");
var mongoURL = process.env.DBUrl;
mongoose.connect(process.env.MONGODB_URI || mongoURL)
    .then(() => {

        console.log('MongoDB Connection Successful');
      })
      .catch((error) => {
        console.error('MongoDB Connection Failed:', error);
      });
  

module.exports = mongoose;