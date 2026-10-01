const Review = require("../model/Review");
const Product = require("../model/Product");

const getUserId = (req) => {
  return req.userId;
};

const addReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { productId } = req.params;
    const { rating, comment } = req.body;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    if (!productId) {
      return res.status(400).json({
        message: "Product ID is required",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        message: "Rating must be between 1 and 5",
      });
    }

    if (!comment || !comment.trim()) {
      return res.status(400).json({
        message: "Review comment is required",
      });
    }

    const existingReview = await Review.findOne({
      product: productId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    const review = await Review.create({
      product: productId,
      user: userId,
      rating: numericRating,
      comment: comment.trim(),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "firstName lastName");

    return res.status(201).json({
      message: "Review added successfully",
      review: populatedReview,
    });
  } catch (error) {
    console.log("ADD REVIEW ERROR:", error);

    if (error.code === 11000) {
      return res.status(400).json({
        message: "You have already reviewed this product",
      });
    }

    return res.status(500).json({
      message: "Failed to add review",
      error: error.message,
    });
  }
};

const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;

    const reviews = await Review.find({
      product: productId,
    })
      .populate("user", "firstName lastName")
      .sort({ createdAt: -1 });

    const totalReviews = reviews.length;

    const totalRating = reviews.reduce(
      (total, review) => total + review.rating,
      0
    );

    const averageRating =
      totalReviews > 0
        ? Number((totalRating / totalReviews).toFixed(1))
        : 0;

    return res.status(200).json({
      message: "Reviews fetched successfully",
      reviews,
      totalReviews,
      averageRating,
    });
  } catch (error) {
    console.log("GET REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Failed to get reviews",
      error: error.message,
    });
  }
};

const deleteReview = async (req, res) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({
        message: "User not authenticated",
      });
    }

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        message: "You can delete only your own review",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE REVIEW ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  addReview,
  getProductReviews,
  deleteReview,
};