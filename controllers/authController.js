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
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
    }

    if (password !== admin.password) {
      return res
        .status(401)
        .json({ message: "Invalid username or password" });
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
 * USER LOGIN / REGISTER
 * --------------------------------------------------- */
exports.userLoginOrRegister = async (req, res) => {
  try {
    const { contact_number, name } = req.body;

    let user = await User.findByContact(contact_number);

    // CREATE NEW USER IF NOT EXISTS
    if (!user) {
      user = await User.create({
        name: name || "Guest",
        contact_number,
      });
    }

    // CREATE JWT TOKEN
    const token = createToken({
      id: user.id,
      role: "user",
    });

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
    console.log("❌ User login/register error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ----------------------------------------------------
 * FETCH PROFILE (/auth/me)
 * --------------------------------------------------- */
exports.me = async (req, res) => {
  try {
    const { id, role } = req.user;

    // ADMIN
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

    // USER
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
