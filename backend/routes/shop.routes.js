const express = require("express");
const {getCurrentUser} = require("../controllers/user.controllers");
const { isAuth } = require("../middlewares/isAuth");
const { createEditShop, getMyShop, getShopByCity } = require("../controllers/shop.controllers");
const upload = require("../middlewares/multer");
const shopRouter = express.Router();

shopRouter.post("/create-edit",isAuth ,upload.single("image") ,createEditShop);

shopRouter.get("/get-my",isAuth  , getMyShop);

shopRouter.get("/get-by-city/:city" ,isAuth  , getShopByCity);


module.exports = shopRouter;