import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Package,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { toast } from "react-toastify";
import api from "../../utils/axios";

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

  const baseURL = api.defaults.baseURL || "";

  const cleanBaseURL = baseURL.replace(/\/api\/?$/, "");

  const cleanImage = image.replace(/^\/+/, "");

  return `${cleanBaseURL}/${cleanImage}`;
};

const getVariantFinalPrice = (variant) => {
  const price = Number(variant?.price) || 0;
  const discountValue =
    Number(variant?.discountValue) || 0;

  if (variant?.discountType === "percentage") {
    return Math.max(
      price - (price * discountValue) / 100,
      0
    );
  }

  if (variant?.discountType === "flat") {
    return Math.max(
      price - discountValue,
      0
    );
  }

  return price;
};

const getProductStats = (product) => {
  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  if (variants.length === 0) {
    return {
      minPrice: 0,
      maxPrice: 0,
      minFinalPrice: 0,
      maxFinalPrice: 0,
      totalStock: 0,
      variantCount: 0,
      maxPercentageDiscount: 0,
      hasDiscount: false,
    };
  }

  const prices = variants.map(
    (variant) => Number(variant?.price) || 0
  );

  const finalPrices = variants.map(
    (variant) => getVariantFinalPrice(variant)
  );

  const totalStock = variants.reduce(
    (total, variant) =>
      total + (Number(variant?.stock) || 0),
    0
  );

  const percentageDiscounts = variants
    .filter(
      (variant) =>
        variant?.discountType === "percentage"
    )
    .map(
      (variant) =>
        Number(variant?.discountValue) || 0
    );

  const flatDiscountPercentages = variants
    .filter(
      (variant) =>
        variant?.discountType === "flat"
    )
    .map((variant) => {
      const price =
        Number(variant?.price) || 0;

      const discount =
        Number(variant?.discountValue) || 0;

      if (price <= 0) {
        return 0;
      }

      return (discount / price) * 100;
    });

  const allDiscounts = [
    ...percentageDiscounts,
    ...flatDiscountPercentages,
  ];

  const maxPercentageDiscount =
    allDiscounts.length > 0
      ? Math.max(...allDiscounts)
      : 0;

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minFinalPrice: Math.min(...finalPrices),
    maxFinalPrice: Math.max(...finalPrices),
    totalStock,
    variantCount: variants.length,
    maxPercentageDiscount,
    hasDiscount:
      allDiscounts.some(
        (discount) => discount > 0
      ),
  };
};

const getProductImage = (product) => {
  const variants = Array.isArray(product?.variants)
    ? product.variants
    : [];

  for (const variant of variants) {
    if (
      Array.isArray(variant?.images) &&
      variant.images.length > 0
    ) {
      return getImageUrl(variant.images[0]);
    }
  }

  return "";
};

const formatPrice = (price) => {
  return `₹${Number(price || 0).toLocaleString(
    "en-IN"
  )}`;
};

const formatPriceRange = (min, max) => {
  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
};

