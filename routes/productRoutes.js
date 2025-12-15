const express = require("express");
const router = express.Router();

const upload = require("../utils/multer");
const ProductController = require("../controllers/productController");

/* ============================
   USER ROUTES
============================ */
router.get("/active", ProductController.getActiveProducts);
router.get("/category/:categoryId", ProductController.getActiveProductsByCategory);
router.get("/active/:id", ProductController.getActiveProductById);

/* ============================
   ADMIN ROUTES
============================ */

// Create product
router.post("/", upload.single("product_img"), ProductController.createProduct);

// Get all products
router.get("/", ProductController.getAllProductsAdmin);

// Get product by ID
router.get("/:id", ProductController.getProductByIdAdmin);

// BULK STATUS UPDATE (Activate / Inactivate category)
router.put("/category/:categoryId/status", ProductController.updateStatusByCategoryAdmin);

// Update product
router.put("/:id", upload.single("product_img"), ProductController.updateProduct);

// Delete product
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
