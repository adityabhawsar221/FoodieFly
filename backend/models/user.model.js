const mongoose = require('mongoose');
const { Socket } = require('socket.io');

const userSchema = mongoose.Schema({
  fullname:{
    type:String,
    required:true,
  },
  email:{
    type:String,
    required:true,
    unique:true,
  },
  password:{
    type:String,
  },
  mobile:{
    type:String,
  },
  role:{
    type:String,
    enum:["user" , "owner" , "deliveryBoy"],
    required:true,
  },
  resetOtp:{
    type:String,
  },
  isOtpVerified:{
    type:Boolean,
    default:false,
  },
  otpExpires:{
    type:Date,
  },
  socketId:{
    type:String,
  }, 
  isOnline:{
    type:Boolean,
    default:false,
  }, 
  // For delivery boys to track their current location for order assignment and delivery
  location:{ // GeoJSON Point
    type:{ // type of GeoJSON object
      type:String, // 'Point'
      enum:['Point'], // must be 'Point'
      default:'Point', // default type
    },
    coordinates:{
      type:[Number], // [longitude , latitude]
      default:[0,0], // default coordinates
    },
  }

},{timestamps:true});

userSchema.index({location:"2dsphere"}); // create geospatial index on location field

const User = mongoose.model('User' , userSchema);

module.exports = User;