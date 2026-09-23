import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ImagePlus,
  Trash2,
  X,
  Package,
  Check,
  RefreshCw,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const MIN_VARIANTS = 1;

const createEmptyVariant = () => ({
  attributes: {},
  price: "",
  discountType: "",
  discountValue: "",
  stock: "",
  images: [],
});

const getAttributeName = (attribute) => {
  if (!attribute) return "";

  if (typeof attribute === "string") {
    return attribute;
  }

  return attribute.name || attribute.attributeName || attribute.title || "";
};

const getAttributeValues = (attribute) => {
  if (!attribute) return [];

  const values =
    attribute.values || attribute.options || attribute.attributeValues || [];

  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item) => {
      if (typeof item === "string") {
        return {
          id: item,
          value: item,
          isActive: true,
        };
      }

      return {
        id: item._id || item.id || item.value,
        value: item.value || item.name || item.label || "",
        isActive: item.isActive !== false,
      };
    })
    .filter((item) => item.value && item.isActive !== false);
};

const getVariantKey = (attributes) => {
  return Object.entries(attributes)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(
      ([key, value]) =>
        `${key.trim().toLowerCase()}=${String(value).trim().toLowerCase()}`,
    )
    .join("|");
};

const createCombinations = (selectedAttributes) => {
  if (!selectedAttributes.length) {
    return [];
  }

  const combinations = [];

  const generate = (index, current) => {
    if (index === selectedAttributes.length) {
      combinations.push({
        ...current,
      });
      return;
    }

    const attribute = selectedAttributes[index];

    for (const value of attribute.values) {
      generate(index + 1, {
        ...current,
        [attribute.name]: value,
      });
    }
  };

  generate(0, {});

  return combinations;
};

