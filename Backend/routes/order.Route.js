import express from "express";
import adminAuth from "../middleware/adminAuth.js";
import optionalUserAuth from "../middleware/optionalUserAuth.js";
import userAuth from "../middleware/userAuth.js";
import {
  createStripeCheckoutSession,
  getOrderSummary,
  getUserOrders,
  listOrders,
  placeOrder,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const orderRouter = express.Router();

orderRouter.post("/place", optionalUserAuth, placeOrder);
orderRouter.post(
  "/stripe/create-checkout-session",
  optionalUserAuth,
  createStripeCheckoutSession
);
orderRouter.get("/list", adminAuth, listOrders);
orderRouter.get("/summary", adminAuth, getOrderSummary);
orderRouter.get("/my", userAuth, getUserOrders);
orderRouter.patch("/status", adminAuth, updateOrderStatus);

export default orderRouter;
