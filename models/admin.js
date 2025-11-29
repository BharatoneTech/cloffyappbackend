// models/Admin.js
const { getDb } = require("../db/connection");

const Admin = {
  findByUsername: async (username) => {
    const pool = getDb();
    const [rows] = await pool.query(
      "SELECT * FROM admins WHERE username = ?",
      [username]
    );
    return rows[0];
  },

  findById: async (id) => {
    const pool = getDb();
    const [rows] = await pool.query("SELECT * FROM admins WHERE id = ?", [id]);
    return rows[0];
  },
};

module.exports = Admin;
