import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Power,
  FolderOpen,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

const AdminCategories = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState(null);

  const getImageUrl = (image) => {
    if (!image) return "";

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const baseUrl = api.defaults.baseURL?.replace(
      /\/api\/?$/,
      ""
    );

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${baseUrl}/${cleanImage}`;
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);

      const response = await api.get("/categories", {
        params: {
          search,
        },
      });

      setCategories(response.data.categories || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [search]);

  const handleStatusChange = async () => {
    if (!confirmAction) return;

    try {
      await api.patch(
        `/categories/${confirmAction.category._id}/status`,
        {
          isActive: !confirmAction.category.isActive,
        }
      );

      toast.success(
        `Category ${
          confirmAction.category.isActive
            ? "deactivated"
            : "activated"
        } successfully`
      );

      setConfirmAction(null);
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update category status"
      );
    }
  };

  const handleDelete = async () => {
    if (!confirmAction) return;

    try {
      await api.delete(
        `/categories/${confirmAction.category._id}`
      );

      toast.success("Category deleted successfully");

      setConfirmAction(null);
      fetchCategories();
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to delete category"
      );
    }
  };

  return (
    <div className="ac-page">
      <div className="ac-header">
        <div className="ac-header-content">
          <h1>Categories</h1>
          <p>Manage your store product categories</p>
        </div>

        <button
          className="ac-add-btn"
          onClick={() =>
            navigate("/admin/categories/add")
          }
        >
          <Plus size={18} />
          Add Category
        </button>
      </div>

      <div className="ac-toolbar">
        <div className="ac-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="ac-card">
        <div className="ac-table-wrapper">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Products</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="ac-empty"
                  >
                    Loading categories...
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="ac-empty"
                  >
                    <FolderOpen size={42} />
                    <span>No categories found</span>
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category._id}>
                    <td>
                      <div className="ac-category-info">
                        <div className="ac-image-box">
                          {category.image ? (
                            <img
                              src={getImageUrl(
                                category.image
                              )}
                              alt={category.name}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <FolderOpen size={20} />
                          )}
                        </div>

                        <div className="ac-category-details">
                          <strong className="ac-category-name">
                            {category.name}
                          </strong>

                          {category.description && (
                            <span className="ac-category-description">
                              {category.description}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="ac-product-count">
                        {category.productCount || 0}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`ac-status ${
                          category.isActive
                            ? "ac-status-active"
                            : "ac-status-inactive"
                        }`}
                      >
                        <span className="ac-status-dot"></span>

                        {category.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td className="ac-date">
                      {new Date(
                        category.createdAt
                      ).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>

                    <td>
                      <div className="ac-actions">
                        <button
                          className="ac-action-btn ac-edit-btn"
                          onClick={() =>
                            navigate(
                              `/admin/categories/edit/${category._id}`
                            )
                          }
                          title="Edit"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          className="ac-action-btn ac-status-btn"
                          onClick={() =>
                            setConfirmAction({
                              type: "status",
                              category,
                            })
                          }
                          title={
                            category.isActive
                              ? "Deactivate"
                              : "Activate"
                          }
                        >
                          <Power size={16} />
                        </button>

                        <button
                          className="ac-action-btn ac-delete-btn"
                          onClick={() =>
                            setConfirmAction({
                              type: "delete",
                              category,
                            })
                          }
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && categories.length > 0 && (
          <div className="ac-footer">
            <span>
              Showing {categories.length} of{" "}
              {categories.length} categories
            </span>

            <div className="ac-pagination">
              <button
                className="ac-pagination-btn"
                disabled
              >
                Previous
              </button>

              <span className="ac-pagination-text">
                Page 1 of 1
              </span>

              <button
                className="ac-pagination-btn"
                disabled
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {confirmAction && (
        <div className="ac-modal-overlay">
          <div className="ac-confirm-modal">
            <div
              className={`ac-confirm-icon ${
                confirmAction.type === "delete"
                  ? "ac-confirm-delete-icon"
                  : "ac-confirm-status-icon"
              }`}
            >
              {confirmAction.type === "delete" ? (
                <Trash2 size={24} />
              ) : (
                <Power size={24} />
              )}
            </div>

            <h2>
              {confirmAction.type === "delete"
                ? "Delete Category?"
                : confirmAction.category.isActive
                ? "Deactivate Category?"
                : "Activate Category?"}
            </h2>

            <p>
              {confirmAction.type === "delete"
                ? `Are you sure you want to delete "${confirmAction.category.name}"?`
                : `Are you sure you want to ${
                    confirmAction.category.isActive
                      ? "deactivate"
                      : "activate"
                  } "${confirmAction.category.name}"?`}
            </p>

            <div className="ac-confirm-actions">
              <button
                className="ac-cancel-btn"
                onClick={() =>
                  setConfirmAction(null)
                }
              >
                Cancel
              </button>

              <button
                className={
                  confirmAction.type === "delete"
                    ? "ac-confirm-delete-btn"
                    : "ac-confirm-status-btn"
                }
                onClick={
                  confirmAction.type === "delete"
                    ? handleDelete
                    : handleStatusChange
                }
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;