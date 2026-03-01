import mongoose from "mongoose";
import Stripe from "stripe";
import Order from "../models/Order.model.js";
import Product from "../models/Product.model.js";
import userModel from "../models/User.model.js";

const stripeClient = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

const ALLOWED_ORDER_STATUSES = [
  "placed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];
const ALLOWED_PAYMENT_STATUSES = ["pending", "paid", "failed", "refunded"];
const ALLOWED_PAYMENT_METHODS = [
  "cod",
  "razorpay",
  "upi",
  "card",
  "netbanking",
  "stripe",
];

const sanitizeAddress = (address = {}, customer = {}) => ({
  fullName: (address.fullName || customer.name || "").trim(),
  phone: (address.phone || customer.phone || "").trim(),
  streetAddress: (address.streetAddress || "").trim(),
  city: (address.city || "").trim(),
  state: (address.state || "").trim(),
  pincode: (address.pincode || "").trim(),
});

const normalizeItems = (items = []) =>
  items
    .map((item) => {
      const normalized = {
        name: (item.name || "").trim(),
        image: item.image || "",
        price: Number(item.price),
        quantity: Number(item.quantity || 1),
      };

      if (item.productId && mongoose.Types.ObjectId.isValid(item.productId)) {
        normalized.product = item.productId;
      }

      return normalized;
    })
    .filter(
      (item) =>
        item.name &&
        Number.isFinite(item.price) &&
        item.price > 0 &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0
    );

const CURRENT_ORDER_STATUSES = ["placed", "processing", "shipped"];
const HISTORY_ORDER_STATUSES = ["delivered", "cancelled"];

const normalizeAmount = (value) => Math.round(Number(value || 0) * 100) / 100;

const computeItemsTotal = (items = []) =>
  normalizeAmount(
    items.reduce((total, item) => total + Number(item.price) * Number(item.quantity), 0)
  );

const isLikelyPublicUrl = (value = "") => /^https?:\/\//i.test(String(value));

const resolveClientBaseUrl = (req) =>
  (process.env.FRONTEND_URL || req.headers.origin || "http://localhost:5173").replace(
    /\/$/,
    ""
  );

const buildOrderInput = async (req) => {
  const { items = [], amount, address = {}, customer = {} } = req.body;
  const normalizedItems = normalizeItems(items);

  if (!normalizedItems.length) {
    return {
      error: {
        status: 400,
        message: "Order items are required with valid name, price, and quantity",
      },
    };
  }

  const calculatedAmount = computeItemsTotal(normalizedItems);
  if (!Number.isFinite(calculatedAmount) || calculatedAmount <= 0) {
    return {
      error: {
        status: 400,
        message: "Order amount must be a valid number greater than 0",
      },
    };
  }

  const clientAmount = Number(amount);
  if (Number.isFinite(clientAmount)) {
    const delta = Math.abs(normalizeAmount(clientAmount) - calculatedAmount);
    if (delta > 1) {
      return {
        error: {
          status: 400,
          message: "Order amount mismatch. Please refresh your cart and try again.",
        },
      };
    }
  }

  const finalAddress = sanitizeAddress(address, customer);
  if (!finalAddress.fullName || !finalAddress.phone || !finalAddress.streetAddress) {
    return {
      error: {
        status: 400,
        message: "Address requires fullName, phone, and streetAddress",
      },
    };
  }

  let linkedUser = null;
  if (req.userId && mongoose.Types.ObjectId.isValid(req.userId)) {
    linkedUser = await userModel.findById(req.userId).select("_id name email");
  }

  const customerName = (customer.name || linkedUser?.name || finalAddress.fullName).trim();
  const customerEmail = (customer.email || linkedUser?.email || "").trim().toLowerCase();
  const customerPhone = (customer.phone || finalAddress.phone).trim();

  return {
    data: {
      items: normalizedItems,
      amount: calculatedAmount,
      user: linkedUser?._id,
      address: finalAddress,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
    },
  };
};

const placeOrder = async (req, res) => {
  try {
    const { paymentMethod = "cod", paymentStatus = "pending" } = req.body;

    if (!ALLOWED_PAYMENT_METHODS.includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment status",
      });
    }

    const { data, error } = await buildOrderInput(req);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const order = await Order.create({
      ...data,
      paymentMethod,
      paymentStatus,
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to place order",
    });
  }
};

const createStripeCheckoutSession = async (req, res) => {
  try {
    if (!stripeClient) {
      return res.status(500).json({
        success: false,
        message: "Stripe is not configured on server",
      });
    }

    const { data, error } = await buildOrderInput(req);
    if (error) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
      });
    }

    const order = await Order.create({
      ...data,
      paymentMethod: "stripe",
      paymentStatus: "pending",
    });

    const lineItems = data.items.map((item) => {
      const productData = {
        name: item.name,
      };

      if (isLikelyPublicUrl(item.image)) {
        productData.images = [item.image];
      }

      return {
        quantity: item.quantity,
        price_data: {
          currency: "inr",
          unit_amount: Math.round(Number(item.price) * 100),
          product_data: productData,
        },
      };
    });

    const clientBaseUrl = resolveClientBaseUrl(req);
    const session = await stripeClient.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      line_items: lineItems,
      customer_email: data.customer.email || undefined,
      metadata: {
        orderId: String(order._id),
        orderNumber: order.orderNumber,
      },
      success_url: `${clientBaseUrl}/success?orderId=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientBaseUrl}/checkout?payment=cancelled&orderId=${order._id}`,
    });

    order.stripeSessionId = session.id || "";
    if (session.payment_intent) {
      order.stripePaymentIntentId = String(session.payment_intent);
    }
    await order.save();

    return res.status(201).json({
      success: true,
      message: "Stripe checkout initiated",
      sessionId: session.id,
      checkoutUrl: session.url,
      orderId: order._id,
      orderNumber: order.orderNumber,
    });
  } catch (error) {
    console.error("Create Stripe session error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to create Stripe checkout session",
    });
  }
};

