const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const { getCurrentUser, updateUserLocation } = require("../controllers/user.controllers");
const userRouter = express.Router();

userRouter.get("/current" , isAuth , getCurrentUser);
userRouter.post("/update-location" , isAuth , updateUserLocation);

module.exports = userRouter;