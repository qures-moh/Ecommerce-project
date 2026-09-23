import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
  Edit3,
  Trash2,
  X,
  Tag,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";


const AdminAttributes = () => {
  const navigate = useNavigate();

  const [attributes, setAttributes] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedAttribute, setSelectedAttribute] = useState(null);

  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAttributes = async () => {
    try {
      setLoading(true);

      const response = await api.get("/attributes", {
        params: {
          search,
        },
      });

      setAttributes(response.data.attributes || []);
    } catch (error) {
      console.log("FETCH ATTRIBUTES ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch attributes"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchAttributes();
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  const openAddModal = () => {
    setEditMode(false);
    setSelectedAttribute(null);
    setName("");
    setModalOpen(true);
  };

  const openEditModal = (attribute) => {
    setEditMode(true);
    setSelectedAttribute(attribute);
    setName(attribute.name);
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditMode(false);
    setSelectedAttribute(null);
    setName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Attribute name is required");
      return;
    }

    try {
      setSaving(true);

      if (editMode && selectedAttribute) {
        await api.put(
          `/attributes/${selectedAttribute._id}`,
          {
            name: name.trim(),
          }
        );

        toast.success("Attribute updated successfully");
      } else {
        await api.post("/attributes", {
          name: name.trim(),
        });

        toast.success("Attribute created successfully");
      }

      closeModal();
      fetchAttributes();
    } catch (error) {
      console.log("SAVE ATTRIBUTE ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to save attribute"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (attribute) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${attribute.name}"?`
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/attributes/${attribute._id}`
      );

      toast.success("Attribute deleted successfully");

      fetchAttributes();
    } catch (error) {
      console.log("DELETE ATTRIBUTE ERROR:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to delete attribute"
      );
    }
  };

  const openValues = (attribute) => {
    navigate(
      `/admin/attributes/${attribute._id}/values`,
      {
        state: {
          attribute,
        },
      }
    );
  };

  return (
    <div className="attributes-page">
      <div className="attributes-header">
        <div>
          <h1>Attributes</h1>

          <p>
            Create and manage product attributes
          </p>
        </div>

        <button
          className="attributes-add-button"
          onClick={openAddModal}
        >
          <Plus size={18} />
          Add Attribute
        </button>
      </div>

      <div className="attributes-toolbar">
        <div className="attributes-search">
          <Search size={19} />

          <input
            type="text"
            placeholder="Search attributes..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          {search && (
            <button
              className="attributes-search-clear"
              onClick={() => setSearch("")}
            >
              <X size={16} />
            </button>
          )}
        </div>

        <div className="attributes-total">
          <SlidersHorizontal size={18} />

          <span>
            {attributes.length}{" "}
            {attributes.length === 1
              ? "Attribute"
              : "Attributes"}
          </span>
        </div>
      </div>

      <div className="attributes-content">
        {loading ? (
          <div className="attributes-loading">
            <div className="attributes-spinner"></div>
            <p>Loading attributes...</p>
          </div>
        ) : attributes.length === 0 ? (
          <div className="attributes-empty">
            <div className="attributes-empty-icon">
              <SlidersHorizontal size={32} />
            </div>

            <h2>No attributes found</h2>

            <p>
              Create your first product attribute
              such as Color, Size or Storage.
            </p>

            <button
              className="attributes-empty-button"
              onClick={openAddModal}
            >
              <Plus size={18} />
              Add Attribute
            </button>
          </div>
        ) : (
          <div className="attributes-list">
            {attributes.map((attribute) => {
              const activeValues =
                attribute.values?.filter(
                  (item) => item.isActive !== false
                ) || [];

              return (
                <div
                  className="attribute-card"
                  key={attribute._id}
                >
                  <div className="attribute-card-left">
                    <div className="attribute-icon">
                      <Tag size={22} />
                    </div>

                    <div className="attribute-info">
                      <h3>{attribute.name}</h3>

                      <p>
                        {activeValues.length}{" "}
                        {activeValues.length === 1
                          ? "value"
                          : "values"}
                      </p>

                      <div className="attribute-value-preview">
                        {activeValues
                          .slice(0, 5)
                          .map((item) => (
                            <span
                              key={item._id}
                              className="attribute-value-chip"
                            >
                              {item.value}
                            </span>
                          ))}

                        {activeValues.length > 5 && (
                          <span className="attribute-more">
                            +{activeValues.length - 5}
                          </span>
                        )}

                        {activeValues.length === 0 && (
                          <span className="attribute-no-values">
                            No values added
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="attribute-card-actions">
                    <button
                      className="attribute-values-button"
                      onClick={() =>
                        openValues(attribute)
                      }
                    >
                      Manage Values
                      <ChevronRight size={17} />
                    </button>

                    <button
                      className="attribute-edit-button"
                      onClick={() =>
                        openEditModal(attribute)
                      }
                      title="Edit Attribute"
                    >
                      <Edit3 size={17} />
                    </button>

                    <button
                      className="attribute-delete-button"
                      onClick={() =>
                        handleDelete(attribute)
                      }
                      title="Delete Attribute"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="attribute-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="attribute-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="attribute-modal-header">
              <div>
                <h2>
                  {editMode
                    ? "Edit Attribute"
                    : "Add Attribute"}
                </h2>

                <p>
                  {editMode
                    ? "Update your product attribute"
                    : "Create a new product attribute"}
                </p>
              </div>

              <button
                className="attribute-modal-close"
                onClick={closeModal}
              >
                <X size={22} />
              </button>
            </div>

            <form
              className="attribute-modal-form"
              onSubmit={handleSubmit}
            >
              <div className="attribute-form-group">
                <label>
                  Attribute Name
                  <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter attribute name"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  autoFocus
                />

                <small>
                  Examples: Color, Size, RAM,
                  Storage, Material
                </small>
              </div>

              <div className="attribute-modal-actions">
                <button
                  type="button"
                  className="attribute-cancel-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attribute-submit-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editMode
                    ? "Update Attribute"
                    : "Add Attribute"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttributes;