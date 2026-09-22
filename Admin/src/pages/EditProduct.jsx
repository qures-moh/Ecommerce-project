import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Upload,
  Save,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

const createEmptyAttribute = () => ({
  key: "",
  value: "",
});

const createEmptyVariant = () => ({
  _id: undefined,
  attributes: [createEmptyAttribute()],
  price: "",
  discountType: "",
  discountValue: "",
  stock: "",
  images: [],
  isActive: true,
});

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://")
  ) {
    return image;
  }

  const baseURL = api.defaults.baseURL || "http://localhost:3000/api";

  const cleanBaseURL = baseURL.replace(/\/api\/?$/, "");

  return `${cleanBaseURL}/${image.replace(/^\/+/, "")}`;
};

const normalizeAttributes = (attributes) => {
  if (!attributes) {
    return [createEmptyAttribute()];
  }

  if (attributes instanceof Map) {
    return Array.from(attributes.entries()).map(([key, value]) => ({
      key,
      value,
    }));
  }

  if (typeof attributes === "object") {
    const entries = Object.entries(attributes);

    if (!entries.length) {
      return [createEmptyAttribute()];
    }

    return entries.map(([key, value]) => ({
      key,
      value: String(value ?? ""),
    }));
  }

  return [createEmptyAttribute()];
};

const normalizeVariants = (variants) => {
  if (!Array.isArray(variants) || variants.length === 0) {
    return [createEmptyVariant()];
  }

  return variants.map((variant) => ({
    _id: variant._id,
    attributes: normalizeAttributes(variant.attributes),
    price: variant.price ?? "",
    discountType: variant.discountType || "",
    discountValue:
      variant.discountValue !== undefined
        ? variant.discountValue
        : "",
    stock: variant.stock ?? "",
    images: Array.isArray(variant.images)
      ? variant.images.map((image) => ({
          type: "existing",
          url: getImageUrl(image),
          path: image,
        }))
      : [],
    isActive:
      variant.isActive !== undefined
        ? variant.isActive
        : true,
  }));
};

