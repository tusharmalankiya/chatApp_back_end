const jwt = require("jsonwebtoken");
const User = require("./../models/User");
const errorHandler = require("./errorHandler");
require("dotenv").config();

const maxAge = Number(process.env.TOKEN_AGE); //converting into number (seconds)
const createToken = async (id, username) => {
  return jwt.sign({ id, username }, process.env.JWT_SECRET, {
    expiresIn: maxAge,
  });
};

module.exports.register_user = async (req, res) => {
  console.log(req.body);
  try {
    const user = await User.create(req.body);
    res.status(201).json(user);
  } catch (err) {
    const errors = errorHandler(err);
    console.log(err);
    res.json(errors);
  }
};

module.exports.login_user = async (req, res, next) => {
  console.log(req.body);
  try {
    const user = await User.login(req.body.username, req.body.password);
    const token = await createToken(user._id, req.body.username);
    // console.log(token);
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: process.env.TOKEN_AGE * 1000,
    });
    res.status(200).json({ success: true, id:user._id, token });
  } catch (err) {
    console.log(err);
    const errors = errorHandler(err);
    res.status(401).json(errors);
  }
  next();
};

module.exports.logout = (req, res) => {
  res.cookie("token", "", { maxAge: 1 });
  res.status(200).json();
};