const AddProduct = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [subcategory, setSubcategory] = useState("");
  const [description, setDescription] = useState("");

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [attributes, setAttributes] = useState([]);

  const [selectedAttributes, setSelectedAttributes] = useState([]);

  const [variants, setVariants] = useState([]);

  const [loading, setLoading] = useState(false);

  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [subcategoriesLoading, setSubcategoriesLoading] = useState(false);

  const [attributesLoading, setAttributesLoading] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchAttributes();
  }, []);

  useEffect(() => {
    if (category) {
      fetchSubcategories(category);
    } else {
      setSubcategories([]);
      setSubcategory("");
    }
  }, [category]);

  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);

      const response = await api.get("/categories");

      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (Array.isArray(response.data?.categories)) {
        setCategories(response.data.categories);
      } else {
        setCategories([]);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch categories",
      );
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      setSubcategoriesLoading(true);

      const response = await api.get(`/subcategories/category/${categoryId}`);

      if (Array.isArray(response.data)) {
        setSubcategories(response.data);
      } else if (Array.isArray(response.data?.subcategories)) {
        setSubcategories(response.data.subcategories);
      } else {
        setSubcategories([]);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to fetch subcategories",
      );

      setSubcategories([]);
    } finally {
      setSubcategoriesLoading(false);
    }
  };

  const fetchAttributes = async () => {
    try {
      setAttributesLoading(true);

      const response = await api.get("/attributes");

      let data = [];

      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (Array.isArray(response.data?.attributes)) {
        data = response.data.attributes;
      }

      const formatted = data
        .map((attribute) => {
          const name = getAttributeName(attribute);

          const values = getAttributeValues(attribute);

          return {
            ...attribute,
            name,
            values,
          };
        })
        .filter((attribute) => attribute.name && attribute.values.length > 0);

      setAttributes(formatted);
    } catch (error) {
      console.error("FETCH ATTRIBUTES ERROR:", error);

      toast.error(
        error.response?.data?.message || "Failed to fetch attributes",
      );

      setAttributes([]);
    } finally {
      setAttributesLoading(false);
    }
  };

  const isAttributeSelected = (attributeName) => {
    return selectedAttributes.some((item) => item.name === attributeName);
  };

  const getSelectedAttribute = (attributeName) => {
    return selectedAttributes.find((item) => item.name === attributeName);
  };

  const addAttribute = (attribute) => {
    const name = getAttributeName(attribute);

    if (!name) return;

    setSelectedAttributes((previous) => {
      if (previous.some((item) => item.name === name)) {
        return previous;
      }

      return [
        ...previous,
        {
          name,
          values: [],
        },
      ];
    });
  };

  const removeAttribute = (attributeName) => {
    setSelectedAttributes((previous) =>
      previous.filter((item) => item.name !== attributeName),
    );
  };

  const toggleAttributeValue = (attributeName, value) => {
    setSelectedAttributes((previous) =>
      previous.map((item) => {
        if (item.name !== attributeName) {
          return item;
        }

        const exists = item.values.includes(value);

        return {
          ...item,
          values: exists
            ? item.values.filter((itemValue) => itemValue !== value)
            : [...item.values, value],
        };
      }),
    );
  };

  const selectedAttributesWithValues = useMemo(() => {
    return selectedAttributes.filter((item) => item.values.length > 0);
  }, [selectedAttributes]);

  const totalPossibleVariants = useMemo(() => {
    if (selectedAttributesWithValues.length === 0) {
      return 0;
    }

    return selectedAttributesWithValues.reduce(
      (total, item) => total * item.values.length,
      1,
    );
  }, [selectedAttributesWithValues]);

  const preserveVariantData = (generatedAttributes, previousVariants) => {
    const generatedKey = getVariantKey(generatedAttributes);

    const existing = previousVariants.find(
      (variant) => getVariantKey(variant.attributes) === generatedKey,
    );

    if (!existing) {
      return {
        attributes: generatedAttributes,
        price: "",
        discountType: "",
        discountValue: "",
        stock: "",
        images: [],
        selected: true,
      };
    }

    return {
      attributes: generatedAttributes,
      price: existing.price,
      discountType: existing.discountType,
      discountValue: existing.discountValue,
      stock: existing.stock,
      images: existing.images,
      selected: existing.selected !== false,
    };
  };

  const generateVariants = () => {
    if (selectedAttributes.length === 0) {
      toast.error("Please select at least one attribute");
      return;
    }

    const invalidAttribute = selectedAttributes.find(
      (item) => item.values.length === 0,
    );

    if (invalidAttribute) {
      toast.error(`Select at least one value for ${invalidAttribute.name}`);
      return;
    }

    const combinations = createCombinations(selectedAttributesWithValues);

    if (!combinations.length) {
      toast.error("Unable to generate variants");
      return;
    }

    if (combinations.length < MIN_VARIANTS) {
      toast.error(
        `Select enough attribute values to generate at least ${MIN_VARIANTS} variants`,
      );
      return;
    }

    if (combinations.length > 200) {
      toast.error("Maximum 200 variants can be generated at once");
      return;
    }

    setVariants((previousVariants) =>
      combinations.map((attributes) => ({
        ...preserveVariantData(attributes, previousVariants),
        selected: true,
      })),
    );

    toast.success(`${combinations.length} variants generated`);
  };

  const toggleVariantSelection = (variantIndex) => {
    setVariants((previous) =>
      previous.map((variant, index) =>
        index === variantIndex
          ? { ...variant, selected: !variant.selected }
          : variant,
      ),
    );
  };

  const selectedVariants = useMemo(
    () => variants.filter((variant) => variant.selected),
    [variants],
  );

  const handleVariantChange = (variantIndex, field, value) => {
    setVariants((previous) =>
      previous.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        return {
          ...variant,
          [field]: value,
        };
      }),
    );
  };

  const handleImages = (variantIndex, event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setVariants((previousVariants) =>
      previousVariants.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        const remainingSlots = 5 - variant.images.length;

        if (remainingSlots <= 0) {
          toast.error("Maximum 5 images allowed per variant");

          return variant;
        }

        const validFiles = [];

        files.forEach((file) => {
          if (!file.type.startsWith("image/")) {
            toast.error(`${file.name} is not a valid image`);

            return;
          }

          if (file.size > 5 * 1024 * 1024) {
            toast.error(`${file.name} must be less than 5MB`);

            return;
          }

          validFiles.push(file);
        });

        const filesToAdd = validFiles.slice(0, remainingSlots);

        if (validFiles.length > remainingSlots) {
          toast.error("Maximum 5 images allowed per variant");
        }

        const newImages = filesToAdd.map((file) => ({
          file,
          preview: URL.createObjectURL(file),
        }));

        return {
          ...variant,
          images: [...variant.images, ...newImages],
        };
      }),
    );

    event.target.value = "";
  };

  const removeImage = (variantIndex, imageIndex) => {
    setVariants((previousVariants) =>
      previousVariants.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        const image = variant.images[imageIndex];

        if (image?.preview) {
          URL.revokeObjectURL(image.preview);
        }

        return {
          ...variant,
          images: variant.images.filter((_, index) => index !== imageIndex),
        };
      }),
    );
  };

  const validateVariants = () => {
    if (!variants.length) {
      toast.error("Generate variants first");
      return false;
    }

    if (selectedVariants.length < MIN_VARIANTS) {
      toast.error(`Select at least ${MIN_VARIANTS} variants`);
      return false;
    }

    const variantKeys = new Set();

    for (let index = 0; index < selectedVariants.length; index++) {
      const variant = selectedVariants[index];

      const attributeEntries = Object.entries(variant.attributes);

      if (attributeEntries.length === 0) {
        toast.error(`Variant ${index + 1}: No attributes found`);

        return false;
      }

      for (const [attributeName, attributeValue] of attributeEntries) {
        if (!attributeName.trim() || !String(attributeValue).trim()) {
          toast.error(`Variant ${index + 1}: Invalid attribute`);

          return false;
        }
      }

      const key = getVariantKey(variant.attributes);

      if (variantKeys.has(key)) {
        toast.error(`Variant ${index + 1} is duplicated`);

        return false;
      }

      variantKeys.add(key);

      if (
        variant.price === "" ||
        !Number.isFinite(Number(variant.price)) ||
        Number(variant.price) < 0
      ) {
        toast.error(`Variant ${index + 1}: Enter a valid price`);

        return false;
      }

      if (
        variant.stock === "" ||
        !Number.isFinite(Number(variant.stock)) ||
        Number(variant.stock) < 0
      ) {
        toast.error(`Variant ${index + 1}: Enter a valid stock`);

        return false;
      }

      if (variant.discountType) {
        if (
          variant.discountValue === "" ||
          !Number.isFinite(Number(variant.discountValue)) ||
          Number(variant.discountValue) < 0
        ) {
          toast.error(`Variant ${index + 1}: Enter a valid discount`);

          return false;
        }

        if (
          variant.discountType === "percentage" &&
          Number(variant.discountValue) > 100
        ) {
          toast.error(
            `Variant ${index + 1}: Percentage discount cannot exceed 100`,
          );

          return false;
        }

        if (
          variant.discountType === "flat" &&
          Number(variant.discountValue) > Number(variant.price)
        ) {
          toast.error(
            `Variant ${index + 1}: Flat discount cannot exceed price`,
          );

          return false;
        }
      }

      if (variant.images.length === 0) {
        toast.error(`Variant ${index + 1}: At least one image is required`);

        return false;
      }

      if (variant.images.length > 5) {
        toast.error(`Variant ${index + 1}: Maximum 5 images are allowed`);

        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    if (!category) {
      toast.error("Category is required");
      return;
    }

    if (!subcategory) {
      toast.error("Subcategory is required");
      return;
    }

    if (!description.trim()) {
      toast.error("Product description is required");
      return;
    }

    if (!validateVariants()) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("name", name.trim());

      formData.append("category", category);

      formData.append("subcategory", subcategory);

      formData.append("description", description.trim());

      const formattedVariants = selectedVariants.map((variant) => ({
        attributes: variant.attributes,
        price: Number(variant.price),
        discountType: variant.discountType || null,
        discountValue: variant.discountType ? Number(variant.discountValue) : 0,
        stock: Number(variant.stock),
      }));

      formData.append("variants", JSON.stringify(formattedVariants));

      selectedVariants.forEach((variant, variantIndex) => {
        variant.images.forEach((image) => {
          if (image.file) {
            formData.append(`variant_${variantIndex}_images`, image.file);
          }
        });
      });

      await api.post("/products/add", formData);

      toast.success("Product added successfully");

      navigate("/admin/products");
    } catch (error) {
      console.error("ADD PRODUCT ERROR:", error);

      toast.error(error.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const renderSelectedAttribute = (selectedAttribute) => {
    const name = selectedAttribute.name;
    const attribute = attributes.find(
      (item) => getAttributeName(item) === name,
    );

    if (!attribute) return null;

    const values = getAttributeValues(attribute);
    const selectedValues = selectedAttribute.values || [];

    return (
      <div className="product-attribute-card" key={name}>
        <div className="product-attribute-card-header">
          <div className="product-attribute-selected-name">
            <strong>{name}</strong>
            <span>{selectedValues.length} selected</span>
          </div>

          <button
            type="button"
            className="remove-attribute-btn"
            onClick={() => removeAttribute(name)}
          >
            <X size={16} />
          </button>
        </div>

        <div className="product-attribute-values">
          {values.map((item) => {
            const checked = selectedValues.includes(item.value);

            return (
              <label
                className={`product-value-chip ${checked ? "selected" : ""}`}
                key={item.id || item.value}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleAttributeValue(name, item.value)}
                />

                <span className="product-value-check">
                  {checked && <Check size={12} />}
                </span>

                <span>{item.value}</span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="add-product-page">
      <div className="add-product-container">
        <div className="add-product-topbar">
          <div className="add-product-heading-content">
            <div className="add-product-title-icon">
              <Package size={26} />
            </div>

            <div>
              <h1>Add Product</h1>

              <p>Create a product with multiple variants</p>
            </div>
          </div>

          <button
            type="button"
            className="add-product-back-btn"
            onClick={() => navigate("/admin/products")}
          >
            <ArrowLeft size={18} />
            Back to Products
          </button>
        </div>

        <form className="add-product-form" onSubmit={handleSubmit}>
          <section className="product-information">
            <div className="section-header">
              <h2>Product Information</h2>

              <p>Enter the basic information about your product</p>
            </div>

            <div className="product-fields">
              <div className="form-group full-width">
                <label className="form-label">Product Name</label>

                <input
                  className="form-input"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter product name"
                  maxLength={150}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Category</label>

                <select
                  className="form-select"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                >
                  <option value="">
                    {categoriesLoading
                      ? "Loading categories..."
                      : "Select category"}
                  </option>

                  {categories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Subcategory</label>

                <select
                  className="form-select"
                  value={subcategory}
                  onChange={(event) => setSubcategory(event.target.value)}
                  disabled={!category}
                >
                  <option value="">
                    {subcategoriesLoading
                      ? "Loading subcategories..."
                      : "Select subcategory"}
                  </option>

                  {subcategories.map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group full-width">
                <label className="form-label">Description</label>

                <textarea
                  className="form-textarea"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Enter product description"
                  rows={5}
                  maxLength={2000}
                />
              </div>
            </div>
          </section>

          <section className="product-attributes-section">
            <div className="product-attributes-header">
              <div>
                <h2>Product Attributes</h2>

                <p>
                  Select attributes and their values, then generate at least 1
                  variant
                </p>
              </div>

              <button
                type="button"
                className="refresh-attributes-btn"
                onClick={fetchAttributes}
                disabled={attributesLoading}
              >
                <RefreshCw
                  size={16}
                  className={attributesLoading ? "rotate" : ""}
                />
                Refresh
              </button>
            </div>

            {attributesLoading ? (
              <div className="attributes-loading">Loading attributes...</div>
            ) : attributes.length === 0 ? (
              <div className="attributes-empty">
                <Package size={32} />

                <h3>No attributes available</h3>

                <p>Create attributes and values first.</p>
              </div>
            ) : (
              <>
                <div className="attribute-dropdown-wrapper">
                  <label className="form-label">Select Attribute</label>

                  <select
                    className="form-select attribute-dropdown"
                    value=""
                    onChange={(event) => {
                      const selectedName = event.target.value;
                      const selectedAttribute = attributes.find(
                        (item) => getAttributeName(item) === selectedName,
                      );

                      if (selectedAttribute) {
                        addAttribute(selectedAttribute);
                      }
                    }}
                  >
                    <option value="">Select an attribute</option>
                    {attributes.map((attribute) => {
                      const attributeName = getAttributeName(attribute);
                      const alreadySelected =
                        isAttributeSelected(attributeName);

                      return (
                        <option
                          key={attribute._id || attributeName}
                          value={attributeName}
                          disabled={alreadySelected}
                        >
                          {attributeName}
                          {alreadySelected ? " (Selected)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedAttributes.length > 0 ? (
                  <div className="selected-attributes-list">
                    {selectedAttributes.map(renderSelectedAttribute)}
                  </div>
                ) : (
                  <div className="attributes-selection-empty">
                    <Package size={28} />
                    <p>Select one or more attributes to choose their values.</p>
                  </div>
                )}
              </>
            )}

            {selectedAttributes.length > 0 && (
              <div className="selected-attributes-summary">
                <div>
                  <strong>Selected:</strong>

                  <span>{selectedAttributes.length} attributes</span>

                  <span>
                    {selectedAttributes.reduce(
                      (total, item) => total + item.values.length,
                      0,
                    )}{" "}
                    values
                  </span>
                </div>

                <div className="possible-variants">
                  Possible variants:
                  <strong>{totalPossibleVariants}</strong>
                  <span className="minimum-variant-note">Minimum 1</span>
                </div>
              </div>
            )}

            <div className="generate-variants-area">
              <button
                type="button"
                className="generate-variants-btn"
                onClick={generateVariants}
              >
                <RefreshCw size={18} />
                Generate Variants
              </button>
            </div>
          </section>

          <section className="variants-section">
            <div className="variants-main-header">
              <div>
                <h2>Product Variants</h2>

                <p>
                  Add different combinations of attributes, prices, stock and
                  images
                </p>
              </div>

              <div className="variant-summary-count">
                <span className="variant-count">
                  {selectedVariants.length} selected
                </span>
                <span className="variant-total-count">
                  {variants.length} generated
                </span>
              </div>
            </div>

            <div className="variants-list">
              {variants.length === 0 ? (
                <div className="variants-empty-state">
                  <RefreshCw size={32} />
                  <h3>No variants generated yet</h3>
                  <p>
                    Select attribute values above and click Generate Variants.
                  </p>
                </div>
              ) : (
                variants.map((variant, variantIndex) => (
                  <div
                    className={`variant-card ${
                      variant.selected
                        ? "variant-selected"
                        : "variant-unselected"
                    }`}
                    key={getVariantKey(variant.attributes) || variantIndex}
                  >
                    <div className="variant-header">
                      <div className="variant-selection-wrap">
                        <label className="generated-variant-check">
                          <input
                            type="checkbox"
                            checked={Boolean(variant.selected)}
                            onChange={() =>
                              toggleVariantSelection(variantIndex)
                            }
                          />
                          <span className="generated-variant-custom-check">
                            {variant.selected && <Check size={13} />}
                          </span>
                        </label>

                        <div>
                          <h3>Variant {variantIndex + 1}</h3>
                          <p>
                            {variant.selected
                              ? "Selected for this product"
                              : "Not selected for this product"}
                          </p>
                        </div>
                      </div>

                      <span className="variant-selection-status">
                        {variant.selected ? "Selected" : "Not selected"}
                      </span>
                    </div>

                    <div className="generated-variant-attributes">
                      <div className="generated-attributes-title">
                        <h4>Selected Attributes</h4>

                        <span>
                          {Object.keys(variant.attributes).length} attributes
                        </span>
                      </div>

                      <div className="generated-attribute-list">
                        {Object.entries(variant.attributes).map(
                          ([key, value]) => (
                            <div className="generated-attribute-item" key={key}>
                              <span>{key}</span>
                              <strong>{value}</strong>
                            </div>
                          ),
                        )}
                      </div>
                    </div>

                    {variant.selected && (
                      <>
                        <div className="variant-fields">
                          <div className="form-group">
                            <label className="form-label">Price</label>

                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              value={variant.price}
                              onChange={(event) =>
                                handleVariantChange(
                                  variantIndex,
                                  "price",
                                  event.target.value,
                                )
                              }
                              placeholder="999"
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Discount Type</label>

                            <select
                              className="form-select"
                              value={variant.discountType}
                              onChange={(event) =>
                                handleVariantChange(
                                  variantIndex,
                                  "discountType",
                                  event.target.value,
                                )
                              }
                            >
                              <option value="">No Discount</option>
                              <option value="percentage">Percentage</option>
                              <option value="flat">Flat</option>
                            </select>
                          </div>

                          <div className="form-group">
                            <label className="form-label">Discount Value</label>

                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              value={variant.discountValue}
                              onChange={(event) =>
                                handleVariantChange(
                                  variantIndex,
                                  "discountValue",
                                  event.target.value,
                                )
                              }
                              placeholder={
                                variant.discountType === "percentage"
                                  ? "10"
                                  : "100"
                              }
                              disabled={!variant.discountType}
                            />
                          </div>

                          <div className="form-group">
                            <label className="form-label">Stock</label>

                            <input
                              className="form-input"
                              type="number"
                              min="0"
                              value={variant.stock}
                              onChange={(event) =>
                                handleVariantChange(
                                  variantIndex,
                                  "stock",
                                  event.target.value,
                                )
                              }
                              placeholder="25"
                            />
                          </div>
                        </div>

                        <div className="variant-images-section">
                          <div className="variant-images-header">
                            <div>
                              <h4>Variant Images</h4>
                              <p>Upload up to 5 images for this variant</p>
                            </div>

                            <span className="image-count">
                              {variant.images.length}/5
                            </span>
                          </div>

                          {variant.images.length < 5 && (
                            <label className="image-upload-box">
                              <input
                                type="file"
                                accept="image/png,image/jpeg,image/jpg,image/webp"
                                multiple
                                onChange={(event) =>
                                  handleImages(variantIndex, event)
                                }
                                hidden
                              />

                              <ImagePlus size={34} />

                              <span>Upload variant images</span>

                              <small>
                                JPG, JPEG, PNG or WEBP · Maximum 5MB each
                              </small>

                              <small>You can select multiple images</small>
                            </label>
                          )}

                          {variant.images.length > 0 && (
                            <div className="image-preview-grid">
                              {variant.images.map((image, imageIndex) => (
                                <div
                                  className="image-preview"
                                  key={`${image.file.name}-${image.file.lastModified}-${imageIndex}`}
                                >
                                  <img
                                    src={image.preview}
                                    alt={`Variant ${variantIndex + 1} Image ${
                                      imageIndex + 1
                                    }`}
                                  />

                                  <button
                                    type="button"
                                    className="remove-image-btn"
                                    onClick={() =>
                                      removeImage(variantIndex, imageIndex)
                                    }
                                  >
                                    <X size={16} />
                                  </button>

                                  {imageIndex === 0 && (
                                    <span className="main-image-label">
                                      Main Image
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))
              )}
            </div>

            {variants.length > 0 && (
              <div className="variant-selection-footer">
                <div>
                  <strong>{selectedVariants.length} variants selected</strong>
                  <span>Minimum {MIN_VARIANTS} required</span>
                </div>

                {selectedVariants.length < MIN_VARIANTS && (
                  <p>
                    Select at least {MIN_VARIANTS} variants before adding the
                    product.
                  </p>
                )}
              </div>
            )}
          </section>

          <div className="submit-section">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate("/admin/products")}
              disabled={loading}
            >
              Cancel
            </button>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Adding Product..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
