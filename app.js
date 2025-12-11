const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config({ path: "./config/.env" });

const app = express();

// -----------------------------
// Global Middleware
// -----------------------------
app.use(cors());
app.use(express.json());

// -----------------------------
// Static folder for uploaded images
// -----------------------------
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// -----------------------------
// Routes Import
// -----------------------------
const authRoutes = require("./routes/authRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const productRoutes = require("./routes/productRoutes");
const ingredientRoutes = require("./routes/ingredientRoutes");
const rewardRoutes = require("./routes/rewardRoutes");
const orderRoutes = require("./routes/orderRoutes");
const additionalIngredientRoutes = require("./routes/additionalIngredientRoutes");

// -----------------------------
// Routes Registration
// -----------------------------
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/ingredients", ingredientRoutes);
app.use("/api/rewards", rewardRoutes);
app.use("/api/orders", orderRoutes);   
app.use("/api", additionalIngredientRoutes);
app.use("/api/user", require("./routes/userExtrasRoutes"));





// -----------------------------
// Health Check Route
// -----------------------------
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

// -----------------------------
// Global Error Handler
// -----------------------------
app.use((err, req, res, next) => {
  console.error("Error:", err.stack);
  res.status(500).json({
    success: false,
    message: err.message || "Something went wrong on the server!",
  });
});

module.exports = app;
