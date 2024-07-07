const  mongoose  = require("mongoose");
var mongoURL = process.env.DBUrl;

const connectDB = async() => {
        try {
           mongoose.set("strictQuery", false);
            await mongoose.connect(mongoURL);
            console.log('mongodb connection SUCCESS');
        } catch (error) {
            console.log('mongodb connection FAIL');
            console.log(error);
            process.exit(1);
        }
   
   }
   
   module.exports = connectDB;
