import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const AddCategory = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImage(null);
    setPreview("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Category name is required");
      return;
    }

    if (!image) {
      toast.error("Category image is required");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name.trim());
      formData.append("description", description.trim());
      formData.append("image", image);

      await api.post("/categories", formData);

      toast.success("Category added successfully");

      navigate("/admin/categories");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to add category"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() => navigate("/admin/categories")}
        >
          <ArrowLeft size={18} />
          Back to Categories
        </button>

        <h1>Add Category</h1>
        <p>Create a new product category</p>
      </div>

      <div className="admin-form-card">
        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="category-name">
              Category Name
            </label>

            <input
              id="category-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter category name"
              maxLength={100}
            />
          </div>

          <div className="admin-form-group">
            <label htmlFor="category-description">
              Description
            </label>

            <textarea
              id="category-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter category description"
              rows={5}
              maxLength={500}
            />
          </div>

          <div className="admin-form-group">
            <label>Category Image</label>

            {!preview ? (
              <label className="category-image-upload">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleImageChange}
                  hidden
                />

                <ImagePlus size={34} />

                <span>Select Image</span>

                <small>
                  JPG, JPEG, PNG or WEBP · Maximum 5MB
                </small>
              </label>
            ) : (
              <div className="category-image-preview">
                <img
                  src={preview}
                  alt="Category preview"
                />

                <button
                  type="button"
                  className="category-remove-image"
                  onClick={removeImage}
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-cancel-btn"
              onClick={() => navigate("/admin/categories")}
              disabled={loading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="admin-submit-btn"
              disabled={loading}
            >
              {loading ? "Adding..." : "Add Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCategory;