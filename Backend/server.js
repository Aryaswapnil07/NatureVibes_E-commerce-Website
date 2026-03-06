import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import {connectCloudinary} from "./config/cloudinary.js";
import userRouter from "./routes/user.Route.js";
import productRouter from "./routes/product.Route.js";
import orderRouter from "./routes/order.Route.js";
import { handleStripeWebhook } from "./controllers/order.controller.js";

const app = express();
const port = process.env.PORT || 4000;
app.disable("x-powered-by");

const configuredAllowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL,
  process.env.CLIENT_URL,
]
  .join(",")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

const normalizeOrigin = (origin = "") => {
  try {
    return new URL(String(origin).trim()).origin.replace(/\/$/, "");
  } catch {
    return "";
  }
};

const isLocalOrigin = (hostname = "") =>
  hostname === "localhost" ||
  hostname === "127.0.0.1" ||
  hostname === "::1" ||
  hostname.endsWith(".localhost");

const isAllowedOrigin = (origin = "") => {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  if (!normalizedOrigin) {
    return false;
  }

  if (configuredAllowedOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname, protocol } = new URL(normalizedOrigin);

    if (isLocalOrigin(hostname)) {
      return true;
    }

    if (protocol === "https:" && hostname.endsWith(".vercel.app")) {
      return true;
    }
  } catch {
    return false;
  }

  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    console.warn(`Blocked CORS origin: ${origin}`);
    return callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"],
  credentials: true,
  optionsSuccessStatus: 200,
};

connectDB().catch((error) => {
  console.error("Initial database connection failed:", error.message);
});
connectCloudinary();

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return res.status(503).json({
      success: false,
      message: "Database connection failed. Please try again.",
    });
  }
});

app.post(
  "/api/orders/stripe/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

if (process.env.VERCEL !== "1") {
  app.listen(port, () => {
    console.log(`Server started on PORT: ${port}`);
  });
}

export default app;
