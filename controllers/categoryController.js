const { getDb } = require("../db/connection");

/* ============================================================
   CREATE CATEGORY (Cloudinary Upload)
============================================================== */
exports.createCategory = async (req, res) => {
  try {
    const { category_name, status } = req.body;

    if (!category_name) {
      return res
        .status(400)
        .json({ success: false, message: "Category name is required" });
    }

    const image = req.file ? req.file.path : null; // Cloudinary URL

    const pool = getDb();

    const [result] = await pool.query(
      `INSERT INTO categories (category_name, image, status, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [category_name, image, status || "ACTIVE"]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ CREATE CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET ALL CATEGORIES
============================================================== */
exports.getAllCategories = async (req, res) => {
  try {
    const pool = getDb();
    const [rows] = await pool.query(
      `SELECT * FROM categories ORDER BY id DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ GET CATEGORIES ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET CATEGORY BY ID
============================================================== */
exports.getCategoryById = async (req, res) => {
  try {
    const pool = getDb();
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ GET CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};



/* ============================================================
   UPDATE CATEGORY (Cloudinary Upload)
============================================================== */
exports.updateCategory = async (req, res) => {
  try {
    const { category_name, status } = req.body;
    const id = req.params.id;

    const pool = getDb();

    // New image uploaded → use Cloudinary URL
    if (req.file) {
      const imageUrl = req.file.path;

      await pool.query(
        `UPDATE categories SET category_name=?, image=?, status=?, updated_at=NOW()
         WHERE id=?`,
        [category_name, imageUrl, status || "ACTIVE", id]
      );
    } else {
      // No new image
      await pool.query(
        `UPDATE categories SET category_name=?, status=?, updated_at=NOW()
         WHERE id=?`,
        [category_name, status || "ACTIVE", id]
      );
    }

    res.json({ success: true, message: "Category updated" });
  } catch (err) {
    console.error("❌ UPDATE CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   DELETE CATEGORY
============================================================== */
exports.deleteCategory = async (req, res) => {
  try {
    const pool = getDb();

    await pool.query(`DELETE FROM categories WHERE id = ?`, [req.params.id]);

    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    console.error("❌ DELETE CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET ONLY ACTIVE CATEGORIES
============================================================== */
exports.getCategories = async (req, res) => {
  try {
    const pool = getDb();
    const [rows] = await pool.query(
      `SELECT * FROM categories WHERE status='ACTIVE' ORDER BY id ASC`
    );
    res.json(rows);
  } catch (err) {
    console.error("❌ ACTIVE CATEGORY ERROR:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

/* ============================================================
   INACTIVATE ALL CATEGORIES (ADMIN)
============================================================== */
exports.inactivateAllCategories = async (req, res) => {
  try {
    const pool = getDb();

    await pool.query(
      `UPDATE categories 
       SET status='INACTIVE', updated_at=NOW()`
    );

    res.json({
      success: true,
      message: "All categories set to INACTIVE",
    });
  } catch (err) {
    console.error("❌ INACTIVATE ALL ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   ACTIVATE ALL CATEGORIES (ADMIN)
============================================================== */
exports.activateAllCategories = async (req, res) => {
  try {
    const pool = getDb();

    await pool.query(
      `UPDATE categories 
       SET status='ACTIVE', updated_at=NOW()`
    );

    res.json({
      success: true,
      message: "All categories set to ACTIVE",
    });
  } catch (err) {
    console.error("❌ ACTIVATE ALL ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

