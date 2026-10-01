import { useEffect, useState } from "react";
import {
  Search,
  Star,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";


const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const [averageRating, setAverageRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [deleteReview, setDeleteReview] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);

  const limit = 10;

  const getImageUrl = (image) => {
    if (!image) return "";

    if (image.startsWith("http")) {
      return image;
    }

    const apiUrl = import.meta.env.VITE_API_URL || "";
    const baseUrl = apiUrl.replace(/\/api\/?$/, "");

    return `${baseUrl}/${image.replace(/^\/+/, "")}`;
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (rating) {
        params.rating = rating;
      }

      const response = await api.get("/reviews/admin/all", {
        params,
      });

      const data = response.data;

      setReviews(Array.isArray(data?.reviews) ? data.reviews : []);
      setTotalReviews(Number(data?.totalReviews) || 0);
      setTotalPages(Number(data?.totalPages) || 1);
      setAverageRating(Number(data?.averageRating) || 0);
    } catch (error) {
      console.error("FETCH ADMIN REVIEWS ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch reviews"
      );

      setReviews([]);
      setTotalReviews(0);
      setTotalPages(1);
      setAverageRating(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [page, rating]);

  const handleSearchKeyDown = (event) => {
    if (event.key === "Enter") {
      setPage(1);

      if (page === 1) {
        fetchReviews();
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
  };

  const handleRatingChange = (event) => {
    setRating(event.target.value);
    setPage(1);
  };

  const openDeleteModal = (review) => {
    setDeleteReview(review);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;

    setDeleteReview(null);
  };

  const openCommentModal = (review) => {
    setSelectedComment(review);
  };

  const closeCommentModal = () => {
    setSelectedComment(null);
  };

  const handleDelete = async () => {
    if (!deleteReview?._id) return;

    try {
      setDeleteLoading(deleteReview._id);

      await api.delete(`/reviews/admin/${deleteReview._id}`);

      toast.success("Review deleted successfully");

      setDeleteReview(null);

      if (reviews.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        await fetchReviews();
      }
    } catch (error) {
      console.error("DELETE ADMIN REVIEW ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to delete review"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const renderStars = (value) => {
    return (
      <div className="admin-review-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={15}
            fill={star <= value ? "currentColor" : "none"}
            strokeWidth={1.8}
          />
        ))}
      </div>
    );
  };

  const getCustomerName = (review) => {
    const firstName = review.user?.firstName || "";
    const lastName = review.user?.lastName || "";

    return `${firstName} ${lastName}`.trim() || "Unknown User";
  };

  const getInitials = (review) => {
    const firstName = review.user?.firstName || "";
    const lastName = review.user?.lastName || "";

    const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

    return initials.trim() || "U";
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const startItem =
    totalReviews === 0 ? 0 : (page - 1) * limit + 1;

  const endItem = Math.min(page * limit, totalReviews);

  return (
    <div className="admin-page admin-reviews-page">
      <div className="admin-reviews-header">
        <div>
          <h1>Reviews</h1>
          <p>Manage customer reviews and feedback</p>
        </div>
      </div>

      <div className="admin-reviews-filter-card">
        <div className="admin-review-search">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        <div className="admin-review-filter-right">
          <SlidersHorizontal size={18} />

          <select
            value={rating}
            onChange={handleRatingChange}
          >
            <option value="">All Ratings</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <span className="admin-review-count">
            {totalReviews}{" "}
            {totalReviews === 1 ? "Review" : "Reviews"}
          </span>
        </div>
      </div>

      <div className="admin-reviews-summary">
        <div className="admin-review-summary-card">
          <div className="admin-review-summary-icon">
            <Star size={21} />
          </div>

          <div>
            <span>Average Rating</span>
            <strong>{averageRating.toFixed(1)}</strong>
          </div>
        </div>

        <div className="admin-review-summary-card">
          <div className="admin-review-summary-icon">
            <Package size={21} />
          </div>

          <div>
            <span>Total Reviews</span>
            <strong>{totalReviews}</strong>
          </div>
        </div>
      </div>

      <div className="admin-reviews-table-wrapper">
        <table className="admin-reviews-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CUSTOMER</th>
              <th>RATING</th>
              <th>REVIEW</th>
              <th>DATE</th>
              <th>ACTION</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="6"
                  className="admin-reviews-loading"
                >
                  Loading reviews...
                </td>
              </tr>
            ) : reviews.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="admin-reviews-empty"
                >
                  <div>
                    <Star size={35} />
                    <h3>No reviews found</h3>
                    <p>
                      There are no reviews matching your search.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review._id}>
                  <td>
                    <div className="admin-review-product">
                      <div className="admin-review-product-image">
                        {review.product?.image ? (
                          <img
                            src={getImageUrl(
                              review.product.image
                            )}
                            alt={
                              review.product?.name ||
                              "Product"
                            }
                          />
                        ) : (
                          <Package size={21} />
                        )}
                      </div>

                      <div className="admin-review-product-info">
                        <strong>
                          {review.product?.name ||
                            "Deleted Product"}
                        </strong>

                        {review.product?.price !== undefined && (
                          <span>
                            ₹
                            {Number(
                              review.product.price
                            ).toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="admin-review-customer">
                      <div className="admin-review-avatar">
                        {getInitials(review)}
                      </div>

                      <div className="admin-review-customer-info">
                        <strong>
                          {getCustomerName(review)}
                        </strong>

                        <span>
                          {review.user?.email || "—"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="admin-review-rating">
                      {renderStars(review.rating)}

                      <strong>
                        {review.rating}.0
                      </strong>
                    </div>
                  </td>

                  <td>
                    <div className="admin-review-comment">
                      <p>
                        {review.comment || "—"}
                      </p>

                      {review.comment?.length > 120 && (
                        <button
                          type="button"
                          className="admin-review-read-more"
                          onClick={() =>
                            openCommentModal(review)
                          }
                        >
                          Read more
                        </button>
                      )}
                    </div>
                  </td>

                  <td>
                    <span className="admin-review-date">
                      {formatDate(review.createdAt)}
                    </span>
                  </td>

                  <td>
                    <button
                      type="button"
                      className="admin-review-delete-btn"
                      onClick={() =>
                        openDeleteModal(review)
                      }
                      title="Delete Review"
                    >
                      <Trash2 size={17} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {reviews.length > 0 && (
        <div className="admin-reviews-pagination">
          <div className="admin-review-pagination-info">
            Showing <strong>{startItem}</strong> to{" "}
            <strong>{endItem}</strong> of{" "}
            <strong>{totalReviews}</strong> reviews
          </div>

          <div className="admin-review-pagination-buttons">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                setPage((prev) =>
                  Math.max(prev - 1, 1)
                )
              }
            >
              <ChevronLeft size={17} />
              Previous
            </button>

            <span>
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() =>
                setPage((prev) =>
                  Math.min(
                    prev + 1,
                    totalPages
                  )
                )
              }
            >
              Next
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {selectedComment && (
        <div
          className="admin-review-modal-overlay"
          onMouseDown={closeCommentModal}
        >
          <div
            className="admin-review-comment-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-review-modal-close"
              onClick={closeCommentModal}
            >
              <X size={19} />
            </button>

            <div className="admin-review-comment-modal-header">
              <div className="admin-review-comment-modal-icon">
                <Star size={20} />
              </div>

              <div>
                <h3>Customer Review</h3>
                <span>
                  {getCustomerName(selectedComment)}
                </span>
              </div>
            </div>

            <div className="admin-review-comment-modal-rating">
              {renderStars(selectedComment.rating)}

              <strong>
                {selectedComment.rating}.0
              </strong>
            </div>

            <div className="admin-review-full-comment">
              {selectedComment.comment}
            </div>

            <div className="admin-review-comment-modal-date">
              {formatDate(selectedComment.createdAt)}
            </div>
          </div>
        </div>
      )}

      {deleteReview && (
        <div
          className="admin-review-modal-overlay"
          onMouseDown={closeDeleteModal}
        >
          <div
            className="admin-review-delete-modal"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <button
              type="button"
              className="admin-review-modal-close"
              onClick={closeDeleteModal}
              disabled={Boolean(deleteLoading)}
            >
              <X size={19} />
            </button>

            <div className="admin-review-delete-icon">
              <Trash2 size={24} />
            </div>

            <h3>Delete Review?</h3>

            <p>
              Are you sure you want to delete this
              review? This action cannot be undone.
            </p>

            <div className="admin-review-modal-actions">
              <button
                type="button"
                className="admin-review-cancel-btn"
                onClick={closeDeleteModal}
                disabled={Boolean(deleteLoading)}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-review-confirm-btn"
                onClick={handleDelete}
                disabled={Boolean(deleteLoading)}
              >
                {deleteLoading
                  ? "Deleting..."
                  : "Delete Review"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;