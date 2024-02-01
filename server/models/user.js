const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: false,
    },

    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    //roll: {
     // type: Boolean,
     // default: "visitor",
    //},
  },
//  {
  //  timestamps: true,
 // }
);

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;