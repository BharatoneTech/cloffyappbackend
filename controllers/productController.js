const { getDb } = require("../db/connection");

/* ============================================================
   PRICE HELPER
============================================================== */
function computePrices(net_price, discount, bowlmem_discount, goldenmem_discount) {
  const n = parseFloat(net_price) || 0;
  const d = parseFloat(discount) || 0;
  const b = parseFloat(bowlmem_discount) || 0;
  const g = parseFloat(goldenmem_discount) || 0;

  const selling_price = parseFloat((n * (1 - d / 100)).toFixed(2));
  const bowl_price = parseFloat((selling_price * (1 - b / 100)).toFixed(2));
  const golden_price = parseFloat((selling_price * (1 - g / 100)).toFixed(2));

  return {
    selling_price,
    bowlmem_sellingprice: bowl_price,
    goldenmem_sellingprice: golden_price,
  };
}

/* ============================================================
   CREATE PRODUCT (Cloudinary Upload)
============================================================== */
exports.createProduct = async (req, res) => {
  try {
    const pool = getDb();

    const {
      category_id,
      product_name,
      preparation_time,
      discount,
      net_price,
      bowlmem_discount,
      goldenmem_discount,
      info,
      status,
      tagline,
    } = req.body;

    if (!category_id || !product_name) {
      return res.status(400).json({
        success: false,
        message: "Category and product name are required",
      });
    }

    const product_img = req.file ? req.file.path : null; // Cloudinary URL

    const prices = computePrices(
      net_price,
      discount,
      bowlmem_discount,
      goldenmem_discount
    );

    const [result] = await pool.query(
      `INSERT INTO products
       (category_id, product_name, product_img, preparation_time, discount,
        selling_price, net_price, bowlmem_discount, goldenmem_discount,
        bowlmem_sellingprice, goldenmem_sellingprice, info, status, tagline,
        created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        category_id,
        product_name,
        product_img,
        preparation_time || null,
        discount || 0,
        prices.selling_price,
        net_price || 0,
        bowlmem_discount || 0,
        goldenmem_discount || 0,
        prices.bowlmem_sellingprice,
        prices.goldenmem_sellingprice,
        info || null,
        status || "ACTIVE",
        tagline || null,
      ]
    );

    res.json({ success: true, id: result.insertId });
  } catch (err) {
    console.error("❌ CREATE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET ALL PRODUCTS
============================================================== */
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const pool = getDb();

    const [rows] = await pool.query(
      `SELECT p.*, c.category_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       ORDER BY p.id DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ GET ALL PRODUCTS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   GET PRODUCT BY ID
============================================================== */
exports.getProductByIdAdmin = async (req, res) => {
  try {
    const pool = getDb();

    const [rows] = await pool.query(
      `SELECT * FROM products WHERE id = ?`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ GET PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   UPDATE PRODUCT (Cloudinary Upload)
============================================================== */
exports.updateProduct = async (req, res) => {
  try {
    const pool = getDb();
    const id = req.params.id;

    const {
      category_id,
      product_name,
      preparation_time,
      discount,
      net_price,
      bowlmem_discount,
      goldenmem_discount,
      info,
      status,
      tagline,
    } = req.body;

    const prices = computePrices(
      net_price,
      discount,
      bowlmem_discount,
      goldenmem_discount
    );

    const newImage = req.file ? req.file.path : null;

    await pool.query(
      `UPDATE products SET
        category_id = ?, product_name = ?,
        product_img = IFNULL(?, product_img),
        preparation_time = ?, discount = ?, selling_price = ?, net_price = ?,
        bowlmem_discount = ?, goldenmem_discount = ?,
        bowlmem_sellingprice = ?, goldenmem_sellingprice = ?,
        info = ?, status = ?, tagline = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        category_id,
        product_name,
        newImage,
        preparation_time || null,
        discount || 0,
        prices.selling_price,
        net_price || 0,
        bowlmem_discount || 0,
        goldenmem_discount || 0,
        prices.bowlmem_sellingprice,
        prices.goldenmem_sellingprice,
        info || null,
        status || "ACTIVE",
        tagline || null,
        id,
      ]
    );

    res.json({ success: true, message: "Product updated" });
  } catch (err) {
    console.error("❌ UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   DELETE PRODUCT
============================================================== */
exports.deleteProduct = async (req, res) => {
  try {
    const pool = getDb();

    await pool.query(`DELETE FROM products WHERE id = ?`, [req.params.id]);

    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    console.error("❌ DELETE PRODUCT ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   USER — GET ACTIVE PRODUCTS
============================================================== */
exports.getActiveProducts = async (req, res) => {
  try {
    const pool = getDb();

    const [rows] = await pool.query(
      `SELECT p.*
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.status='ACTIVE'
       AND c.status='ACTIVE'
       ORDER BY p.id DESC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ GET ACTIVE PRODUCTS ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   USER — GET ACTIVE PRODUCTS BY CATEGORY
============================================================== */
exports.getActiveProductsByCategory = async (req, res) => {
  try {
    const pool = getDb();

    const [rows] = await pool.query(
      `SELECT p.*
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ?
       AND p.status='ACTIVE'
       AND c.status='ACTIVE'`,
      [req.params.categoryId]
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error("❌ GET BY CATEGORY ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ============================================================
   USER — GET ACTIVE PRODUCT BY ID
============================================================== */
exports.getActiveProductById = async (req, res) => {
  try {
    const pool = getDb();

    const [rows] = await pool.query(
      `SELECT p.*
       FROM products p
       JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?
       AND p.status='ACTIVE'
       AND c.status='ACTIVE'`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error("❌ GET PRODUCT BY ID ERROR:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
