
const express = require("express");

const {
  addSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} = require("../controller/subcategoryController");

const upload = require("../middleware/multer");

const router = express.Router();

router.post("/", upload.single("image"), addSubcategory);

router.get("/", getSubcategories);

router.get("/category/:categoryId", getSubcategoriesByCategory);

router.get("/:id", getSubcategoryById);

router.patch("/:id", upload.single("image"), updateSubcategory);

router.delete("/:id", deleteSubcategory);

module.exports = router;