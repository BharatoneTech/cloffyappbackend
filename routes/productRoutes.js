const express = require("express");
const router = express.Router();

const upload = require("../utils/multer"); // <-- Cloudinary multer
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

// Create product (Cloudinary upload)
router.post(
  "/",
  upload.single("product_img"),
  ProductController.createProduct
);

// Get all products
router.get("/", ProductController.getAllProductsAdmin);

// Get product by ID
router.get("/:id", ProductController.getProductByIdAdmin);

// Update product (Cloudinary)
router.put(
  "/:id",
  upload.single("product_img"),
  ProductController.updateProduct
);

// Delete product
router.delete("/:id", ProductController.deleteProduct);

module.exports = router;
