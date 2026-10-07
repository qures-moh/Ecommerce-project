import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Tag,
  Trash2,
  X,
  Power,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const AdminTags = () => {
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState("");
  const [tagName, setTagName] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [deleteTag, setDeleteTag] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);

      const response = await api.get("/tags", {
        params: {
          search: search.trim(),
          limit: 100,
        },
      });

      setTags(response.data?.tags || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch tags"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setTagName("");
    setShowAddForm(true);
  };

  const closeAddModal = () => {
    if (adding) {
      return;
    }

    setShowAddForm(false);
    setTagName("");
  };

  const handleAddTag = async (event) => {
    event.preventDefault();

    const cleanName = tagName.trim().toLowerCase();

    if (!cleanName) {
      toast.error("Tag name is required");
      return;
    }

    if (cleanName.length < 2) {
      toast.error(
        "Tag must contain at least 2 characters"
      );
      return;
    }

    if (cleanName.length > 50) {
      toast.error(
        "Tag cannot exceed 50 characters"
      );
      return;
    }

    try {
      setAdding(true);

      const response = await api.post("/tags", {
        name: cleanName,
      });

      toast.success(
        "Tag added successfully"
      );

      setTags((prev) => [
        response.data.tag,
        ...prev,
      ]);

      setTagName("");
      setShowAddForm(false);
    } catch (error) {
      const existingTag =
        error.response?.data?.tag;

      if (
        error.response?.status === 409 &&
        existingTag &&
        !existingTag.isActive
      ) {
        toast.error(
          "This tag already exists but is inactive. Activate it from the list."
        );
      } else {
        toast.error(
          error.response?.data?.message ||
            "Failed to add tag"
        );
      }

      await fetchTags();
    } finally {
      setAdding(false);
    }
  };

  const openDeleteConfirmation = (tag) => {
    setDeleteTag(tag);
  };

  const closeDeleteConfirmation = () => {
    if (deleting) {
      return;
    }

    setDeleteTag(null);
  };

  const handleDeleteTag = async () => {
    if (!deleteTag) {
      return;
    }

    try {
      setDeleting(true);

      await api.delete(
        `/tags/${deleteTag._id}`
      );

      setTags((prev) =>
        prev.filter(
          (tag) =>
            tag._id !== deleteTag._id
        )
      );

      toast.success(
        "Tag deleted successfully"
      );

      setDeleteTag(null);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete tag"
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleToggleStatus = async (tag) => {
    try {
      setStatusUpdating(tag._id);

      const response = await api.patch(
        `/tags/${tag._id}/status`
      );

      setTags((prev) =>
        prev.map((item) =>
          item._id === tag._id
            ? response.data.tag
            : item
        )
      );

      toast.success(
        response.data?.message ||
          "Tag status updated successfully"
      );
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to update tag status"
      );
    } finally {
      setStatusUpdating(null);
    }
  };

  return (
    <>
      <div className="admin-tags-page">
        <div className="admin-tags-container">
          <div className="admin-tags-header">
            <div className="admin-tags-heading">
              <div className="admin-tags-title-icon">
                <Tag size={24} />
              </div>

              <div>
                <h1>Tags</h1>

                <p>
                  Manage product tags used for
                  related products
                </p>
              </div>
            </div>

            <button
              type="button"
              className="admin-tags-add-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Tag
            </button>
          </div>

          <div className="admin-tags-toolbar">
            <div className="admin-tags-search">
              <Search size={18} />

              <input
                type="text"
                placeholder="Search tags..."
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
              />

              {search && (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                  className="admin-tags-search-clear"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <div className="admin-tags-count">
              {tags.length}{" "}
              {tags.length === 1
                ? "tag"
                : "tags"}
            </div>
          </div>

          <div className="admin-tags-card">
            {loading ? (
              <div className="admin-tags-empty">
                <div className="admin-tags-empty-icon">
                  <Tag size={28} />
                </div>

                <h3>Loading tags...</h3>

                <p>
                  Please wait while tags are
                  being loaded.
                </p>
              </div>
            ) : tags.length === 0 ? (
              <div className="admin-tags-empty">
                <div className="admin-tags-empty-icon">
                  <Tag size={28} />
                </div>

                <h3>No tags found</h3>

                <p>
                  {search
                    ? "Try a different search."
                    : "Create your first product tag."}
                </p>

                {!search && (
                  <button
                    type="button"
                    className="admin-tags-empty-button"
                    onClick={openAddModal}
                  >
                    <Plus size={16} />
                    Add Tag
                  </button>
                )}
              </div>
            ) : (
              <div className="admin-tags-list">
                {tags.map((tag) => (
                  <div
                    className={`admin-tag-row ${
                      !tag.isActive
                        ? "is-inactive"
                        : ""
                    }`}
                    key={tag._id}
                  >
                    <div className="admin-tag-info">
                      <div className="admin-tag-icon">
                        <Tag size={16} />
                      </div>

                      <div>
                        <strong>
                          {tag.name}
                        </strong>

                        <span
                          className={
                            tag.isActive
                              ? "admin-tag-active-text"
                              : "admin-tag-inactive-text"
                          }
                        >
                          {tag.isActive
                            ? "Active"
                            : "Inactive"}
                        </span>
                      </div>
                    </div>

                    <div className="admin-tag-actions">
                      <button
                        type="button"
                        className={`admin-tag-status ${
                          tag.isActive
                            ? "active"
                            : "inactive"
                        }`}
                        onClick={() =>
                          handleToggleStatus(tag)
                        }
                        disabled={
                          statusUpdating ===
                          tag._id
                        }
                        title={
                          tag.isActive
                            ? "Deactivate tag"
                            : "Activate tag"
                        }
                      >
                        <Power size={15} />

                        {statusUpdating ===
                        tag._id
                          ? "Updating..."
                          : tag.isActive
                          ? "Active"
                          : "Inactive"}
                      </button>

                      <button
                        type="button"
                        className="admin-tag-delete"
                        onClick={() =>
                          openDeleteConfirmation(
                            tag
                          )
                        }
                        title="Delete tag"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showAddForm && (
        <div
          className="admin-tags-modal-overlay"
          onClick={closeAddModal}
        >
          <div
            className="admin-tags-add-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-tags-add-modal-header">
              <div>
                <h2>Add Tag</h2>

                <p>
                  Create a new product tag
                </p>
              </div>

              <button
                type="button"
                className="admin-tags-modal-close"
                onClick={closeAddModal}
                disabled={adding}
              >
                <X size={22} />
              </button>
            </div>

            <div className="admin-tags-modal-body">
              <form onSubmit={handleAddTag}>
                <div className="admin-tags-input-group">
                  <label>
                    Tag Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    value={tagName}
                    onChange={(event) =>
                      setTagName(
                        event.target.value
                      )
                    }
                    placeholder="Enter tag name"
                    maxLength={50}
                    autoFocus
                  />

                  <small>
                    Examples: iPhone, Apple,
                    Smartphone, 5G, Gaming
                  </small>
                </div>

                <div className="admin-tags-modal-actions">
                  <button
                    type="button"
                    className="admin-tags-modal-cancel"
                    onClick={closeAddModal}
                    disabled={adding}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-tags-modal-submit"
                    disabled={adding}
                  >
                    {adding
                      ? "Adding..."
                      : "Add Tag"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {deleteTag && (
        <div
          className="admin-tags-delete-overlay"
          onClick={closeDeleteConfirmation}
        >
          <div
            className="admin-tags-delete-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="admin-tags-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2>Delete Tag?</h2>

            <p>
              Are you sure you want to delete{" "}
              <strong>
                {deleteTag.name}
              </strong>
              ? This action cannot be undone.
            </p>

            <div className="admin-tags-delete-actions">
              <button
                type="button"
                className="admin-tags-delete-cancel"
                onClick={
                  closeDeleteConfirmation
                }
                disabled={deleting}
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-tags-delete-confirm"
                onClick={handleDeleteTag}
                disabled={deleting}
              >
                {deleting
                  ? "Deleting..."
                  : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminTags;