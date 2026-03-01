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

connectDB().catch((error) => {
  console.error("Initial database connection failed:", error.message);
});
connectCloudinary();

app.use(cors());
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
