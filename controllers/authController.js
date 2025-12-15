// controllers/authController.js
const bcrypt = require("bcrypt"); // optional
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const User = require("../models/User");

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET || "dev_secret_key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

/* ----------------------------------------------------
 * ADMIN LOGIN
 * --------------------------------------------------- */
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password are required" });
    }

    const admin = await Admin.findByUsername(username);
    if (!admin) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    if (password !== admin.password) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    const token = createToken({
      id: admin.id,
      role: admin.role || "admin",
      username: admin.username,
    });

    return res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: "admin",
      },
    });
  } catch (err) {
    return res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------------
 * USER REGISTER (PHONE + NAME REQUIRED)
 * --------------------------------------------------- */
exports.registerUser = async (req, res) => {
  try {
    let { contact_number, name } = req.body;

    // Validate phone
    if (!contact_number) {
      return res.status(400).json({ message: "Contact number is required" });
    }

    contact_number = contact_number.replace(/\D/g, "");
    if (contact_number.length !== 10) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Validate name
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ message: "Name is required" });
    }

    name = name.trim();

    // Check if phone exists
    const existing = await User.findByContact(contact_number);
    if (existing) {
      return res.status(400).json({
        message: `Phone number already registered with "${existing.name}". Please login.`,
      });
    }

    // Create new user
    const user = await User.create({
      name,
      contact_number,
    });

    const token = createToken({ id: user.id, role: "user" });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        contact_number: user.contact_number,
        bowl_membership: user.bowl_membership,
        golden_membership: user.golden_membership,
        role: "user",
      },
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------------
 * USER LOGIN (PHONE ONLY REQUIRED)
 * --------------------------------------------------- */
exports.loginUser = async (req, res) => {
  try {
    let { contact_number } = req.body;

    // Validate phone
    if (!contact_number) {
      return res.status(400).json({ message: "Contact number is required" });
    }

    contact_number = contact_number.replace(/\D/g, "");
    if (contact_number.length !== 10) {
      return res.status(400).json({
        message: "Phone number must be exactly 10 digits",
      });
    }

    // Check if user exists
    const user = await User.findByContact(contact_number);
    if (!user) {
      return res.status(400).json({
        message: "Phone number not registered. Please register first.",
      });
    }

    const token = createToken({ id: user.id, role: "user" });

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        contact_number: user.contact_number,
        bowl_membership: user.bowl_membership,
        golden_membership: user.golden_membership,
        role: "user",
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------------
 * FETCH PROFILE (/auth/me)
 * --------------------------------------------------- */
exports.me = async (req, res) => {
  try {
    const { id, role } = req.user;

    // Admin
    if (role === "admin") {
      const admin = await Admin.findById(id);
      return res.json({
        success: true,
        user: {
          id: admin.id,
          username: admin.username,
          role: "admin",
        },
      });
    }

    // User
    const user = await User.findById(id);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        contact_number: user.contact_number,
        bowl_membership: user.bowl_membership,
        golden_membership: user.golden_membership,
        role: "user",
      },
    });
  } catch (err) {
    console.log("❌ /auth/me error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
