// controllers/orderController.js
const { getDb } = require("../db/connection");

// ⭐ Helper: generate CLF_XXXX unique code
function generateUniqueCode() {
  const num = Math.floor(1000 + Math.random() * 9000); // 1000-9999
  return `CLF_${num}`;
}

// ======================================================
// 1️⃣ CREATE ORDER WITH STAR + REWARD SYSTEM
// ======================================================
exports.createOrder = async (req, res) => {
  const db = getDb();
  const conn = await db.getConnection();

  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthenticated user" });
    }

    const {
      amount = 0,
      gst_amount = 0,
      final_amount = 0,
      items,
      transactionId,
    } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    await conn.beginTransaction();

    // 1️⃣ Create Order with unique_code + initial status PLACED
    const uniqueCode = generateUniqueCode();

    const [orderResult] = await conn.query(
      `
      INSERT INTO orders (user_id, amount, gst_amount, final_amount, status, unique_code)
      VALUES (?, ?, ?, ?, 'PLACED', ?)
      `,
      [userId, amount, gst_amount, final_amount, uniqueCode]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insert Order Items
    for (const item of items) {
      const safeProductId =
        item.product_id ?? item.productId ?? item.product?.id ?? null;

      const safeQuantity = Number(item.quantity ?? item.qty ?? 1);

      const safeUnitPrice = Number(
        item.unit_price ??
          item.unitPrice ??
          item.price ??
          item.product?.selling_price ??
          0
      );

      const totalPrice = safeUnitPrice * safeQuantity;

      const [itemResult] = await conn.query(
        `
        INSERT INTO order_items (order_id, product_id, quantity, unit_price, total_price)
        VALUES (?, ?, ?, ?, ?)
        `,
        [orderId, safeProductId, safeQuantity, safeUnitPrice, totalPrice]
      );

      const orderItemId = itemResult.insertId;

      //  Add-ons
      const addons = Array.isArray(item.addons) ? item.addons : [];

      for (const addon of addons) {
        const ingredientId = addon.ingredient_id ?? addon.id ?? null;
        const addonPrice = Number(addon.price ?? 0);

        if (!ingredientId) continue;

        await conn.query(
          `
          INSERT INTO order_item_ingredients (order_item_id, ingredient_id, price)
          VALUES (?, ?, ?)
          `,
          [orderItemId, ingredientId, addonPrice]
        );
      }
    }

    // 3️⃣ Insert PAYMENTS
    const txId =
      transactionId ||
      `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    await conn.query(
      `
      INSERT INTO payments (order_id, user_id, amount, gst_amount, transactionid, status)
      VALUES (?, ?, ?, ?, ?, 'SUCCESS')
      `,
      [orderId, userId, final_amount, gst_amount, txId]
    );

    // ⭐ STAR + REWARD SYSTEM ⭐
    let currentStars = 0;
    let newRewardGenerated = false;

    if (final_amount >= 100) {
      const [starRows] = await conn.query(
        `SELECT stars FROM user_stars WHERE user_id = ? LIMIT 1`,
        [userId]
      );

      if (starRows.length === 0) {
        await conn.query(
          `INSERT INTO user_stars (user_id, stars) VALUES (?, 1)`,
          [userId]
        );
        currentStars = 1;
      } else {
        currentStars = starRows[0].stars + 1;

        await conn.query(
          `UPDATE user_stars SET stars = ? WHERE user_id = ?`,
          [currentStars, userId]
        );
      }

      // ⭐ if 10 stars → reset and generate reward ⭐
      if (currentStars >= 10) {
        await conn.query(
          `UPDATE user_stars SET stars = 0 WHERE user_id = ?`,
          [userId]
        );

        const [rewardRows] = await conn.query(
          `SELECT id FROM rewards ORDER BY RAND() LIMIT 1`
        );

        if (rewardRows.length > 0) {
          const rewardId = rewardRows[0].id;

          await conn.query(
            `
            INSERT INTO user_rewards (user_id, reward_id, status)
            VALUES (?, ?, 'ACTIVE')
            `,
            [userId, rewardId]
          );

          newRewardGenerated = true;
        }
      }
    }

    // ⭐ fetch updated stars + rewards ⭐
    const [starInfo] = await conn.query(
      `SELECT stars FROM user_stars WHERE user_id = ? LIMIT 1`,
      [userId]
    );

    const [rewardInfo] = await conn.query(
      `SELECT COUNT(*) AS rewards FROM user_rewards WHERE user_id = ? AND status='ACTIVE'`,
      [userId]
    );

    await conn.commit();

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId,
      unique_code: uniqueCode,
      stars: starInfo.length ? starInfo[0].stars : 0,
      rewards: rewardInfo[0].rewards,
      newRewardGenerated,
    });
  } catch (err) {
    await conn.rollback();
    console.error("❌ createOrder error:", err);
    return res.status(500).json({ message: "Order creation failed" });
  } finally {
    conn.release();
  }
};

// ======================================================
// 2️⃣ GET ALL ORDERS OF USER (for /my)
// ======================================================
exports.getUserOrders = async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;

    const [orders] = await db.query(
      `
      SELECT * FROM orders
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId]
    );

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ getUserOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// ======================================================
// 3️⃣ GET SINGLE ORDER BY ID (simple, as before)
// ======================================================
exports.getOrderById = async (req, res) => {
  try {
    const db = getDb();
    const userId = req.user.id;
    const orderId = req.params.id;

    const [orders] = await db.query(
      `
      SELECT * FROM orders 
      WHERE id = ? AND user_id = ?
      `,
      [orderId, userId]
    );

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ success: true, order: orders[0] });
  } catch (err) {
    console.error("❌ getOrderById error:", err);
    return res.status(500).json({ message: "Failed to fetch order" });
  }
};

