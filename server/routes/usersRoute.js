const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV= require('../config.js');























router.post("/register",async (req, res, next) => {
  
  try {
    const { email, password, username,role, createdAt } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ message: "User already exists" });
       }
    const user = await User.create({ email, password, username,role, createdAt });
    const token = jwt.sign({email: user.email,role: user.role},ENV.JWT_SECRET,{expiresIn: "1d"})

    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
      });
    res
      .status(201)
      .json({ message: "User signed in successfully", success: true, user,token });
      
    next();
  } catch (error) {
    console.error(error);
  }

   });








router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Incorrect email' });
    }
    const auth = await bcrypt.compare(password, user.password);
    
    if (!auth) {
      return res.status(400).json({ message: 'Incorrect password' });
    }
 /*
    // Generate and set token
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });
*/
    // Send success message
    res.status(200).json({ message: "User logged in successfully", success: true });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

