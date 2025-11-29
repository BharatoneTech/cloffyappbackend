// controllers/authController.js
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Admin = require("../models/admin");
const User = require("../models/User");

const createToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// ---------------------
// ADMIN LOGIN
// ---------------------
exports.adminLogin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findByUsername(username);
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(401).json({ message: "Invalid credentials" });

    const token = createToken({
      id: admin.id,
      role: admin.role || "admin",
      username: admin.username,
    });

    res.json({
      token,
      user: {
        id: admin.id,
        username: admin.username,
        role: admin.role,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------------
// USER LOGIN / REGISTER
// ---------------------
exports.userLoginOrRegister = async (req, res) => {
  try {
    const { contact_number, name } = req.body;

    let user = await User.findByContact(contact_number);

    if (!user) {
      user = await User.create({
        name: name || "Guest",
        contact_number,
      });
    }

    const token = createToken({
      id: user.id,
      role: "user",
      contact_number: user.contact_number,
      name: user.name,
    });

    res.json({ token, user });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// ---------------------
// FETCH PROFILE
// ---------------------
exports.me = async (req, res) => {
  try {
    const { id, role } = req.user;

    if (role === "admin") {
      const admin = await Admin.findById(id);
      return res.json(admin);
    } else {
      const user = await User.findById(id);
      return res.json(user);
    }
  } catch {
    res.status(500).json({ message: "Server Error" });
  }
};
