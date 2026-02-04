const User = require("./models/user.model");

const socketHandler = function (io) {
  // io instance from index.js
  io.on("connection", (socket) => {
    // when a client connects to socket server coming from frontend
    socket.on("identity", async ({ userId }) => {
      // listen for identity event from client
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
            socketId: socket.id,
            isOnline: true,
          },
          { new: true },
        );
      } catch (error) {
        console.log("Error in setting socketId for user: ", error);
      }
    }); 

    // update location

    socket.on("updateLocation", async ({ userId, latitude, longitude }) => {
      try {
        const user = await User.findByIdAndUpdate(
          userId,
          {
          location: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          isOnline: true,
          socketId: socket.id,
        },
          { new: true },
        );
        if (user) {
          io.emit("updateDeliveryLocation", {
            deliveryBoyId: user._id,
            latitude,
            longitude,
          });
        }
      }catch (error) {
        console.log("Error in updating location for delivery", error);
      }
    });

    // listen for identity event from client
    socket.on("disconnect", async () => {
      try {
        await User.findOneAndUpdate(
          { socketId: socket.id },
          {
            isOnline: false,
            socketId: null,
          },
        );
      } catch (error) {
        console.log("Error in removing socketId for user: ", error);
      }
    });
  });
};

module.exports = socketHandler;
