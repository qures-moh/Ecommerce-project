const express = require("express");

const {
  addSubcategory,
  getSubcategories,
  getSubcategoriesByCategory,
  getSubcategoryById,
  updateSubcategory,
  toggleSubcategoryStatus,
  deleteSubcategory,
} = require("../controller/subcategoryController");

const upload = require("../middleware/multer");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

router.post(
  "/",
  adminMiddleware,
  upload.single("image"),
  addSubcategory
);

router.get("/", getSubcategories);

router.get(
  "/category/:categoryId",
  getSubcategoriesByCategory
);

router.get("/:id", getSubcategoryById);

router.put(
  "/:id",
  adminMiddleware,
  upload.single("image"),
  updateSubcategory
);

router.patch(
  "/:id/status",
  adminMiddleware,
  toggleSubcategoryStatus
);

router.delete(
  "/:id",
  adminMiddleware,
  deleteSubcategory
);

module.exports = router;