const getVariantAttributes = (variant) => {
  if (!variant?.attributes) {
    return "";
  }

  if (variant.attributes instanceof Map) {
    return Array.from(
      variant.attributes.entries()
    )
      .map(
        ([key, value]) =>
          `${key}: ${value}`
      )
      .join(" • ");
  }

  return Object.entries(variant.attributes)
    .map(
      ([key, value]) =>
        `${key}: ${value}`
    )
    .join(" • ");
};

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] =
    useState(0);

  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] =
    useState(null);

  const [selectedProduct, setSelectedProduct] =
    useState(null);

  const [deleteProduct, setDeleteProduct] =
    useState(null);

  const limit = 10;

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [page, category]);

  const fetchCategories = async () => {
    try {
      const response = await api.get(
        "/categories"
      );

      if (Array.isArray(response.data)) {
        setCategories(response.data);
      } else if (
        Array.isArray(
          response.data?.categories
        )
      ) {
        setCategories(
          response.data.categories
        );
      } else {
        setCategories([]);
      }
    } catch (error) {
      console.error(
        "FETCH CATEGORIES ERROR:",
        error
      );
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = {
        page,
        limit,
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      if (category) {
        params.category = category;
      }

      const response = await api.get(
        "/products",
        {
          params,
        }
      );

      const data = response.data;

      if (Array.isArray(data)) {
        setProducts(data);
        setTotalProducts(data.length);
        setTotalPages(1);
      } else {
        setProducts(
          Array.isArray(data?.products)
            ? data.products
            : []
        );

        setTotalProducts(
          Number(data?.totalProducts) || 0
        );

        setTotalPages(
          Number(data?.totalPages) || 1
        );
      }
    } catch (error) {
      console.error(
        "FETCH PRODUCTS ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to fetch products"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();

    setPage(1);
    fetchProducts();
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setPage(1);
  };

  const handleDelete = (product) => {
    setDeleteProduct(product);
  };

  const confirmDelete = async () => {
    if (!deleteProduct?._id) {
      return;
    }

    try {
      setDeleteLoading(deleteProduct._id);

      await api.delete(
        `/${deleteProduct._id}`
      );

      toast.success(
        "Product deleted successfully"
      );

      setDeleteProduct(null);

      if (
        products.length === 1 &&
        page > 1
      ) {
        setPage((prev) => prev - 1);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error(
        "DELETE PRODUCT ERROR:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to delete product"
      );
    } finally {
      setDeleteLoading(null);
    }
  };

  const clearSearch = () => {
    setSearch("");
    setPage(1);

    setTimeout(() => {
      fetchProducts();
    }, 0);
  };

  const renderProductImage = (product) => {
    const image =
      getProductImage(product);

    if (image) {
      return (
        <img
          src={image}
          alt={product.name}
          className="admin-product-image"
          onError={(e) => {
            e.currentTarget.style.display =
              "none";

            e.currentTarget.nextSibling.style.display =
              "flex";
          }}
        />
      );
    }

    return (
      <div className="admin-product-placeholder">
        <Package size={24} />
      </div>
    );
  };

  return (
    <div className="admin-page">
      <div className="admin-products-header">
        <div>
          <h1>Products</h1>

          <p>
            Manage your store products
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="admin-add-product-btn"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="admin-products-toolbar">
        <form
          className="admin-product-search"
          onSubmit={handleSearch}
        >
          <Search size={19} />

          <input
            type="text"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search products..."
          />

          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="admin-search-clear"
            >
              <X size={16} />
            </button>
          )}
        </form>

        <select
          className="admin-product-category-filter"
          value={category}
          onChange={handleCategoryChange}
        >
          <option value="">
            All Categories
          </option>

          {categories.map((item) => (
            <option
              key={item._id}
              value={item._id}
            >
              {item.name}
            </option>
          ))}
        </select>
      </div>

      <div className="admin-products-table-wrapper">
        <table className="admin-products-table">
          <thead>
            <tr>
              <th>PRODUCT</th>
              <th>CATEGORY</th>
              <th>SUBCATEGORY</th>
              <th>PRICE</th>
              <th>DISCOUNT</th>
              <th>FINAL PRICE</th>
              <th>STOCK</th>
              <th>VARIANTS</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan="9"
                  className="admin-table-loading"
                >
                  Loading products...
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td
                  colSpan="9"
                  className="admin-table-empty"
                >
                  <Package size={40} />

                  <h3>
                    No products found
                  </h3>

                  <p>
                    Add a product to your
                    store to get started.
                  </p>
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const stats =
                  getProductStats(
                    product
                  );

                const image =
                  getProductImage(
                    product
                  );

                return (
                  <tr
                    key={product._id}
                  >
                    <td>
                      <div className="admin-product-info">
                        <div className="admin-product-image-wrapper">
                          {image ? (
                            <>
                              <img
                                src={image}
                                alt={
                                  product.name
                                }
                                className="admin-product-image"
                                onError={(
                                  e
                                ) => {
                                  e.currentTarget.style.display =
                                    "none";

                                  const placeholder =
                                    e.currentTarget
                                      .nextSibling;

                                  if (
                                    placeholder
                                  ) {
                                    placeholder.style.display =
                                      "flex";
                                  }
                                }}
                              />

                              <div
                                className="admin-product-placeholder"
                                style={{
                                  display:
                                    "none",
                                }}
                              >
                                <Package
                                  size={
                                    24
                                  }
                                />
                              </div>
                            </>
                          ) : (
                            <div className="admin-product-placeholder">
                              <span>
                                {product.name
                                  ?.charAt(
                                    0
                                  )
                                  ?.toUpperCase() ||
                                  "P"}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="admin-product-details">
                          <strong>
                            {product.name}
                          </strong>

                          <span>
                            {product.description
                              ?.length >
                            45
                              ? `${product.description.substring(
                                  0,
                                  45
                                )}...`
                              : product.description ||
                                "No description"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>
                      {product.category
                        ?.name || "—"}
                    </td>

                    <td>
                      {product.subcategory
                        ?.name || "—"}
                    </td>

                    <td>
                      <strong>
                        {formatPriceRange(
                          stats.minPrice,
                          stats.maxPrice
                        )}
                      </strong>
                    </td>

                    <td>
                      {stats.hasDiscount ? (
                        <span className="admin-discount-badge">
                          Up to{" "}
                          {Math.round(
                            stats.maxPercentageDiscount
                          )}
                          %
                        </span>
                      ) : (
                        <span className="admin-no-discount">
                          —
                        </span>
                      )}
                    </td>

                    <td>
                      <strong className="admin-final-price">
                        {formatPriceRange(
                          stats.minFinalPrice,
                          stats.maxFinalPrice
                        )}
                      </strong>
                    </td>

                    <td>
                      {stats.totalStock > 0 ? (
                        <span className="admin-stock-badge">
                          {stats.totalStock}{" "}
                          in Stock
                        </span>
                      ) : (
                        <span className="admin-out-stock-badge">
                          Out of Stock
                        </span>
                      )}
                    </td>

                    <td>
                      <span className="admin-variant-badge">
                        {stats.variantCount}{" "}
                        {stats.variantCount ===
                        1
                          ? "Variant"
                          : "Variants"}
                      </span>
                    </td>

                    <td>
                      <div className="admin-product-actions">
                        <button
                          type="button"
                          className="admin-view-btn"
                          onClick={() =>
                            setSelectedProduct(
                              product
                            )
                          }
                          title="View Product"
                        >
                          <Eye size={17} />
                        </button>

                        <Link
                          to={`/admin/products/edit/${product._id}`}
                          className="admin-edit-btn"
                          title="Edit Product"
                        >
                          <Pencil
                            size={17}
                          />
                        </Link>

                        <button
                          type="button"
                          className="admin-delete-btn"
                          onClick={() =>
                            handleDelete(
                              product
                            )
                          }
                          disabled={
                            deleteLoading ===
                            product._id
                          }
                          title="Delete Product"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {products.length > 0 && (
        <div className="admin-products-pagination">
          <div className="admin-pagination-info">
            Showing{" "}
            <strong>
              {(page - 1) * limit + 1}
            </strong>{" "}
            to{" "}
            <strong>
              {Math.min(
                page * limit,
                totalProducts
              )}
            </strong>{" "}
            of{" "}
            <strong>
              {totalProducts}
            </strong>{" "}
            products
          </div>

          <div className="admin-pagination-buttons">
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
              Page {page} of{" "}
              {totalPages}
            </span>

            <button
              type="button"
              disabled={
                page >= totalPages
              }
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

      {selectedProduct && (
        <div
          className="admin-product-modal-overlay"
          onClick={() =>
            setSelectedProduct(null)
          }
        >
          <div
            className="admin-product-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-product-modal-header">
              <div>
                <h2>
                  {selectedProduct.name}
                </h2>

                <p>
                  {selectedProduct.category
                    ?.name || "—"}{" "}
                  /{" "}
                  {selectedProduct
                    .subcategory?.name ||
                    "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedProduct(
                    null
                  )
                }
              >
                <X size={20} />
              </button>
            </div>

            <div className="admin-product-modal-content">
              <div className="admin-product-modal-description">
                <h3>Description</h3>

                <p>
                  {selectedProduct.description ||
                    "No description available"}
                </p>
              </div>

              <div className="admin-product-modal-variants">
                <h3>
                  Variants
                </h3>

                {Array.isArray(
                  selectedProduct.variants
                ) &&
                  selectedProduct.variants.map(
                    (
                      variant,
                      index
                    ) => (
                      <div
                        className="admin-product-variant-card"
                        key={
                          variant._id ||
                          index
                        }
                      >
                        <div className="admin-product-variant-top">
                          <strong>
                            Variant{" "}
                            {index + 1}
                          </strong>

                          <span>
                            {Number(
                              variant.stock
                            ) || 0}{" "}
                            stock
                          </span>
                        </div>

                        <div className="admin-product-variant-attributes">
                          {getVariantAttributes(
                            variant
                          ) ||
                            "No attributes"}
                        </div>

                        <div className="admin-product-variant-pricing">
                          <div>
                            <span>
                              Price
                            </span>

                            <strong>
                              {formatPrice(
                                variant.price
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Discount
                            </span>

                            <strong>
                              {variant.discountType ===
                              "percentage"
                                ? `${variant.discountValue}%`
                                : variant.discountType ===
                                  "flat"
                                ? formatPrice(
                                    variant.discountValue
                                  )
                                : "—"}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Final Price
                            </span>

                            <strong>
                              {formatPrice(
                                getVariantFinalPrice(
                                  variant
                                )
                              )}
                            </strong>
                          </div>
                        </div>

                        {Array.isArray(
                          variant.images
                        ) &&
                          variant.images
                            .length >
                            0 && (
                            <div className="admin-product-variant-images">
                              {variant.images.map(
                                (
                                  image,
                                  imageIndex
                                ) => (
                                  <img
                                    key={
                                      imageIndex
                                    }
                                    src={getImageUrl(
                                      image
                                    )}
                                    alt={`${selectedProduct.name} ${
                                      index + 1
                                    }`}
                                  />
                                )
                              )}
                            </div>
                          )}
                      </div>
                    )
                  )}
              </div>
            </div>

            <div className="admin-product-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedProduct(
                    null
                  )
                }
                className="admin-modal-close-btn"
              >
                Close
              </button>

              <Link
                to={`/admin/products/edit/${selectedProduct._id}`}
                className="admin-modal-edit-btn"
              >
                <Pencil size={17} />
                Edit Product
              </Link>
            </div>
          </div>
        </div>
      )}

      {deleteProduct && (
        <div
          className="admin-delete-overlay"
          onClick={() => {
            if (!deleteLoading) {
              setDeleteProduct(null);
            }
          }}
        >
          <div
            className="admin-delete-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <div className="admin-delete-icon">
              <Trash2 size={24} />
            </div>

            <h2>
              Delete Product?
            </h2>

            <p className="admin-delete-message">
              Are you sure you want to
              delete this product?
            </p>

            <div className="admin-delete-product">
              <div className="admin-delete-product-image">
                {getProductImage(
                  deleteProduct
                ) ? (
                  <img
                    src={getProductImage(
                      deleteProduct
                    )}
                    alt={
                      deleteProduct.name
                    }
                  />
                ) : (
                  <Package size={24} />
                )}
              </div>

              <div className="admin-delete-product-info">
                <h3>
                  {deleteProduct.name}
                </h3>

                <p>
                  {deleteProduct.category
                    ?.name ||
                    "No Category"}{" "}
                  →{" "}
                  {deleteProduct
                    .subcategory?.name ||
                    "No Subcategory"}
                </p>
              </div>
            </div>

            <div className="admin-delete-stats">
              <div>
                <span>
                  Variants
                </span>

                <strong>
                  {deleteProduct
                    .variants
                    ?.length || 0}
                </strong>
              </div>

              <div>
                <span>
                  Total Stock
                </span>

                <strong>
                  {deleteProduct.variants?.reduce(
                    (
                      total,
                      variant
                    ) =>
                      total +
                      (Number(
                        variant.stock
                      ) || 0),
                    0
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Price
                </span>

                <strong>
                  {formatPriceRange(
                    getProductStats(
                      deleteProduct
                    ).minPrice,
                    getProductStats(
                      deleteProduct
                    ).maxPrice
                  )}
                </strong>
              </div>
            </div>

            <div className="admin-delete-warning">
              <Trash2 size={17} />

              <span>
                This will permanently
                delete the product, all
                variants and their images.
                This action cannot be
                undone.
              </span>
            </div>

            <div className="admin-delete-actions">
              <button
                type="button"
                className="admin-delete-cancel"
                disabled={
                  deleteLoading !== null
                }
                onClick={() =>
                  setDeleteProduct(null)
                }
              >
                Cancel
              </button>

              <button
                type="button"
                className="admin-delete-confirm"
                disabled={
                  deleteLoading !== null
                }
                onClick={
                  confirmDelete
                }
              >
                <Trash2 size={17} />

                {deleteLoading
                  ? "Deleting..."
                  : "Delete Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;