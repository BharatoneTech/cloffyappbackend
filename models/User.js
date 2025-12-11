// models/User.js
const { getDb } = require("../db/connection");

const User = {
  findByContact: async (contact_number) => {
    const pool = getDb();
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE contact_number = ?",
      [contact_number]
    );
    return rows[0];
  },

  findById: async (id) => {
    const pool = getDb();
    const [rows] = await pool.query(
      "SELECT * FROM users WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  create: async ({ name, contact_number }) => {
    const pool = getDb();

    // Default: no membership
    const [result] = await pool.query(
      "INSERT INTO users (name, contact_number, bowl_membership, golden_membership) VALUES (?, ?, 0, 0)",
      [name, contact_number]
    );

    return {
      id: result.insertId,
      name,
      contact_number,
      bowl_membership: 0,
      golden_membership: 0,
    };
  },
};

module.exports = User;
