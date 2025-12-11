const express = require("express");
const router = express.Router();

const upload = require("../utils/multer"); // <-- Cloudinary multer
const CategoryController = require("../controllers/categoryController");

/* ============================
   ADMIN ROUTES
============================ */

// Create category (Cloudinary upload)
router.post(
  "/",
  upload.single("image"),
  CategoryController.createCategory
);

// Get all categories (admin)
router.get("/", CategoryController.getAllCategories);

// Get category by ID
router.get("/:id", CategoryController.getCategoryById);

// Update category (Cloudinary)
router.put(
  "/:id",
  upload.single("image"),
  CategoryController.updateCategory
);

// Delete category
router.delete("/:id", CategoryController.deleteCategory);

/* ============================
   USER ROUTES
============================ */

// Active categories (user)
router.get("/active/list", CategoryController.getCategories);

module.exports = router;
