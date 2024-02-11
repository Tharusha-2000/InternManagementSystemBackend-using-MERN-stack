const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports.createSecretToken = (id, tokenKey) => {
  return jwt.sign({ id }, tokenKey, {
    expiresIn: 3 * 24 * 60 * 60,
  });
};

