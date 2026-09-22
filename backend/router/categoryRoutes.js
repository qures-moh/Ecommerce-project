const express = require("express");

const {
  getCategories,
  getCategoryById,
  getCategoryProducts,
  addCategory,
  updateCategory,
  updateCategoryStatus,
  deleteCategory,
} = require("../controller/categoryController");

const upload = require("../middleware/multer");

const router = express.Router();

router.get("/", getCategories);

router.get("/:id", getCategoryById);

router.get("/:id/products", getCategoryProducts);

router.post("/", upload.single("image"), addCategory);

router.patch("/:id", upload.single("image"), updateCategory);

router.patch("/:id/status", updateCategoryStatus);

router.delete("/:id", deleteCategory);

module.exports = router;
