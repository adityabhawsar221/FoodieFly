const express = require("express");
const { isAuth } = require("../middlewares/isAuth");
const { placeOrder, getMyOrders, updateOrderStatus, getDeliveryBoyAssignment, acceptOrder, getCurrentOrder, getOrderById, sendDeliveryOtp, verifyDeliveryOtp, verifyPayment, getDeliveryBoyHistory } = require("../controllers/order.controllers");
const orderRouter = express.Router();

orderRouter.post("/place-order",isAuth, placeOrder);
orderRouter.post("/verify-payment", isAuth, verifyPayment);
orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments",isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order" , isAuth, getCurrentOrder);
orderRouter.get("/delivery-history", isAuth, getDeliveryBoyHistory);
orderRouter.post("/send-delivery-otp" , isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp" , isAuth, verifyDeliveryOtp);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);
orderRouter.post("/update-status/:orderId/:shopId",isAuth, updateOrderStatus);

module.exports = orderRouter;  