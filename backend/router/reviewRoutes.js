const express = require("express");

const {
  addReview,
  getProductReviews,
  deleteReview,
} = require("../controller/ReviewController");

const {
  getAllReviews,
  deleteAdminReview,
} = require("../controller/adminReviewController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

router.get("/admin/all", adminMiddleware, getAllReviews);

router.delete("/admin/:id", adminMiddleware, deleteAdminReview);

router.get("/:productId", getProductReviews);

router.post("/:productId", authMiddleware, addReview);

router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;