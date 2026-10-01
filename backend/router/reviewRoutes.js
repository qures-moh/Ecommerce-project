const express = require("express");

const {
  addReview,
  getProductReviews,
  deleteReview,
} = require("../controller/ReviewController");

const {
  getAllReviews,
  deleteAdminReview,
} = require("../controller/AdminReviewController");

const authMiddleware = require("../middleware/auth");
const adminMiddleware = require("../middleware/admin");

const router = express.Router();

router.get("/:productId", getProductReviews);

router.post("/:productId", authMiddleware, addReview);

router.delete("/:id", authMiddleware, deleteReview);

router.get("/admin/all", adminMiddleware, getAllReviews);

router.delete("/admin/:id", adminMiddleware, deleteAdminReview);

module.exports = router;