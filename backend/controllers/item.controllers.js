const Item = require("../models/item.model");
const Shop = require("../models/shop.model");
const uploadOnCloudinary = require("../utils/cloudinary");

const addItem = async function (req, res) {
  try {
    const {name , category , foodType , price} = req.body;
    let image;
    if(req.file){
      image = await uploadOnCloudinary(req.file.path);
    }
    let shop = await Shop.findOne({owner:req.userId});
    if(!shop){
      return res.status(400).json({message:"Shop Not Found"})
    }
    const item =  await Item.create({
      name,category,foodType,price,image,shop:shop._id
    })
    
    shop.items.push(item._id);

    await shop.save();
    await shop.populate("owner")
    await shop.populate({
      path:"items",
      options:{sort:{updatedAt:-1}}
    })

    return res.status(201).json(shop)
  } catch (error) {
  console.log("ADD ITEM ERROR 👉", error);
  return res.status(400).json({ message: error.message });
}

}

const editItem = async function(req,res){
  try {
    const itemId = req.params.itemId;
    const {name , category , foodType , price} = req.body;
    let image;
    if(req.file){
      image = await uploadOnCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(itemId , {
      name , category , foodType , price , image
    },{new:true});

    if(!item){
      return res.status(400).json({message:"Item Not Found"})
    }
    const shop = await Shop.findOne({owner:req.userId}).populate({
      path:"items",
      options:{sort:{updatedAt:-1}}
    })
    return res.status(201).json(shop);
  } catch (error) {
    
    return res.status(400).json({message:"Item Not Updated"})
  }
}

const getItemById = async function(req,res){
  try {
      const itemId = req.params.itemId;
      const item = await Item.findById(itemId);
      if(!item){
        return res.status(400).json({message:"item not found"})
      }
      return res.status(200).json(item);
  } catch (error) {
      return res.status(500).json({message:"get item not error"})
  }
}
const deleteItem = async function (req,res) {
      try {
        const itemId = req.params.itemId;
        const item = await Item.findByIdAndDelete(itemId)
        if(!item){
          return res.status(400).json({message:"item not found"})
        }

        const shop = await Shop.findOne({owner:req.userId});
        if (!shop) {
          return res.status(400).json({ message: "shop not found" });
        }

        shop.items = shop.items.filter((i) => i.toString() !== itemId);
        await shop.save();
        await shop.populate({
        path:"items",
        options:{sort:{updatedAt:-1}}
        })
        return res.status(200).json(shop);
      } catch (error) {
           console.error(error);
            return res.status(500).json({ message: "delete item error" });
      }
  
}

const getItemByCity = async function(req,res){
  
  try {
    const {city} = req.params;
    if (!city) {
      return res.status(400).json({ message: "city is required" });
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") }
    });

    if (!shops || shops.length === 0) {
      return res.status(200).json([]);
    }

    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({ shop: { $in: shopIds } });
    return res.status(200).json(items);

  } catch (error) {
    return res.status(500).json({ message: error.message || "get item by city error" });
  }
}

const getItemsByShop = async function(req,res){
  try {
    const {shopId} = req.params;
    const shop = await Shop.findById(shopId).populate("items");
    if(!shop){
      return res.status(400).json({message:"shop not found"})
    }
    return res.status(200).json({
      shop,
      items:shop.items
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || "get items by shop error" });
  }
}

const searchItems = async function(req,res){
  try {
    const {query , city} = req.query;
    if(!query || !city){
      return null;
    }
    const shops = await Shop.find({
      city: { $regex: new RegExp(city, "i") }
    }).populate("items");

    if (!shops || shops.length === 0) {
      return res.status(404).json({ message: "shop not found" });
    }

    const shopIds = shops.map((shop) => shop._id);
    const items = await Item.find({
      shop:{$in:shopIds},
      $or:[
        {name:{$regex:query , $options:"i"}},
        {category:{$regex:query , $options:"i"}}
      ]
    }).populate("shop" , "name image");

    return res.status(200).json(items); 

  } catch (error) {
    return res.status(500).json({ message: error.message || "search items error" });
  }
}

const rating = async function (req, res) {
  try{
    const {itemId , rating} = req.body;
    if(!itemId || !rating){
      return res.status(400).json({message:"itemId and rating are required"})
    }
    if(rating < 1 || rating > 5){
      return res.status(400).json({message:"rating must be between 1 and 5"})
    }
    const item = await Item.findById(itemId);
    if(!item){
      return res.status(400).json({message:"item not found"})
    }

    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // Block multiple ratings from the same user
    if ((item.ratedBy || []).some((id) => String(id) === String(userId))) {
      return res.status(409).json({ message: "You have already rated this item" });
    }

    const newCount = item.rating.count + 1;
    const newAverage = ((item.rating.average * item.rating.count) + rating) / newCount;
    item.rating.count = newCount;
    item.rating.average = newAverage;

    item.ratedBy = item.ratedBy || [];
    item.ratedBy.push(userId);

     await item.save();
     return res.status(200).json({message:"rating added successfully"})
  }catch (error) {
    return res.status(500).json({ message: `rating error ${error?.message || error}` });
  }
}


module.exports = {
  addItem,
  editItem,
  getItemById,
  deleteItem,
  getItemByCity,
  getItemsByShop,
  searchItems,
  rating,
};