export default function EditProduct() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    subcategory: "",
    description: "",
    isActive: true,
  });

  const [variants, setVariants] = useState([]);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");

      const data =
        response.data?.categories ||
        response.data ||
        [];

      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("FETCH CATEGORIES ERROR:", error);
      toast.error("Failed to load categories");
    }
  };

  const fetchSubcategories = async (categoryId) => {
    if (!categoryId) {
      setSubcategories([]);
      return;
    }

    try {
      const response = await api.get(
        `/subcategories?category=${categoryId}`
      );

      const data =
        response.data?.subcategories ||
        response.data ||
        [];

      setSubcategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(
        "FETCH SUBCATEGORIES ERROR:",
        error
      );
      setSubcategories([]);
      toast.error("Failed to load subcategories");
    }
  };

  const fetchProduct = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        `/products/${id}`
      );

      const product =
        response.data?.product;

      if (!product) {
        toast.error("Product not found");
        navigate("/admin/products");
        return;
      }

      const categoryId =
        product.category?._id ||
        product.category ||
        "";

      const subcategoryId =
        product.subcategory?._id ||
        product.subcategory ||
        "";

      setFormData({
        name: product.name || "",
        category: categoryId,
        subcategory: subcategoryId,
        description: product.description || "",
        isActive:
          product.isActive !== undefined
            ? product.isActive
            : true,
      });

      setVariants(
        normalizeVariants(product.variants)
      );

      await fetchSubcategories(categoryId);
    } catch (error) {
      console.error(
        "FETCH PRODUCT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load product"
      );

      navigate("/admin/products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProduct();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCategoryChange = async (e) => {
    const categoryId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      category: categoryId,
      subcategory: "",
    }));

    await fetchSubcategories(categoryId);
  };

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      createEmptyVariant(),
    ]);
  };

  const removeVariant = (variantIndex) => {
    if (variants.length === 1) {
      toast.error(
        "At least one variant is required"
      );
      return;
    }

    setVariants((prev) =>
      prev.filter(
        (_, index) => index !== variantIndex
      )
    );
  };

  const addAttribute = (variantIndex) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        return {
          ...variant,
          attributes: [
            ...variant.attributes,
            createEmptyAttribute(),
          ],
        };
      })
    );
  };

  const removeAttribute = (
    variantIndex,
    attributeIndex
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        if (variant.attributes.length === 1) {
          toast.error(
            "At least one attribute is required"
          );
          return variant;
        }

        return {
          ...variant,
          attributes:
            variant.attributes.filter(
              (_, index) =>
                index !== attributeIndex
            ),
        };
      })
    );
  };

  const handleAttributeChange = (
    variantIndex,
    attributeIndex,
    field,
    value
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        const updatedAttributes =
          variant.attributes.map(
            (attribute, index) => {
              if (index !== attributeIndex) {
                return attribute;
              }

              return {
                ...attribute,
                [field]: value,
              };
            }
          );

        return {
          ...variant,
          attributes: updatedAttributes,
        };
      })
    );
  };

  const handleVariantChange = (
    variantIndex,
    field,
    value
  ) => {
    setVariants((prev) =>
      prev.map((variant, index) => {
        if (index !== variantIndex) {
          return variant;
        }

        return {
          ...variant,
          [field]: value,
        };
      })
    );
  };

  const handleImages = (
    variantIndex,
    e
  ) => {
    const files = Array.from(
      e.target.files || []
    );

    if (!files.length) {
      return;
    }

    setVariants((prevVariants) => {
      return prevVariants.map(
        (variant, index) => {
          if (index !== variantIndex) {
            return variant;
          }

          const remainingSlots =
            5 - variant.images.length;

          if (remainingSlots <= 0) {
            toast.error(
              "Maximum 5 images allowed per variant"
            );
            return variant;
          }

          const validFiles = [];

          files.forEach((file) => {
            if (
              !file.type.startsWith("image/")
            ) {
              toast.error(
                `${file.name} is not a valid image`
              );
              return;
            }

            if (
              file.size >
              5 * 1024 * 1024
            ) {
              toast.error(
                `${file.name} must be less than 5MB`
              );
              return;
            }

            validFiles.push(file);
          });

          const filesToAdd =
            validFiles.slice(
              0,
              remainingSlots
            );

          if (
            validFiles.length >
            remainingSlots
          ) {
            toast.error(
              "Maximum 5 images allowed per variant"
            );
          }

          const newImages =
            filesToAdd.map((file) => ({
              type: "new",
              file,
              preview:
                URL.createObjectURL(file),
            }));

          return {
            ...variant,
            images: [
              ...variant.images,
              ...newImages,
            ],
          };
        }
      );
    });

    e.target.value = "";
  };

  const removeImage = (
    variantIndex,
    imageIndex
  ) => {
    setVariants((prevVariants) =>
      prevVariants.map(
        (variant, index) => {
          if (index !== variantIndex) {
            return variant;
          }

          const imageToRemove =
            variant.images[imageIndex];

          if (
            imageToRemove?.type === "new" &&
            imageToRemove?.preview
          ) {
            URL.revokeObjectURL(
              imageToRemove.preview
            );
          }

          return {
            ...variant,
            images:
              variant.images.filter(
                (_, index) =>
                  index !== imageIndex
              ),
          };
        }
      )
    );
  };

  const calculateFinalPrice = (
    variant
  ) => {
    const price =
      Number(variant.price) || 0;

    const discount =
      Number(
        variant.discountValue
      ) || 0;

    if (
      variant.discountType ===
      "percentage"
    ) {
      return Math.max(
        0,
        price -
          (price * discount) / 100
      );
    }

    if (
      variant.discountType ===
      "flat"
    ) {
      return Math.max(
        0,
        price - discount
      );
    }

    return price;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error(
        "Product name is required"
      );
      return false;
    }

    if (!formData.category) {
      toast.error(
        "Please select a category"
      );
      return false;
    }

    if (!formData.subcategory) {
      toast.error(
        "Please select a subcategory"
      );
      return false;
    }

    if (!formData.description.trim()) {
      toast.error(
        "Product description is required"
      );
      return false;
    }

    if (!variants.length) {
      toast.error(
        "At least one variant is required"
      );
      return false;
    }

    for (
      let i = 0;
      i < variants.length;
      i++
    ) {
      const variant = variants[i];

      if (!variant.attributes.length) {
        toast.error(
          `Variant ${i + 1} needs an attribute`
        );
        return false;
      }

      const attributes = {};

      for (
        let j = 0;
        j < variant.attributes.length;
        j++
      ) {
        const attribute =
          variant.attributes[j];

        const key =
          attribute.key.trim();
        const value =
          attribute.value.trim();

        if (!key || !value) {
          toast.error(
            `Variant ${
              i + 1
            } has an empty attribute`
          );
          return false;
        }

        const normalizedKey =
          key.toLowerCase();

        if (
          attributes[normalizedKey]
        ) {
          toast.error(
            `Duplicate attribute in variant ${
              i + 1
            }`
          );
          return false;
        }

        attributes[normalizedKey] =
          value;
      }

      const price =
        Number(variant.price);

      if (
        variant.price === "" ||
        !Number.isFinite(price) ||
        price < 0
      ) {
        toast.error(
          `Variant ${
            i + 1
          } must have a valid price`
        );
        return false;
      }

      const stock =
        variant.stock === ""
          ? 0
          : Number(variant.stock);

      if (
        !Number.isFinite(stock) ||
        stock < 0
      ) {
        toast.error(
          `Variant ${
            i + 1
          } must have a valid stock`
        );
        return false;
      }

      const discount =
        variant.discountValue === ""
          ? 0
          : Number(
              variant.discountValue
            );

      if (
        !Number.isFinite(discount) ||
        discount < 0
      ) {
        toast.error(
          `Variant ${
            i + 1
          } has an invalid discount`
        );
        return false;
      }

      if (
        variant.discountType ===
          "percentage" &&
        discount > 100
      ) {
        toast.error(
          `Percentage discount cannot exceed 100 in variant ${
            i + 1
          }`
        );
        return false;
      }

      if (
        variant.discountType === "flat" &&
        discount > price
      ) {
        toast.error(
          `Flat discount cannot be greater than price in variant ${
            i + 1
          }`
        );
        return false;
      }

      if (
        variant.images.length === 0
      ) {
        toast.error(
          `At least one image is required for variant ${
            i + 1
          }`
        );
        return false;
      }

      if (
        variant.images.length > 5
      ) {
        toast.error(
          `Maximum 5 images are allowed for variant ${
            i + 1
          }`
        );
        return false;
      }
    }

    const variantKeys = new Set();

    for (
      let i = 0;
      i < variants.length;
      i++
    ) {
      const attributes = {};

      variants[i].attributes.forEach(
        (attribute) => {
          attributes[
            attribute.key
              .trim()
              .toLowerCase()
          ] =
            attribute.value
              .trim()
              .toLowerCase();
        }
      );

      const key = Object.keys(
        attributes
      )
        .sort()
        .map(
          (attributeKey) =>
            `${attributeKey}:${attributes[attributeKey]}`
        )
        .join("|");

      if (variantKeys.has(key)) {
        toast.error(
          `Duplicate variant found at variant ${
            i + 1
          }`
        );
        return false;
      }

      variantKeys.add(key);
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);

      const data = new FormData();

      data.append(
        "name",
        formData.name.trim()
      );

      data.append(
        "category",
        formData.category
      );

      data.append(
        "subcategory",
        formData.subcategory
      );

      data.append(
        "description",
        formData.description.trim()
      );

      data.append(
        "isActive",
        String(formData.isActive)
      );

      const variantsForBackend =
        variants.map((variant) => {
          const attributes = {};

          variant.attributes.forEach(
            (attribute) => {
              const key =
                attribute.key.trim();
              const value =
                attribute.value.trim();

              if (key && value) {
                attributes[key] =
                  value;
              }
            }
          );

          const existingImages =
            variant.images
              .filter(
                (image) =>
                  image.type ===
                  "existing"
              )
              .map(
                (image) =>
                  image.path
              );

          return {
            _id: variant._id,
            attributes,
            price: Number(
              variant.price
            ),
            discountType:
              variant.discountType ||
              null,
            discountValue: Number(
              variant.discountValue ||
                0
            ),
            stock: Number(
              variant.stock || 0
            ),
            images: existingImages,
            isActive:
              variant.isActive !==
              undefined
                ? variant.isActive
                : true,
          };
        });

      data.append(
        "variants",
        JSON.stringify(
          variantsForBackend
        )
      );

      variants.forEach(
        (variant, variantIndex) => {
          variant.images.forEach(
            (image) => {
              if (
                image.type === "new" &&
                image.file
              ) {
                data.append(
                  `variant_${variantIndex}_images`,
                  image.file
                );
              }
            }
          );
        }
      );

      const response = await api.put(
        `/${id}`,
        data
      );

      toast.success(
        response.data?.message ||
          "Product updated successfully"
      );

      navigate("/admin/products");
    } catch (error) {
      console.error(
        "UPDATE PRODUCT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update product"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-product-loading">
        Loading product...
      </div>
    );
  }

  return (
    <div className="admin-product-form-page">
      <div className="admin-product-form-header">
        <button
          type="button"
          className="admin-back-btn"
          onClick={() =>
            navigate("/admin/products")
          }
        >
          <ArrowLeft size={18} />
          Back to Products
        </button>

        <div>
          <h1>Edit Product</h1>
          <p>
            Update product details and
            variants
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="admin-product-form"
      >
        <div className="admin-form-section">
          <div className="admin-form-section-header">
            <h2>Basic Information</h2>
          </div>

          <div className="admin-form-grid">
            <div className="admin-form-group admin-full-width">
              <label>
                Product Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter product name"
              />
            </div>

            <div className="admin-form-group">
              <label>Category</label>

              <select
                name="category"
                value={formData.category}
                onChange={
                  handleCategoryChange
                }
              >
                <option value="">
                  Select Category
                </option>

                {categories.map(
                  (category) => (
                    <option
                      key={category._id}
                      value={category._id}
                    >
                      {category.name}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="admin-form-group">
              <label>
                Subcategory
              </label>

              <select
                name="subcategory"
                value={
                  formData.subcategory
                }
                onChange={handleChange}
                disabled={
                  !formData.category
                }
              >
                <option value="">
                  Select Subcategory
                </option>

                {subcategories.map(
                  (subcategory) => (
                    <option
                      key={
                        subcategory._id
                      }
                      value={
                        subcategory._id
                      }
                    >
                      {
                        subcategory.name
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="admin-form-group admin-full-width">
              <label>
                Description
              </label>

              <textarea
                name="description"
                value={
                  formData.description
                }
                onChange={handleChange}
                placeholder="Enter product description"
                rows={5}
              />
            </div>

            <div className="admin-form-group">
              <label>
                Product Status
              </label>

              <select
                value={
                  formData.isActive
                    ? "true"
                    : "false"
                }
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isActive:
                      e.target.value ===
                      "true",
                  }))
                }
              >
                <option value="true">
                  Active
                </option>
                <option value="false">
                  Inactive
                </option>
              </select>
            </div>
          </div>
        </div>

        <div className="admin-form-section">
          <div className="admin-form-section-header admin-variants-header">
            <div>
              <h2>Product Variants</h2>
              <p>
                Add different options,
                prices, stock and images
                for this product
              </p>
            </div>

            <button
              type="button"
              className="admin-add-variant-btn"
              onClick={addVariant}
            >
              <Plus size={18} />
              Add Variant
            </button>
          </div>

          <div className="admin-variants-list">
            {variants.map(
              (variant, variantIndex) => (
                <div
                  className="admin-variant-card"
                  key={
                    variant._id ||
                    variantIndex
                  }
                >
                  <div className="admin-variant-card-header">
                    <div>
                      <h3>
                        Variant{" "}
                        {variantIndex + 1}
                      </h3>
                    </div>

                    {variants.length >
                      1 && (
                      <button
                        type="button"
                        className="admin-remove-variant-btn"
                        onClick={() =>
                          removeVariant(
                            variantIndex
                          )
                        }
                      >
                        <Trash2
                          size={17}
                        />
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="admin-variant-attributes">
                    <div className="admin-subsection-title">
                      <h4>
                        Attributes
                      </h4>

                      <button
                        type="button"
                        className="admin-add-attribute-btn"
                        onClick={() =>
                          addAttribute(
                            variantIndex
                          )
                        }
                      >
                        <Plus size={15} />
                        Add Attribute
                      </button>
                    </div>

                    {variant.attributes.map(
                      (
                        attribute,
                        attributeIndex
                      ) => (
                        <div
                          className="admin-attribute-row"
                          key={
                            attributeIndex
                          }
                        >
                          <input
                            type="text"
                            value={
                              attribute.key
                            }
                            onChange={(
                              e
                            ) =>
                              handleAttributeChange(
                                variantIndex,
                                attributeIndex,
                                "key",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Attribute e.g. Color"
                          />

                          <input
                            type="text"
                            value={
                              attribute.value
                            }
                            onChange={(
                              e
                            ) =>
                              handleAttributeChange(
                                variantIndex,
                                attributeIndex,
                                "value",
                                e.target
                                  .value
                              )
                            }
                            placeholder="Value e.g. Black"
                          />

                          {variant
                            .attributes
                            .length >
                            1 && (
                            <button
                              type="button"
                              className="admin-remove-attribute-btn"
                              onClick={() =>
                                removeAttribute(
                                  variantIndex,
                                  attributeIndex
                                )
                              }
                            >
                              <X
                                size={17}
                              />
                            </button>
                          )}
                        </div>
                      )
                    )}
                  </div>

                  <div className="admin-variant-fields">
                    <div className="admin-form-group">
                      <label>
                        Price
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          variant.price
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "price",
                            e.target
                              .value
                          )
                        }
                        placeholder="999"
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>
                        Discount Type
                      </label>

                      <select
                        value={
                          variant.discountType
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "discountType",
                            e.target
                              .value
                          )
                        }
                      >
                        <option value="">
                          No Discount
                        </option>
                        <option value="flat">
                          Flat
                        </option>
                        <option value="percentage">
                          Percentage
                        </option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label>
                        Discount Value
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          variant.discountValue
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "discountValue",
                            e.target
                              .value
                          )
                        }
                        placeholder="100"
                        disabled={
                          !variant.discountType
                        }
                      />
                    </div>

                    <div className="admin-form-group">
                      <label>
                        Stock
                      </label>

                      <input
                        type="number"
                        min="0"
                        value={
                          variant.stock
                        }
                        onChange={(e) =>
                          handleVariantChange(
                            variantIndex,
                            "stock",
                            e.target
                              .value
                          )
                        }
                        placeholder="20"
                      />
                    </div>
                  </div>

                  <div className="admin-variant-price-preview">
                    <span>
                      Final Price
                    </span>

                    <strong>
                      ₹
                      {calculateFinalPrice(
                        variant
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>

                  <div className="admin-variant-images-section">
                    <div className="admin-subsection-title">
                      <div>
                        <h4>
                          Variant Images
                        </h4>

                        <span>
                          {
                            variant.images
                              .length
                          }
                          /5 images
                        </span>
                      </div>
                    </div>

                    <div className="admin-variant-images-grid">
                      {variant.images.map(
                        (
                          image,
                          imageIndex
                        ) => (
                          <div
                            className="admin-variant-image-card"
                            key={
                              image.path ||
                              image.preview ||
                              imageIndex
                            }
                          >
                            <img
                              src={
                                image.type ===
                                "new"
                                  ? image.preview
                                  : image.url
                              }
                              alt={`Variant ${
                                variantIndex +
                                1
                              } ${
                                imageIndex +
                                1
                              }`}
                            />

                            <button
                              type="button"
                              className="admin-remove-image-btn"
                              onClick={() =>
                                removeImage(
                                  variantIndex,
                                  imageIndex
                                )
                              }
                            >
                              <X size={15} />
                            </button>

                            {imageIndex ===
                              0 && (
                              <span className="admin-primary-image-badge">
                                Main
                              </span>
                            )}
                          </div>
                        )
                      )}

                      {variant.images
                        .length < 5 && (
                        <label className="admin-upload-image-box">
                          <Upload
                            size={24}
                          />

                          <span>
                            Add Image
                          </span>

                          <small>
                            {
                              5 -
                                variant
                                  .images
                                  .length
                            }{" "}
                            remaining
                          </small>

                          <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            multiple
                            onChange={(e) =>
                              handleImages(
                                variantIndex,
                                e
                              )
                            }
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>

        <div className="admin-form-actions">
          <button
            type="button"
            className="admin-cancel-btn"
            onClick={() =>
              navigate(
                "/admin/products"
              )
            }
            disabled={saving}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="admin-save-btn"
            disabled={saving}
          >
            <Save size={18} />

            {saving
              ? "Updating..."
              : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}