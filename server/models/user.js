const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    }
  },
);
   userSchema.pre("save", async function () {
       this.password = await bcrypt.hash(this.password, 12);
    });

const userModel = mongoose.model("users", userSchema);

module.exports = userModel;