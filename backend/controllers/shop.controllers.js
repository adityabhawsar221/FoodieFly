const Shop = require("../models/shop.model");
const Item = require("../models/item.model");
const uploadOnCloudinary = require("../utils/cloudinary");

const createEditShop = async function (req, res) {
  try {
    const { name, city, state, address } = req.body;
    if (!name || !city || !state || !address) {
      return res
        .status(400)
        .json({ message: "name, city, state, and address are required" });
    }

    let shop = await Shop.findOne({ owner: req.userId });
    let image;

    if (req.file) {
      image = await uploadOnCloudinary(req.file.path);
      if (!image) {
        return res
          .status(500)
          .json({ message: "Image upload failed (Cloudinary)" });
      }
    } else if (!shop) {
      return res.status(400).json({ message: "image is required" });
    } else {
      image = shop.image;
    }

    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop._id,
        { name, city, state, address, image, owner: req.userId },
        { new: true, runValidators: true }
      );
    }
    await shop.populate("owner")
    await shop.populate({
      path:"items",
      options:{sort:{updatedAt:-1}}
    });
    return res.status(shop.isNew ? 201 : 200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "create shop error", error: error?.message || String(error) });
  }
};

const getMyShop = async function(req,res){
  try {
    const shop = await Shop.findOne({owner:req.userId}).populate("owner")
    if(!shop) return res.status(404).json({ message: "Shop Not Found" });

    await shop.populate({
      path:"items",
      options:{sort:{updatedAt:-1}}
    })

    if(!shop.items || shop.items.length === 0){
      const items = await Item.find({ shop: shop._id });
      shop._doc.items = items;
    }
    return res.status(200).json(shop);
  } catch (error) {
     return res
       .status(500)
       .json({ message: "Get my shop failed", error: error?.message || String(error) });
  }
}

const getShopByCity = async (req, res) => {

  try {
    const { city } = req.params;

    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }

    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") }
    }).populate("items");

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "shop not found" });
    }
    
    return res.status(200).json(shops);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};


module.exports = {
  createEditShop,
  getMyShop,
  getShopByCity,
};