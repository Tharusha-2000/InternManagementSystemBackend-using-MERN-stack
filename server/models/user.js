const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    
    fname:{
      type: String,
      required: true,
    },
    lname:{
      type: String,
      required: true,
    },
    dob:{
      type: String,
      required: true,
    },
    role:{
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      //mustbe unique
    },

   // hashedPassword: {
    //  type: String,
    //  required: false,
    //},
    password: {
      type: String,
      required: true,
    },
    //username: {
     // type: String,
    //  required: false,
   // }
    
   },
  );
  // userSchema.pre("save", async function () {
   //   this.hashedPassword = await bcrypt.hash(this.password, 12);
    // });


const userModel = mongoose.model("users", userSchema);

module.exports = userModel;