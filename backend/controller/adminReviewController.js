const Review = require("../model/Review");

const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = "",
      rating,
    } = req.query;

    const pageNumber = Math.max(Number(page), 1);
    const limitNumber = Math.max(Number(limit), 1);

    const filter = {};

    if (rating) {
      const numericRating = Number(rating);

      if (numericRating >= 1 && numericRating <= 5) {
        filter.rating = numericRating;
      }
    }

    const reviews = await Review.find(filter)
      .populate("user", "firstName lastName email")
      .populate("product", "name image price")
      .sort({ createdAt: -1 })
      .skip((pageNumber - 1) * limitNumber)
      .limit(limitNumber);

    let filteredReviews = reviews;

    if (search) {
      const searchText = search.toLowerCase();

      filteredReviews = reviews.filter((review) => {
        const productName =
          review.product?.name?.toLowerCase() || "";

        const firstName =
          review.user?.firstName?.toLowerCase() || "";

        const lastName =
          review.user?.lastName?.toLowerCase() || "";

        const email =
          review.user?.email?.toLowerCase() || "";

        const comment =
          review.comment?.toLowerCase() || "";

        return (
          productName.includes(searchText) ||
          firstName.includes(searchText) ||
          lastName.includes(searchText) ||
          email.includes(searchText) ||
          comment.includes(searchText)
        );
      });
    }

    const totalReviews = await Review.countDocuments(filter);

    const ratingStats = await Review.aggregate([
      {
        $group: {
          _id: "$rating",
          count: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          _id: -1,
        },
      },
    ]);

    const averageResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: {
            $avg: "$rating",
          },
        },
      },
    ]);

    const averageRating =
      averageResult.length > 0
        ? Number(averageResult[0].averageRating.toFixed(1))
        : 0;

    return res.status(200).json({
      message: "Reviews fetched successfully",
      reviews: filteredReviews,
      currentPage: pageNumber,
      totalPages: Math.ceil(totalReviews / limitNumber),
      totalReviews,
      averageRating,
      ratingStats,
    });
  } catch (error) {
    console.log("GET ADMIN REVIEWS ERROR:", error);

    return res.status(500).json({
      message: "Failed to fetch reviews",
      error: error.message,
    });
  }
};

const deleteAdminReview = async (req, res) => {
  try {
    const { id } = req.params;

    const review = await Review.findById(id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found",
      });
    }

    await Review.findByIdAndDelete(id);

    return res.status(200).json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.log("DELETE ADMIN REVIEW ERROR:", error);

    return res.status(500).json({
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

module.exports = {
  getAllReviews,
  deleteAdminReview,
};