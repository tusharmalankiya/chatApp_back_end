const express = require("express");
const router = express.Router();

//middleware
const { auth } = require("./../middlewares/auth");

//controller
const authController = require("./../controllers/authControllers");

router.get("/get-chats", auth , authController.get_chats);

module.exports = router;
