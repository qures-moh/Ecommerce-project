import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  X,
  Upload,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const AdminSubcategories = () => {
  const [subcategories, setSubcategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewSubcategory, setViewSubcategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [imagePreview, setImagePreview] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    description: "",
    image: null,
  });

  const [errors, setErrors] = useState({
    name: "",
    category: "",
    description: "",
    image: "",
  });

  const fetchSubcategories = async () => {
    try {
      setFetchLoading(true);

      const response = await api.get("/subcategories");

      setSubcategories(response.data.subcategories || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch subcategories"
      );
    } finally {
      setFetchLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      setCategories(response.data.categories || []);
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch categories"
      );
    }
  };

  useEffect(() => {
    fetchSubcategories();
    fetchCategories();
  }, []);

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `http://localhost:3000/${cleanImage}`;
  };

  const validateName = (value) => {
    const trimmedValue = value.trim();

    if (!trimmedValue) {
      return "Subcategory name is required";
    }

    if (trimmedValue.length < 2) {
      return "Subcategory name must be at least 2 characters";
    }

    if (trimmedValue.length > 50) {
      return "Subcategory name must be less than 50 characters";
    }

    return "";
  };

  const validateDescription = (value) => {
    if (value.trim().length > 500) {
      return "Description must be less than 500 characters";
    }

    return "";
  };

  const validateImage = (file) => {
    if (!file) {
      return "Subcategory image is required";
    }

    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return "Only JPG, JPEG, PNG or WEBP images are allowed";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Image size must be less than 5MB";
    }

    return "";
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "image") {
      const file = files?.[0];

      if (!file) {
        setFormData((prev) => ({
          ...prev,
          image: null,
        }));

        setImagePreview("");

        setErrors((prev) => ({
          ...prev,
          image: editingId
            ? ""
            : "Subcategory image is required",
        }));

        return;
      }

      const imageError = validateImage(file);

      if (imageError) {
        setFormData((prev) => ({
          ...prev,
          image: null,
        }));

        setImagePreview("");

        setErrors((prev) => ({
          ...prev,
          image: imageError,
        }));

        return;
      }

      setFormData((prev) => ({
        ...prev,
        image: file,
      }));

      setImagePreview(URL.createObjectURL(file));

      setErrors((prev) => ({
        ...prev,
        image: "",
      }));

      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "name") {
      setErrors((prev) => ({
        ...prev,
        name: validateName(value),
      }));
    }

    if (name === "category") {
      setErrors((prev) => ({
        ...prev,
        category: value
          ? ""
          : "Please select a category",
      }));
    }

    if (name === "description") {
      setErrors((prev) => ({
        ...prev,
        description: validateDescription(value),
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "",
      description: "",
      image: null,
    });

    setErrors({
      name: "",
      category: "",
      description: "",
      image: "",
    });

    setImagePreview("");
    setEditingId(null);
  };

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  const removeSelectedImage = () => {
    setFormData((prev) => ({
      ...prev,
      image: null,
    }));

    setImagePreview("");

    setErrors((prev) => ({
      ...prev,
      image: editingId
        ? ""
        : "Subcategory image is required",
    }));
  };

  const validateForm = () => {
    const nameError = validateName(formData.name);

    const categoryError = formData.category
      ? ""
      : "Please select a category";

    const descriptionError = validateDescription(
      formData.description
    );

    let imageError = "";

    if (!editingId) {
      imageError = validateImage(formData.image);
    } else if (formData.image) {
      imageError = validateImage(formData.image);
    }

    const newErrors = {
      name: nameError,
      category: categoryError,
      description: descriptionError,
      image: imageError,
    };

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) => error
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("name", formData.name.trim());
      data.append("category", formData.category);
      data.append(
        "description",
        formData.description.trim()
      );

      if (formData.image) {
        data.append("image", formData.image);
      }

      if (editingId) {
        await api.patch(
          `/subcategories/${editingId}`,
          data
        );

        toast.success(
          "Subcategory updated successfully"
        );
      } else {
        await api.post("/subcategories", data);

        toast.success(
          "Subcategory added successfully"
        );
      }

      closeModal();
      fetchSubcategories();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (subcategory) => {
    setEditingId(subcategory._id);

    const categoryId =
      subcategory.category?._id ||
      subcategory.category ||
      "";

    setFormData({
      name: subcategory.name || "",
      category: categoryId,
      description: subcategory.description || "",
      image: null,
    });

    setErrors({
      name: "",
      category: "",
      description: "",
      image: "",
    });

    setImagePreview(
      subcategory.image
        ? getImageUrl(subcategory.image)
        : ""
    );

    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to deactivate this subcategory?"
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await api.delete(`/subcategories/${id}`);

      toast.success(
        "Subcategory deleted successfully"
      );

      fetchSubcategories();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete subcategory"
      );
    }
  };

  const handleView = (subcategory) => {
    setViewSubcategory(subcategory);
  };

  return (
    <div className="admin-subcategories-page">
      <div className="admin-subcategories-header">
        <div>
          <h1>Subcategories</h1>
          <p>Manage your product subcategories</p>
        </div>

        <button
          className="subcategory-add-button"
          onClick={openAddModal}
          type="button"
        >
          <Plus size={18} />
          Add Subcategory
        </button>
      </div>

      <div className="subcategory-table-card">
        <div className="subcategory-table-wrapper">
          <table className="subcategory-table">
            <thead>
              <tr>
                <th>SUBCATEGORY</th>
                <th>CATEGORY</th>
                <th>DESCRIPTION</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>

            <tbody>
              {fetchLoading ? (
                <tr>
                  <td
                    colSpan="5"
                    className="subcategory-empty"
                  >
                    Loading subcategories...
                  </td>
                </tr>
              ) : subcategories.length > 0 ? (
                subcategories.map((subcategory) => (
                  <tr key={subcategory._id}>
                    <td>
                      <div className="subcategory-product-info">
                        <div className="subcategory-image-box">
                          {subcategory.image ? (
                            <img
                              src={getImageUrl(
                                subcategory.image
                              )}
                              alt={subcategory.name}
                              onError={(e) => {
                                e.currentTarget.style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <span>
                              {subcategory.name
                                ?.charAt(0)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>

                        <strong>
                          {subcategory.name}
                        </strong>
                      </div>
                    </td>

                    <td>
                      <span className="subcategory-category">
                        {subcategory.category?.name ||
                          "Unknown"}
                      </span>
                    </td>

                    <td>
                      <span className="subcategory-description">
                        {subcategory.description ||
                          "No description"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`subcategory-status ${
                          subcategory.isActive
                            ? "active"
                            : "inactive"
                        }`}
                      >
                        {subcategory.isActive
                          ? "Active"
                          : "Inactive"}
                      </span>
                    </td>

                    <td>
                      <div className="subcategory-actions">
                        <button
                          type="button"
                          className="subcategory-view"
                          onClick={() =>
                            handleView(subcategory)
                          }
                          title="View"
                        >
                          <Eye size={17} />
                        </button>

                        <button
                          type="button"
                          className="subcategory-edit"
                          onClick={() =>
                            handleEdit(subcategory)
                          }
                          title="Edit"
                        >
                          <Edit size={17} />
                        </button>

                        <button
                          type="button"
                          className="subcategory-delete"
                          onClick={() =>
                            handleDelete(
                              subcategory._id
                            )
                          }
                          title="Delete"
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="subcategory-empty"
                  >
                    No subcategories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="subcategory-modal-overlay">
          <div className="subcategory-modal">
            <div className="subcategory-modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Subcategory"
                    : "Add Subcategory"}
                </h2>

                <p>
                  {editingId
                    ? "Update subcategory details"
                    : "Create a new product subcategory"}
                </p>
              </div>

              <button
                type="button"
                className="subcategory-close-button"
                onClick={closeModal}
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="subcategory-form"
              onSubmit={handleSubmit}
            >
              <div className="subcategory-form-group">
                <label>
                  Category <span>*</span>
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={
                    errors.category
                      ? "subcategory-input-error"
                      : ""
                  }
                >
                  <option value="">
                    Select Category
                  </option>

                  {categories
                    .filter(
                      (category) => category.isActive
                    )
                    .map((category) => (
                      <option
                        key={category._id}
                        value={category._id}
                      >
                        {category.name}
                      </option>
                    ))}
                </select>

                {errors.category && (
                  <p className="subcategory-error">
                    {errors.category}
                  </p>
                )}
              </div>

              <div className="subcategory-form-group">
                <label>
                  Subcategory Name <span>*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter subcategory name"
                  value={formData.name}
                  onChange={handleChange}
                  className={
                    errors.name
                      ? "subcategory-input-error"
                      : ""
                  }
                />

                {errors.name && (
                  <p className="subcategory-error">
                    {errors.name}
                  </p>
                )}
              </div>

              <div className="subcategory-form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  placeholder="Enter subcategory description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className={
                    errors.description
                      ? "subcategory-input-error"
                      : ""
                  }
                />

                <div className="subcategory-description-footer">
                  <span>
                    {errors.description ||
                      "Maximum 500 characters"}
                  </span>

                  <span>
                    {formData.description.length}/500
                  </span>
                </div>
              </div>

              <div className="subcategory-form-group">
                <label>
                  Image <span>*</span>
                </label>

                <div
                  className={`subcategory-upload-box ${
                    imagePreview
                      ? "has-image"
                      : ""
                  } ${
                    errors.image
                      ? "upload-error"
                      : ""
                  }`}
                  onClick={() => {
                    document
                      .getElementById(
                        "subcategory-image-input"
                      )
                      ?.click();
                  }}
                >
                  <input
                    id="subcategory-image-input"
                    type="file"
                    name="image"
                    accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                    onChange={handleChange}
                    hidden
                  />

                  {imagePreview ? (
                    <div className="subcategory-upload-preview">
                      <img
                        src={imagePreview}
                        alt="Subcategory preview"
                      />

                      <button
                        type="button"
                        className="subcategory-remove-image"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeSelectedImage();
                        }}
                      >
                        <X size={17} />
                      </button>

                      {formData.image && (
                        <div className="subcategory-upload-file-name">
                          {formData.image.name}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="subcategory-upload-content">
                      <div className="subcategory-upload-icon">
                        <Upload size={27} />
                      </div>

                      <h3>
                        Upload Subcategory Image
                      </h3>

                      <p>
                        Click to select an image from
                        your computer
                      </p>

                      <span>
                        JPG, JPEG, PNG or WEBP · Maximum
                        5MB
                      </span>
                    </div>
                  )}
                </div>

                {errors.image && (
                  <p className="subcategory-error">
                    {errors.image}
                  </p>
                )}
              </div>

              <div className="subcategory-modal-actions">
                <button
                  type="button"
                  className="subcategory-cancel-button"
                  onClick={closeModal}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="subcategory-submit-button"
                  disabled={loading}
                >
                  {loading
                    ? editingId
                      ? "Updating..."
                      : "Adding..."
                    : editingId
                    ? "Update Subcategory"
                    : "Add Subcategory"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewSubcategory && (
        <div className="subcategory-modal-overlay">
          <div className="subcategory-view-modal">
            <div className="subcategory-modal-header">
              <div>
                <h2>Subcategory Details</h2>
                <p>View subcategory information</p>
              </div>

              <button
                type="button"
                className="subcategory-close-button"
                onClick={() =>
                  setViewSubcategory(null)
                }
              >
                <X size={21} />
              </button>
            </div>

            <div className="subcategory-view-content">
              <div className="subcategory-view-image">
                {viewSubcategory.image ? (
                  <img
                    src={getImageUrl(
                      viewSubcategory.image
                    )}
                    alt={viewSubcategory.name}
                    onError={(e) => {
                      e.currentTarget.style.display =
                        "none";
                    }}
                  />
                ) : (
                  <span>
                    {viewSubcategory.name
                      ?.charAt(0)
                      .toUpperCase()}
                  </span>
                )}
              </div>

              <div className="subcategory-view-info">
                <div>
                  <label>Subcategory</label>
                  <p>
                    {viewSubcategory.name}
                  </p>
                </div>

                <div>
                  <label>Category</label>
                  <p>
                    {viewSubcategory.category?.name ||
                      "Unknown"}
                  </p>
                </div>

                <div>
                  <label>Description</label>
                  <p>
                    {viewSubcategory.description ||
                      "No description"}
                  </p>
                </div>

                <div>
                  <label>Status</label>
                  <p>
                    {viewSubcategory.isActive
                      ? "Active"
                      : "Inactive"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubcategories;