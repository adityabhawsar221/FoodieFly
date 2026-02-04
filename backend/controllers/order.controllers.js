const DeliveryAssignment = require("../models/deliveryAssignment.model");
const Order = require("../models/order.model");
const Shop = require("../models/shop.model");
const User = require("../models/user.model");
const { sendDeliveryOtpMail } = require("../utils/mail");
const Razorpay = require("razorpay");
const dotenv = require("dotenv");
dotenv.config();

let instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress, totalAmount } = req.body;
    if (cartItems.length === 0 || !cartItems) {
      return res
        .status(400)
        .json({ message: "No items in cart to place order" });
    }
    if (
      !deliveryAddress.text ||
      !deliveryAddress.latitude ||
      !deliveryAddress.longitude
    ) {
      return res.status(400).json({ message: "Delivery address is required" });
    }
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });
    // loop through each shop and create orders
    const shopOrders = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          throw new Error(`Shop with id ${shopId} not found`);
        }
        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i.price) * Number(i.quantity),
          0,
        );

        return {
          shop: shop._id,
          owner: shop.owner._id,
          subTotal,
          shopOrderItems: items.map((i) => ({
            item: i.id,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      }),
    );

    if (paymentMethod === "online") {
      const razorOrder = await instance.orders.create({
        amount: Math.round(totalAmount * 100), // amount in the smallest currency unit
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
      });

      // create main order
      const newOrder = await Order.create({
        user: req.userId,
        paymentMethod,
        deliveryAddress,
        totalAmount,
        shopOrders,
        razorpayOrderId: paymentMethod === "online" ? razorOrder.id : null,
        payment: false,
      });

      return res.status(201).json({
        razorOrder,
        orderId: newOrder._id,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod,
      deliveryAddress,
      totalAmount,
      shopOrders,
    });

    await newOrder.populate("shopOrders.shop", "name");
    await newOrder.populate("user", "fullname email mobile");
    await newOrder.populate("shopOrders.owner", "name email mobile socketId");
    await newOrder.populate(
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    const io = req.app.get("io");

    if (io) {
      newOrder.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: newOrder._id,
            paymentMethod: newOrder.paymentMethod,
            payment: newOrder.payment,
            user: newOrder.user,
            shopOrders: shopOrder,
            createdAt: newOrder.createdAt,
            deliveryAddress: newOrder.deliveryAddress,
          });
        }
      });
    }
    return res
      .status(201)
      .json({ message: "Order placed successfully", newOrder });
  } catch (error) {
    return res.status(500).json({ message: `place order error ${error}` });
  }
};

const verifyPayment = async (req, res) => {
  try {
    const { razorpay_payment_id, orderId } = req.body;
    const payment = await instance.payments.fetch(razorpay_payment_id);
    if (!payment || payment.status !== "captured") {
      return res.status(400).json({ message: "Payment not successful" });
    }
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    order.payment = true;
    order.razorpayPaymentId = razorpay_payment_id;

    await Order.populate(order, "shopOrders.shop", "name");
    await Order.populate(order, "user", "fullname email mobile");
    await Order.populate(
      order,
      "shopOrders.owner",
      "name email mobile socketId",
    );
    await Order.populate(
      order,
      "shopOrders.shopOrderItems.item",
      "name image price",
    );
    const io = req.app.get("io");

    if (io) {
      order.shopOrders.forEach((shopOrder) => {
        const ownerSocketId = shopOrder.owner.socketId;
        if (ownerSocketId) {
          io.to(ownerSocketId).emit("newOrder", {
            _id: order._id,
            paymentMethod: order.paymentMethod,
            payment: order.payment,
            user: order.user,
            shopOrders: shopOrder,
            createdAt: order.createdAt,
            deliveryAddress: order.deliveryAddress,
          });
        }
      });
    }
    await order.save();
    return res
      .status(200)
      .json({ message: "Payment verified successfully", order });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Payment verification error ${error}` });
  }
};

const getMyOrders = async function (req, res) {
  try {
    const user = await User.findById(req.userId);
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("shopOrders.owner", "name email mobile")
        .populate("shopOrders.assignedDeliveryBoy", "fullname email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");
      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      const orders = await Order.find({ "shopOrders.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrders.shop", "name")
        .populate("user")
        .populate("shopOrders.assignedDeliveryBoy", "fullname email mobile")
        .populate("shopOrders.shopOrderItems.item", "name image price");
      const filteredOrders = orders.map((order) => ({
        _id: order._id,
        paymentMethod: order.paymentMethod,
        payment: order.payment,
        user: order.user,
        shopOrders: order.shopOrders.find((o) => o.owner._id == req.userId),
        createdAt: order.createdAt,
        deliveryAddress: order.deliveryAddress,
      }));
      return res.status(200).json(filteredOrders);
    }
  } catch (error) {
    return res.status(500).json({ message: `getting orders error ${error}` });
  }
};

const updateOrderStatus = async function (req, res) {
  try {
    const { orderId, shopId } = req.params;
    const { status } = req.body;
    const order = await Order.findById(orderId);
    const shopOrder = order.shopOrders.find((o) => o.shop == shopId);
    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found" });
    }

    shopOrder.status = status;
    if (status === "delivered" && order.paymentMethod === "cod") {
      order.payment = true;
    }
    let deliveryBoysPayload = [];

    // Assign delivery boy

    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 10000, // 10 km
          },
        },
      });
      const nearByIds = nearByDeliveryBoys.map((d) => d._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      const busyIdSet = new Set(busyIds.map((id) => String(id)));

      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );

      const candidates = availableBoys.map((b) => b._id);

      if (candidates.length === 0) {
        await order.save();
        return res.status(200).json({ message: "No delivery boys available" });
      }

      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });

      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoysPayload = availableBoys.map((b) => ({
        id: b._id,
        fullname: b.fullname,
        longitude: b.location.coordinates[0],
        latitude: b.location.coordinates[1],
        mobile: b.mobile,
      }));

      await deliveryAssignment.populate("order shop");

      const io = req.app.get("io");
      if (io) {
        availableBoys.forEach((boy) => {
          const boySocketId = boy.socketId;
          if (boySocketId) {
            io.to(boySocketId).emit("newAssignment", {
              sentTo:boy._id,
              assignmentId: deliveryAssignment._id,
              orderId: deliveryAssignment.order._id,
              shopName: deliveryAssignment.shop.name,
              deliveryAddress: deliveryAssignment.order.deliveryAddress,
              items:deliveryAssignment.order.shopOrders.find((so) => so._id.equals(deliveryAssignment.shopOrderId))?. shopOrderItems || [],
              subTotal: deliveryAssignment.order.shopOrders.find((so) =>so._id.equals(deliveryAssignment.shopOrderId),)?.subTotal,
            });
          }
        });
      }
    }

    // Save order and emit socket events

    await order.save();

    const updatedShopOrder = order.shopOrders.find((o) => o.shop == shopId);
    await order.populate("shopOrders.shop", "name");
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullname email mobile",
    );
    await order.populate(
      "shopOrders.assignedDeliveryBoy",
      "fullname email mobile",
    );
    await order.populate("user", "socketId");

    const io = req.app.get("io");
    if (io) {
      const userSocketId = order.user.socketId;
      if (userSocketId) {
        io.to(userSocketId).emit("update-status", {
          orderId: order._id,
          shopId: updatedShopOrder.shop._id,
          status: updatedShopOrder.status,
          userId: order.user._id,
        });
      }
    }
    return res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder?.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayload,
      assignment: updatedShopOrder?.assignment._id,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `updating order status error ${error}` });
  }
};

const getDeliveryBoyAssignment = async function (req, res) {
  try {
    const deliveryBoyId = req.userId;
    const assignment = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    }).populate("order shop");

    const formated = assignment.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
          ?.shopOrderItems || [],
      subTotal: a.order.shopOrders.find((so) => so._id.equals(a.shopOrderId))
        ?.subTotal,
    }));
    return res.status(200).json(formated);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `getting delivery assignment error ${error}` });
  }
};

const acceptOrder = async function (req, res) {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: "Assignment not found" });
    }
    if (assignment.status !== "broadcasted") {
      return res.status(400).json({
        message: "Assignment already accepted by another delivery boy",
      });
    }
    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You have already accepted another order" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    const shopOrder = order.shopOrders.find((so) =>
      so._id.equals(assignment.shopOrderId),
    );
    shopOrder.assignedDeliveryBoy = req.userId;
    await order.save();
    await order.populate("shopOrders.assignedDeliveryBoy");
    return res.status(200).json({ message: "Order accepted successfully" });
  } catch (error) {
    return res.status(500).json({ message: `accepting order error ${error}` });
  }
};

const getCurrentOrder = async function (req, res) {
  try {
    const assignment = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: "assigned",
    })
      .populate("shop", "name")
      .populate("assignedTo", "fullname mobile email location")
      .populate({
        path: "order",
        populate: [
          {
            path: "user",
            select: "fullname mobile email location",
          },
        ],
      });

    if (!assignment) {
      return res.status(404).json({ message: "No current order assigned" });
    }
    if (!assignment.order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const shopOrder = assignment.order.shopOrders.find(
      (so) => String(so._id) == String(assignment.shopOrderId),
    );

    if (!shopOrder) {
      return res.status(404).json({ message: "Shop order not found in order" });
    }

    let deliveryBoyLocation = { lat: null, lon: null };
    const deliveryCoords = assignment.assignedTo?.location?.coordinates;
    if (Array.isArray(deliveryCoords) && deliveryCoords.length === 2) {
      deliveryBoyLocation.lat = deliveryCoords[1];
      deliveryBoyLocation.lon = deliveryCoords[0];
    }

    let customerLocation = { lat: null, lon: null };
    if (assignment.order.deliveryAddress) {
      customerLocation.lat = assignment.order.deliveryAddress.latitude;
      customerLocation.lon = assignment.order.deliveryAddress.longitude;
    }

    return res.status(200).json({
      _id: assignment.order._id,
      user: assignment.order.user,
      shopOrder,
      deliveryAddress: assignment.order.deliveryAddress,
      deliveryBoyLocation,
      customerLocation,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `getting current order error ${error}` });
  }
};

const getOrderById = async function (req, res) {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("user")
      .populate({
        path: "shopOrders.shop",
        model: "Shop",
      })
      .populate({
        path: "shopOrders.assignedDeliveryBoy",
        model: "User",
      })
      .populate({
        path: "shopOrders.shopOrderItems.item",
        model: "Item",
      })
      .lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    return res.status(200).json(order);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `getting order by id error ${error}` });
  }
};

const sendDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder || !order) {
      return res.status(404).json({ message: "Order or Shop order not found" });
    }
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    shopOrder.deliveryOtp = otp;
    shopOrder.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    await order.save();
    await sendDeliveryOtpMail(order.user, otp);
    return res.status(200).json({
      message: `Delivery OTP sent to ${order.user?.fullname} successfully `,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `sending delivery otp error ${error}` });
  }
};

const verifyDeliveryOtp = async (req, res) => {
  try {
    const { orderId, shopOrderId, otp } = req.body;
    const order = await Order.findById(orderId).populate("user");
    const shopOrder = order.shopOrders.id(shopOrderId);
    if (!shopOrder || !order) {
      return res.status(404).json({ message: "Order or Shop order not found" });
    }
    if (shopOrder.deliveryOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (new Date() > shopOrder.otpExpires) {
      return res.status(400).json({ message: "OTP has expired" });
    }
    shopOrder.deliveryOtp = null;
    shopOrder.status = "delivered";
    shopOrder.deliveredAt = new Date();
    await order.save();
    await DeliveryAssignment.deleteOne({
      shopOrderId: shopOrder._id,
      order: order._id,
      assignedTo: shopOrder.assignedDeliveryBoy,
    });
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `verifying delivery otp error ${error}` });
  }
};

const getDeliveryBoyHistory = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const deliveryBoy = await User.findById(deliveryBoyId);
    if (!deliveryBoy || deliveryBoy.role !== "deliveryBoy") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const orders = await Order.find({
      "shopOrders.assignedDeliveryBoy": deliveryBoyId,
      "shopOrders.status": "delivered",
    })
      .sort({ updatedAt: -1 })
      .populate("user", "fullname mobile")
      .populate("shopOrders.shop", "name")
      .lean();

    const tasks = [];
    for (const order of orders) {
      for (const shopOrder of order.shopOrders || []) {
        if (
          String(shopOrder.assignedDeliveryBoy) === String(deliveryBoyId) &&
          shopOrder.status === "delivered"
        ) {
          tasks.push({
            orderId: order._id,
            shopOrderId: shopOrder._id,
            shopName: shopOrder.shop?.name,
            deliveredAt: shopOrder.deliveredAt,
            subTotal: shopOrder.subTotal,
            itemsCount: (shopOrder.shopOrderItems || []).reduce(
              (sum, i) => sum + Number(i.quantity || 0),
              0,
            ),
            deliveryAddress: order.deliveryAddress,
            customer: order.user,
          });
        }
      }
    }

    tasks.sort((a, b) => {
      const at = a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0;
      const bt = b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0;
      return bt - at;
    });

    return res.status(200).json(tasks);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `getting delivery history error ${error}` });
  }
};

module.exports = {
  placeOrder,
  getMyOrders,
  getDeliveryBoyAssignment,
  updateOrderStatus,
  acceptOrder,
  getCurrentOrder,
  getOrderById,
  sendDeliveryOtp,
  verifyDeliveryOtp,
  getDeliveryBoyHistory,
  verifyPayment,
};
