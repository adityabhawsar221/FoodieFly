const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config()
const url = process.env.MONGODB_URL;
const connectDB = async ()=>{
  try{
    await mongoose.connect(url);
    console.log("Database Connected ☑️")
  }catch (err){
    console.log("Database connection not established - " , err);
  }
}

module.exports = connectDB;