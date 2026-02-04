const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required:true,
  },
  shop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Shop"
  },
  category: {
    type: String,
    enum: ["Snacks", "Main Course", "Desserts", "Pizza", "Burger", "Sandwiches", "South Indian", "North Indian", "Chinese", "Fast Food", "Others"],
    required:true,
  },
  price:{
    type:Number,
    min:0,
    required:true,
  },
  foodType:{
    type:String,
    enum:["veg" , "non-veg"],
    required:true,
  },
  rating:{
    average:{type:Number,default:0},
    count:{type:Number,default:0} 

  },
  // Users who have already rated this item (prevents multiple ratings from same user)
  ratedBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
}, { timestamps: true });

const Item = mongoose.model("Item" , itemSchema);

module.exports = Item;
