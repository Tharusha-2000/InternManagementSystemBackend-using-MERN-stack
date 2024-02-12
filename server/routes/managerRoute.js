const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV= require('../config.js');

router.post("/managerlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne( {role: "manager"});

    if (!user) {
      return res.status(404).json({ loginStatus: false, Error: "manager not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.hashedPassword);

    if (!isPasswordValid) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect password" });
    }
    const isEmailValid = await User.findOne({ email });

    if (!isEmailValid) {
      return res.status(401).json({ loginStatus: false, Error: "Incorrect email" });
    }
    const token = jwt.sign(
      { role: "manager", email: User.email, id: User._id }, ENV.JWT_SECRET,
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


