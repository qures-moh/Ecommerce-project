import { useEffect, useState } from "react";
import { Star, Trash2, X } from "lucide-react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/axios";


export default function ProductReviews({ productId }) {
  const user = useSelector((state) => state.user);

  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const [deleteReviewId, setDeleteReviewId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const currentUserId = user?._id || user?.id;

  const fetchReviews = async () => {
    try {
      const response = await api.get(`/reviews/${productId}`);

      setReviews(response.data?.reviews || []);
      setAverageRating(response.data?.averageRating || 0);
      setTotalReviews(response.data?.totalReviews || 0);
    } catch (error) {
      console.log("FETCH REVIEWS ERROR:", error);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const getUserName = (reviewUser) => {
    if (!reviewUser) {
      return "User";
    }

    const name = `${reviewUser.firstName || ""} ${
      reviewUser.lastName || ""
    }`.trim();

    return name || "User";
  };

  const getInitials = (reviewUser) => {
    if (!reviewUser) {
      return "U";
    }

    const firstName = reviewUser.firstName || "";
    const lastName = reviewUser.lastName || "";

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return initials.trim().toUpperCase() || "U";
  };

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const getIsOwnReview = (review) => {
    const reviewUserId =
      review.user?._id || review.user?.id;

    if (!currentUserId || !reviewUserId) {
      return false;
    }

    return (
      currentUserId.toString() === reviewUserId.toString()
    );
  };

  const userReview = reviews.find((review) =>
    getIsOwnReview(review)
  );

  const hasReviewed = Boolean(userReview);

  const renderStars = (value, size = 18) => {
    return (
      <div className="product-review-stars-display">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={size}
            fill={
              star <= Math.round(value)
                ? "#d94b0b"
                : "none"
            }
            stroke={
              star <= Math.round(value)
                ? "#d94b0b"
                : "#b7b0aa"
            }
            strokeWidth={1.8}
          />
        ))}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please login to write a review");
      return;
    }

    if (hasReviewed) {
      toast.info("You have already reviewed this product");
      setComment("");
      setRating(5);
      return;
    }

    if (!comment.trim()) {
      toast.error("Please write a review");
      return;
    }

    if (comment.trim().length < 3) {
      toast.error(
        "Review must contain at least 3 characters"
      );
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        `/reviews/${productId}`,
        {
          rating,
          comment: comment.trim(),
        }
      );

      toast.success(
        response.data?.message ||
          "Review added successfully"
      );

      setComment("");
      setRating(5);

      await fetchReviews();
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Failed to add review";

      toast.error(message);

      if (
        message ===
        "You have already reviewed this product"
      ) {
        setComment("");
        setRating(5);

        await fetchReviews();
      }
    } finally {
      setLoading(false);
    }
  };

  const openDeleteConfirmation = (reviewId) => {
    setDeleteReviewId(reviewId);
  };

  const closeDeleteConfirmation = () => {
    if (deleteLoading) {
      return;
    }

    setDeleteReviewId(null);
  };

  const handleDelete = async () => {
    if (!deleteReviewId) {
      return;
    }

    try {
      setDeleteLoading(true);

      await api.delete(`/reviews/${deleteReviewId}`);

      toast.success("Review deleted successfully");

      setComment("");
      setRating(5);
      setDeleteReviewId(null);

      await fetchReviews();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete review"
      );
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <section className="product-reviews">
        <div className="product-reviews-container">
          <div className="product-reviews-heading">
            <span className="product-reviews-eyebrow">
              CUSTOMER REVIEWS
            </span>

            <h2 className="product-reviews-title">
              Customer Reviews
            </h2>

            <p className="product-reviews-subtitle">
              See what customers have to say about this
              product.
            </p>
          </div>

          <div className="product-review-summary">
            <div className="product-review-summary-rating">
              <strong>
                {averageRating.toFixed(1)}
              </strong>

              {renderStars(averageRating, 20)}

              <span>
                {totalReviews}{" "}
                {totalReviews === 1
                  ? "rating"
                  : "ratings"}
              </span>
            </div>

            <div className="product-review-summary-divider"></div>

            <div className="product-review-summary-text">
              <strong>
                {totalReviews === 0
                  ? "No reviews yet"
                  : `${totalReviews} ${
                      totalReviews === 1
                        ? "customer review"
                        : "customer reviews"
                    }`}
              </strong>

              <span>
                Your feedback helps other customers make
                better decisions.
              </span>
            </div>
          </div>

          {!user && (
            <div className="product-review-login-message">
              <div>
                <h3>
                  Want to share your experience?
                </h3>

                <p>
                  Please login to write a review for this
                  product.
                </p>
              </div>
            </div>
          )}

          {user && !hasReviewed && (
            <div className="product-review-write-box">
              <div className="product-review-write-header">
                <div>
                  <span>
                    SHARE YOUR EXPERIENCE
                  </span>

                  <h3>Write a review</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="product-review-rating-input">
                  <span>Your rating</span>

                  <div className="product-review-rating-buttons">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className="product-review-star-button"
                        onClick={() =>
                          setRating(star)
                        }
                        aria-label={`Give ${star} star`}
                      >
                        <Star
                          size={24}
                          fill={
                            star <= rating
                              ? "#d94b0b"
                              : "none"
                          }
                          stroke={
                            star <= rating
                              ? "#d94b0b"
                              : "#a9a29d"
                          }
                          strokeWidth={1.8}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  value={comment}
                  onChange={(e) =>
                    setComment(e.target.value)
                  }
                  placeholder="What did you like or dislike about this product?"
                  maxLength={500}
                  rows={5}
                />

                <div className="product-review-form-bottom">
                  <span>
                    {comment.length}/500
                  </span>

                  <button
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? "Submitting..."
                      : "Submit Review"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {user && hasReviewed && (
            <div className="product-your-review-box">
              <div className="product-your-review-header">
                <div>
                  <span>YOUR REVIEW</span>

                  <h3>
                    Thank you for your feedback
                  </h3>
                </div>
              </div>

              <div className="product-your-review-content">
                <div className="product-review-user">
                  <div className="product-review-avatar">
                    {getInitials(user)}
                  </div>

                  <div className="product-review-user-info">
                    <h4>{getUserName(user)}</h4>

                    <span>
                      {formatDate(
                        userReview.createdAt
                      )}
                    </span>
                  </div>

                  <button
                    type="button"
                    className="product-review-delete"
                    onClick={() =>
                      openDeleteConfirmation(
                        userReview._id
                      )
                    }
                    aria-label="Delete review"
                    title="Delete review"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="product-review-rating-row">
                  {renderStars(
                    userReview.rating,
                    17
                  )}

                  <strong>
                    {userReview.rating}.0
                  </strong>
                </div>

                <p className="product-review-comment">
                  {userReview.comment}
                </p>
              </div>
            </div>
          )}

          <div className="product-review-section-header">
            <div>
              <h3>Customer feedback</h3>

              <span>
                {totalReviews}{" "}
                {totalReviews === 1
                  ? "review"
                  : "reviews"}
              </span>
            </div>
          </div>

          <div className="product-review-list">
            {reviews.length === 0 ? (
              <div className="product-no-reviews">
                <div className="product-no-reviews-icon">
                  <Star size={25} />
                </div>

                <h3>No reviews yet</h3>

                <p>
                  Be the first customer to share your
                  experience with this product.
                </p>
              </div>
            ) : (
              reviews.map((review) => {
                const isOwnReview =
                  getIsOwnReview(review);

                return (
                  <article
                    className="product-review-item"
                    key={review._id}
                  >
                    <div className="product-review-user">
                      <div className="product-review-avatar">
                        {getInitials(review.user)}
                      </div>

                      <div className="product-review-user-info">
                        <h4>
                          {getUserName(review.user)}
                        </h4>

                        <span>
                          {formatDate(
                            review.createdAt
                          )}
                        </span>
                      </div>

                      {isOwnReview && (
                        <button
                          type="button"
                          className="product-review-delete"
                          onClick={() =>
                            openDeleteConfirmation(
                              review._id
                            )
                          }
                          aria-label="Delete review"
                          title="Delete review"
                        >
                          <Trash2 size={17} />
                        </button>
                      )}
                    </div>

                    <div className="product-review-rating-row">
                      {renderStars(
                        review.rating,
                        17
                      )}

                      <strong>
                        {review.rating}.0
                      </strong>
                    </div>

                    <p className="product-review-comment">
                      {review.comment}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </section>

      {deleteReviewId && (
        <div
          className="review-delete-overlay"
          onMouseDown={closeDeleteConfirmation}
        >
          <div
            className="review-delete-modal"
            onMouseDown={(e) =>
              e.stopPropagation()
            }
          >
            <button
              type="button"
              className="review-delete-close"
              onClick={closeDeleteConfirmation}
              disabled={deleteLoading}
              aria-label="Close confirmation"
            >
              <X size={19} />
            </button>

            <div className="review-delete-icon">
              <Trash2 size={23} />
            </div>

            <h3>Delete your review?</h3>

            <p>
              Are you sure you want to delete your review?
              This action cannot be undone.
            </p>

            <div className="review-delete-actions">
              <button
                type="button"
                className="review-delete-cancel"
                onClick={closeDeleteConfirmation}
                disabled={deleteLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="review-delete-confirm"
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}