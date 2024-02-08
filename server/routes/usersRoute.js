const express = require("express");
const router = express.Router();
const User = require("../models/user");


router.post("/register", async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists." });
    }

    const newUser = new User({ email, password , name});
    await newUser.save();
    res.send("User Registered Successfully");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "User does not exist" });
    }

    if (password !== user.password) {
      return res.status(400).json({ error: "Invalid credentials." });
    }

    res.send("User Logged In Successfully");
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});

module.exports = router;
