const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { createSecretToken } = require("../utils/SecretToken");
const bcrypt = require("bcryptjs");

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return res.status(400).json({ message: 'Incorrect email' });
    }

    // Compare passwords
    const auth = await bcrypt.compare(password, user.password);

    // If passwords don't match, return error
    if (!auth) {
      return res.status(400).json({ message: 'Incorrect password' });
    }

    // Generate and set token
    const token = createSecretToken(user._id);
    res.cookie("token", token, {
      withCredentials: true,
      httpOnly: false,
    });

    // Send success message
    res.status(200).json({ message: "User logged in successfully", success: true });
  } catch (error) {
    // Handle errors
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