const handleStripeWebhook = async (req, res) => {
  if (!stripeClient) {
    return res.status(500).send("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return res.status(500).send("Missing STRIPE_WEBHOOK_SECRET");
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).send("Missing stripe-signature header");
  }

  let event;
  try {
    event = stripeClient.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Stripe webhook signature error:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const metadataOrderId = session?.metadata?.orderId;

      const filter =
        metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)
          ? { _id: metadataOrderId }
          : { stripeSessionId: session?.id || "" };

      const order = await Order.findOne(filter);
      if (order) {
        order.paymentMethod = "stripe";
        order.paymentStatus = "paid";
        order.paidAt = new Date();
        if (session?.id) {
          order.stripeSessionId = session.id;
        }
        if (session?.payment_intent) {
          order.stripePaymentIntentId = String(session.payment_intent);
        }
        await order.save();
      }
    }

    if (
      event.type === "checkout.session.expired" ||
      event.type === "checkout.session.async_payment_failed"
    ) {
      const session = event.data.object;
      const metadataOrderId = session?.metadata?.orderId;

      const filter =
        metadataOrderId && mongoose.Types.ObjectId.isValid(metadataOrderId)
          ? { _id: metadataOrderId }
          : { stripeSessionId: session?.id || "" };

      await Order.findOneAndUpdate(
        {
          ...filter,
          paymentStatus: { $ne: "paid" },
        },
        {
          paymentMethod: "stripe",
          paymentStatus: "failed",
          ...(session?.id ? { stripeSessionId: session.id } : {}),
        }
      );
    }

    return res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook handling error:", error);
    return res.status(500).send("Webhook handling failed");
  }
};

const getUserOrders = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("_id email");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const query = [{ user: user._id }];
    if (user.email) {
      query.push({ "customer.email": user.email.toLowerCase() });
    }

    const orders = await Order.find({ $or: query }).sort({ createdAt: -1 });

    const currentOrders = orders.filter((order) =>
      CURRENT_ORDER_STATUSES.includes(order.status)
    );
    const historyOrders = orders.filter((order) =>
      HISTORY_ORDER_STATUSES.includes(order.status)
    );

    return res.json({
      success: true,
      count: orders.length,
      currentOrders,
      historyOrders,
      orders,
    });
  } catch (error) {
    console.error("Get user orders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load user orders",
    });
  }
};

const listOrders = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    const orders = await Order.find(filter).sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("List orders error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to fetch orders",
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status, paymentStatus } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "orderId is required" });
    }

    const updates = {};

    if (status) {
      if (!ALLOWED_ORDER_STATUSES.includes(status)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid order status" });
      }
      updates.status = status;
    }

    if (paymentStatus) {
      if (!ALLOWED_PAYMENT_STATUSES.includes(paymentStatus)) {
        return res
          .status(400)
          .json({ success: false, message: "Invalid payment status" });
      }
      updates.paymentStatus = paymentStatus;
      if (paymentStatus === "paid") {
        updates.paidAt = new Date();
      }
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({
        success: false,
        message: "At least one field (status/paymentStatus) is required",
      });
    }

    const order = await Order.findByIdAndUpdate(orderId, updates, { new: true });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    return res.json({
      success: true,
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order status error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to update order status",
    });
  }
};

const getOrderSummary = async (req, res) => {
  try {
    const [
      totalOrders,
      placedOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      revenueResult,
      totalProducts,
      totalUsers,
      recentOrders,
    ] = await Promise.all([
      Order.countDocuments({}),
      Order.countDocuments({ status: "placed" }),
      Order.countDocuments({ status: "processing" }),
      Order.countDocuments({ status: "shipped" }),
      Order.countDocuments({ status: "delivered" }),
      Order.countDocuments({ status: "cancelled" }),
      Order.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
      Product.countDocuments({ isDeleted: false }),
      userModel.countDocuments({}),
      Order.find({})
        .sort({ createdAt: -1 })
        .limit(6)
        .select("orderNumber amount status paymentStatus createdAt customer"),
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    return res.json({
      success: true,
      summary: {
        totalOrders,
        placedOrders,
        processingOrders,
        shippedOrders,
        deliveredOrders,
        cancelledOrders,
        totalRevenue,
        totalProducts,
        totalUsers,
      },
      recentOrders,
    });
  } catch (error) {
    console.error("Order summary error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Unable to load order summary",
    });
  }
};

export {
  createStripeCheckoutSession,
  getOrderSummary,
  getUserOrders,
  handleStripeWebhook,
  listOrders,
  placeOrder,
  updateOrderStatus,
};
