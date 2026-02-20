const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db.js");

const userRoutes = require("./routes/userRoutes.js");
const productRoutes = require("./routes/productRoutes.js");

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Connect DB
connectDB();

const PORT = process.env.PORT || 3000;

// Test route
app.get("/", (req, res) => {
  res.send("Welcome to NatureVibes API!");
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/products", productRoutes);   // ✅ FIXED

app.listen(PORT, () => {
  console.log(`Server is listening on http://localhost:${PORT}`);
});
