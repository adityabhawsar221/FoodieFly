const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const { addItem, editItem, getItemById, deleteItem, getItemByCity, getItemsByShop, searchItems, rating } = require("../controllers/item.controllers");
const upload = require("../middlewares/multer");
const itemRouter = express.Router();

itemRouter.post("/add-item",isAuth, upload.single("image") ,addItem);

itemRouter.post("/edit-item/:itemId", isAuth , upload.single("image") ,editItem);

itemRouter.get("/get-by-id/:itemId" ,  isAuth , getItemById)

itemRouter.get("/delete/:itemId" ,  isAuth , deleteItem)

itemRouter.get("/get-by-city/:city" ,  isAuth , getItemByCity)

itemRouter.get("/get-by-shop/:shopId" ,  isAuth , getItemsByShop)

itemRouter.get("/search-items" ,  isAuth , searchItems)

itemRouter.post("/rating" , isAuth , rating)

 
module.exports = itemRouter;  