import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import userAuth from "../middleware/userAuth.js";
import {
  cancelPendingStripeOrder,
  createStripeCheckoutSession,
  getOrderSummary,
  getUserOrders,
  listOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/place", userAuth, placeOrder);
orderRouter.post(
  "/stripe/create-checkout-session",
  userAuth,
  createStripeCheckoutSession
);
orderRouter.post("/stripe/cancel", userAuth, cancelPendingStripeOrder);
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.get("/summary", adminAuth, getOrderSummary);
orderRouter.get("/my", userAuth, getUserOrders);
orderRouter.patch("/status", adminAuth, updateOrderStatus);

export default orderRouter;
