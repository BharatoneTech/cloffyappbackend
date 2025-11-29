const express = require("express");
const cors = require("cors");
require("dotenv").config({ path: "./config/.env" });

const app = express();

// -----------------------------
// Global Middleware
// -----------------------------
app.use(cors());
app.use(express.json());

// -----------------------------
// Routes
// -----------------------------
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

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
