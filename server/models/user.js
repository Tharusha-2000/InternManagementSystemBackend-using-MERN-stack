const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    hashedPassword: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      required: true,
    }
   },
  );
   userSchema.pre("save", async function () {
      this.hashedPassword = await bcrypt.hash(this.password, 12);
     });


const userModel = mongoose.model("users", userSchema);

module.exports = userModel;