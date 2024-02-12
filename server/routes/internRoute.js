const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


router.post("/internlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne( {role: "intern"});

    if (!user) {
      return res.status(404).json({ loginStatus: false, Error: "intern not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect password" });
    }
    const isEmailValid = await User.findOne({ email });

    if (!isEmailValid) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect email" });
    }
    const token = jwt.sign(
      { role: "intern", email: User.email, id: User._id }, "jwt_secret_key",
      { expiresIn: "1d" }
    );
    res.cookie('token', token);
    res.json({ loginStatus: true });

    

  } catch (error) {
    console.error(error);
    res.status(500).json({ loginStatus: false, Error: "Internal Server Error" });
  }
});
module.exports = router;