const express = require("express");
const router = express.Router();

const upload = require("../utils/multer"); // Cloudinary multer
const CategoryController = require("../controllers/categoryController");

/* ============================
   USER ROUTES (TOP)
============================ */

// Active categories (user)
router.get("/active/list", CategoryController.getCategories);

/* ============================
   ADMIN ROUTES
============================ */

// Create category
router.post(
  "/",
  upload.single("image"),
  CategoryController.createCategory
);

// Get all categories (admin)
router.get("/", CategoryController.getAllCategories);

// 🔥 BULK STATUS UPDATE (ADMIN)
router.put("/activate/all", CategoryController.activateAllCategories);
router.put("/inactivate/all", CategoryController.inactivateAllCategories);

// Get category by ID
router.get("/:id", CategoryController.getCategoryById);

// Update category
router.put(
  "/:id",
  upload.single("image"),
  CategoryController.updateCategory
);

// Delete category
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