// ======================================================
// 4️⃣ GET FULL ORDER DETAILS (order + items + addons)
//     - works for both USER and ADMIN
// ======================================================
exports.getOrderWithItems = async (req, res) => {
  try {
    const db = getDb();
    const user = req.user;
    const orderId = req.params.id;

    let orderQuery = `SELECT * FROM orders WHERE id = ?`;
    const params = [orderId];

    // If not admin → restrict to own order
    if (user.role !== "admin") {
      orderQuery += ` AND user_id = ?`;
      params.push(user.id);
    }

    const [orders] = await db.query(orderQuery, params);

    if (!orders.length) {
      return res.status(404).json({ message: "Order not found" });
    }

    const order = orders[0];

    // Items with product info
    const [itemRows] = await db.query(
      `
      SELECT oi.*, p.product_name, p.product_img
      FROM order_items oi
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE oi.order_id = ?
      `,
      [orderId]
    );

    if (itemRows.length === 0) {
      return res.json({ success: true, order, items: [] });
    }

    const orderItemIds = itemRows.map((row) => row.id);

    // Addons joined
    const [addonRows] = await db.query(
      `
      SELECT oii.*, ai.ingredients AS ingredient_name
      FROM order_item_ingredients oii
      LEFT JOIN additional_ingredients ai ON ai.id = oii.ingredient_id
      WHERE oii.order_item_id IN (?)
      `,
      [orderItemIds]
    );

    const addonsByOrderItem = {};
    addonRows.forEach((row) => {
      if (!addonsByOrderItem[row.order_item_id]) {
        addonsByOrderItem[row.order_item_id] = [];
      }
      addonsByOrderItem[row.order_item_id].push({
        id: row.id,
        ingredient_id: row.ingredient_id,
        name: row.ingredient_name,
        price: row.price,
      });
    });

    const items = itemRows.map((row) => ({
      id: row.id,
      product_id: row.product_id,
      product_name: row.product_name,
      product_img: row.product_img,
      quantity: row.quantity,
      unit_price: row.unit_price,
      total_price: row.total_price,
      addons: addonsByOrderItem[row.id] || [],
    }));

    return res.json({ success: true, order, items });
  } catch (err) {
    console.error("❌ getOrderWithItems error:", err);
    return res.status(500).json({ message: "Failed to fetch order details" });
  }
};

// ======================================================
// 5️⃣ ADMIN: GET ALL ORDERS (latest first)
// ======================================================
exports.getAdminOrders = async (req, res) => {
  try {
    const db = getDb();

    const [orders] = await db.query(
      `
      SELECT 
        o.*,

        -- User Name (exact column in your DB)
        u.name AS user_name,

        -- Contact number (instead of email)
        u.contact_number AS user_contact

      FROM orders o
      LEFT JOIN users u ON u.id = o.user_id
      ORDER BY o.created_at DESC
      `
    );

    return res.json({ success: true, orders });
  } catch (err) {
    console.error("❌ getAdminOrders error:", err);
    return res.status(500).json({ message: "Failed to fetch admin orders" });
  }
};


// ======================================================
// 6️⃣ ADMIN: UPDATE ORDER STATUS
// ======================================================
exports.updateOrderStatus = async (req, res) => {
  try {
    const db = getDb();
    const orderId = req.params.id;
    const { status } = req.body;

    const allowed = ["PLACED", "PROCESSING", "COMPLETED", "CANCELLED"];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const [result] = await db.query(
      `
      UPDATE orders
      SET status = ?
      WHERE id = ?
      `,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({ success: true, message: "Status updated", status });
  } catch (err) {
    console.error("❌ updateOrderStatus error:", err);
    return res.status(500).json({ message: "Failed to update status" });
  }
};
