const express = require("express");
const router = express.Router();

const User = require("../models/user.js");
const Intern = require("../models/intern.js");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const ENV = require('../config.js');

// Create Intern User
router.post('/interns', async (req, res) => {
  try {
    const { userId, ...internData } = req.body; // Assuming userId contains the user ID of the intern
    console.log(userId);
    const user = await User.findById(userId); // Validate user
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const intern = new Intern({ user: userId, ...internData });
    await intern.save();

    res.status(201).json(intern);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});










// Delete Intern and Corresponding User
router.delete('/interns/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete Intern
    const deletedIntern = await Intern.findByIdAndDelete(id);
    if (!deletedIntern) {
      return res.status(404).json({ message: 'Intern user not found' });
    }

    // Delete Corresponding User
    const deletedUser = await User.findByIdAndDelete(deletedIntern.user);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'Intern user and corresponding user deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
