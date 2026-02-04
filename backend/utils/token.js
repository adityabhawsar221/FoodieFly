const jwt = require("jsonwebtoken");
const genToken = async function (userId) {
  try {
    return jwt.sign({ userId }, process.env.SECRET_KEY, { expiresIn: "7d" });
  } catch (err) {
    console.log("error from utils/token.js - ", err);
    throw err;
  }
}

module.exports = genToken;