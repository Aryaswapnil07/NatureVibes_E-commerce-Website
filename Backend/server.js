import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./config/db.js";
import connectCloudinary from "./config/cloudinary.js";
import userRouter from "./routes/user.Route.js";

// APP CONFIG

const app = express();
const port = process.env.PORT || 4000;
connectDB()
connectCloudinary()
// MIDDLEWARES

app.use(express.json());
app.use(cors());

// API ENDPOINTS

app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("API IS WORKING ");
});

app.listen(port, () => console.log(`server is started on PORT : ` + port));
