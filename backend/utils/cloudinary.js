const cloudinary = require("cloudinary").v2;
const fs = require("fs");

const uploadOnCloudinary = async function(file){
  cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_APIKEY, 
  api_secret: process.env.CLOUDINARY_SECRET
  });

  try {
    const result = await cloudinary.uploader.upload(file);
     fs.unlinkSync(file);
     return result.secure_url
  } catch (error) {
     fs.unlinkSync(file);
     console.log(error);
  }
}
module.exports = uploadOnCloudinary;
