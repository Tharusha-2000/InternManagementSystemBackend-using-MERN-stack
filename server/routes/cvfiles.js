const express = require('express');

const router = express.Router();

const createCvfiles = (req, res) => {
  // Your code here
};

// http://localhost:8001/api/cvfiles/
router.post("/", createCvfiles);

module.exports = router;