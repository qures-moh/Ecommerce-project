import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  List,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const AdminAttributeValues = () => {
  const [attributes, setAttributes] = useState([]);
  const [selectedAttribute, setSelectedAttribute] = useState("");
  const [values, setValues] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingValue, setEditingValue] = useState(null);
  const [valueName, setValueName] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchAttributes = async () => {
    try {
      setLoadingAttributes(true);

      const response = await api.get("/attributes");

      const data = response.data.attributes || [];

      setAttributes(data);

      if (data.length > 0) {
        setSelectedAttribute((prev) => prev || data[0]._id);
      } else {
        setSelectedAttribute("");
        setValues([]);
      }
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to fetch attributes"
      );
    } finally {
      setLoadingAttributes(false);
    }
  };

  const fetchValues = async (attributeId) => {
    if (!attributeId) {
      setValues([]);
      return;
    }

    try {
      const selected = attributes.find(
        (attribute) => attribute._id === attributeId
      );

      const activeValues = (selected?.values || []).filter(
        (item) => item.isActive
      );

      setValues(activeValues);
    } catch (error) {
      console.log(error);
      setValues([]);
    }
  };

  useEffect(() => {
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (selectedAttribute && attributes.length > 0) {
      fetchValues(selectedAttribute);
    }
  }, [selectedAttribute, attributes]);

  const openAddModal = () => {
    if (!selectedAttribute) {
      toast.error("Please select an attribute first");
      return;
    }

    setEditingValue(null);
    setValueName("");
    setShowModal(true);
  };

  const openEditModal = (value) => {
    setEditingValue(value);
    setValueName(value.value || "");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;

    setShowModal(false);
    setEditingValue(null);
    setValueName("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!valueName.trim()) {
      toast.error("Value is required");
      return;
    }

    if (!selectedAttribute) {
      toast.error("Please select an attribute");
      return;
    }

    try {
      setSaving(true);

      if (editingValue) {
        await api.put(
          `/attributes/${selectedAttribute}/values/${editingValue._id}`,
          {
            value: valueName.trim(),
          }
        );

        toast.success("Attribute value updated successfully");
      } else {
        await api.post(`/attributes/${selectedAttribute}/values`, {
          value: valueName.trim(),
        });

        toast.success("Attribute value added successfully");
      }

      await fetchAttributes();

      setShowModal(false);
      setEditingValue(null);
      setValueName("");
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to save attribute value"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (valueId) => {
    if (!selectedAttribute) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this value?"
    );

    if (!confirmed) return;

    try {
      await api.delete(
        `/attributes/${selectedAttribute}/values/${valueId}`
      );

      toast.success("Attribute value deleted successfully");

      await fetchAttributes();
    } catch (error) {
      console.log(error);

      toast.error(
        error.response?.data?.message || "Failed to delete attribute value"
      );
    }
  };

  const filteredValues = values.filter((item) =>
    item.value?.toLowerCase().includes(search.toLowerCase())
  );

  const currentAttribute = attributes.find(
    (attribute) => attribute._id === selectedAttribute
  );

  return (
    <div className="attribute-values-page">
      <div className="attribute-values-header">
        <div>
          <h1>Attribute Values</h1>
          <p>Add and manage values for your product attributes</p>
        </div>

        <button
          className="attribute-values-add-button"
          onClick={openAddModal}
        >
          <Plus size={19} />
          Add Value
        </button>
      </div>

      <div className="attribute-values-selection-card">
        <div className="attribute-values-selection-content">
          <div className="attribute-values-selection-icon">
            <List size={23} />
          </div>

          <div>
            <h3>Select Attribute</h3>
            <p>Choose an attribute to manage its values</p>
          </div>
        </div>

        <div className="attribute-values-select-wrapper">
          <select
            value={selectedAttribute}
            onChange={(e) => setSelectedAttribute(e.target.value)}
            disabled={loadingAttributes}
          >
            {loadingAttributes ? (
              <option value="">Loading attributes...</option>
            ) : attributes.length === 0 ? (
              <option value="">No attributes available</option>
            ) : (
              attributes.map((attribute) => (
                <option key={attribute._id} value={attribute._id}>
                  {attribute.name}
                </option>
              ))
            )}
          </select>

          <ChevronDown size={18} />
        </div>
      </div>

      <div className="attribute-values-toolbar">
        <div className="attribute-values-title">
          <div>
            <h2>{currentAttribute?.name || "Values"}</h2>
            <span>{filteredValues.length} values</span>
          </div>
        </div>

        <div className="attribute-values-search">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search values..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="attribute-values-card">
        {loadingAttributes ? (
          <div className="attribute-values-loading">
            Loading attributes...
          </div>
        ) : filteredValues.length === 0 ? (
          <div className="attribute-values-empty">
            <div className="attribute-values-empty-icon">
              <List size={30} />
            </div>

            <h3>No values found</h3>

            <p>
              Add values for{" "}
              <strong>{currentAttribute?.name || "this attribute"}</strong>.
            </p>

            <button
              onClick={openAddModal}
              className="attribute-values-empty-button"
            >
              <Plus size={18} />
              Add Value
            </button>
          </div>
        ) : (
          <div className="attribute-values-list">
            {filteredValues.map((item) => (
              <div className="attribute-value-row" key={item._id}>
                <div className="attribute-value-left">
                  <div className="attribute-value-dot"></div>

                  <div>
                    <strong>{item.value}</strong>
                    <span>{currentAttribute?.name}</span>
                  </div>
                </div>

                <div className="attribute-value-actions">
                  <button
                    className="attribute-value-edit"
                    onClick={() => openEditModal(item)}
                  >
                    <Edit size={17} />
                  </button>

                  <button
                    className="attribute-value-delete"
                    onClick={() => handleDelete(item._id)}
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="attribute-values-modal-overlay">
          <div className="attribute-values-modal">
            <div className="attribute-values-modal-header">
              <div>
                <h2>
                  {editingValue ? "Edit Value" : "Add Attribute Value"}
                </h2>

                <p>
                  Attribute:{" "}
                  <strong>{currentAttribute?.name}</strong>
                </p>
              </div>

              <button
                className="attribute-values-modal-close"
                onClick={closeModal}
                type="button"
              >
                <X size={21} />
              </button>
            </div>

            <form
              className="attribute-values-form"
              onSubmit={handleSubmit}
            >
              <div className="attribute-values-form-group">
                <label>Attribute</label>

                <select
                  value={selectedAttribute}
                  onChange={(e) =>
                    setSelectedAttribute(e.target.value)
                  }
                  disabled={!!editingValue}
                >
                  {attributes.map((attribute) => (
                    <option
                      key={attribute._id}
                      value={attribute._id}
                    >
                      {attribute.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="attribute-values-form-group">
                <label>
                  Value <span>*</span>
                </label>

                <input
                  type="text"
                  placeholder="Enter value e.g. Black"
                  value={valueName}
                  onChange={(e) => setValueName(e.target.value)}
                  autoFocus
                />

                <small>
                  Examples: Black, White, 128GB, 256GB, 8GB, 12GB
                </small>
              </div>

              <div className="attribute-values-modal-actions">
                <button
                  type="button"
                  className="attribute-values-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="attribute-values-save"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingValue
                      ? "Update Value"
                      : "Add Value"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAttributeValues;