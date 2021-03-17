const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

async function auth(req, res, next) {
  try {
    const token = req.header("Authorization");
    const decoded = jwt.verify(token, process.env.JWT_AUTH_TOKEN);
    const user = await User.findOne({
      _id: decoded._id,
      "tokens.token": token,
    });
    if (!user) {
      throw new Error();
    }
    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    res.status(400).send("Please Authenticate");
  }
}

module.exports = auth;
