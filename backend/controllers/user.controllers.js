const User = require("../models/user.model");

const getCurrentUser = async function (req, res) {
  try {
    if (!req.userId){
      return res.status(400).json({ message: "userId not found" });
    }
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(400).json({ message: "user not found" });
    }
    return res.status(200).json(user);
  } catch (error) {
    return res
      .status(400)
      .json({ message: `error in getting current user ${error}` });
  }
};

const updateUserLocation = async function (req, res) {
  try {
    const {lat, lon} = req.body;
    const user = await User.findByIdAndUpdate(req.userId, {
      location: {
        type: "Point",
        coordinates: [lon, lat]
      }
    }, { new: true });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Broadcast live delivery-boy location updates to tracking pages.
    // (TrackOrderPage listens on "updateDeliveryLocation")
    if (user.role === "deliveryBoy") {
      const io = req.app.get("io");
      if (io) {
        io.emit("updateDeliveryLocation", {
          deliveryBoyId: user._id,
          latitude: lat,
          longitude: lon,
        });
      }
    }

    return res.status(200).json({message: "Location updated successfully"});
    
  } catch (error) {
    return res.status(400).json({ message: `error in updating location ${error}` });
  }
}


module.exports = { getCurrentUser, updateUserLocation };