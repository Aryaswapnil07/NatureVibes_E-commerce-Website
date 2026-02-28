import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import {connectCloudinary} from "./config/cloudinary.js";
import userRouter from "./routes/user.Route.js";
import productRouter from "./routes/product.route.js"; // match filename exactly

const app = express();
const port = process.env.PORT || 4000;

connectDB();
connectCloudinary();

app.use(express.json());
app.use(cors());

app.use("/api/users", userRouter);
app.use("/api/products", productRouter);

app.listen(port, () => {
  console.log(`Server started on PORT: ${port}`);
});