import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";

import { addToCart } from "../utils/cartSlice";
import { toggleWishlist } from "../utils/wishlist";
import api from "../utils/axios";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:")
  ) {
    return image;
  }

  const baseUrl =
    api.defaults.baseURL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000";

  const cleanImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  if (cleanImage.startsWith("uploads/")) {
    return `${baseUrl}/${cleanImage}`;
  }

  return `${baseUrl}/uploads/${cleanImage}`;
};

const getVariant = (product) => {
  if (
    !Array.isArray(product?.variants) ||
    product.variants.length === 0
  ) {
    return null;
  }

  return (
    product.variants.find(
      (variant) =>
        variant?.isActive !== false &&
        Number(variant?.stock) > 0
    ) ||
    product.variants.find(
      (variant) => variant?.isActive !== false
    ) ||
    product.variants[0]
  );
};

const getFinalPrice = (variant) => {
  if (!variant) {
    return 0;
  }

  const price = Number(variant.price) || 0;
  const discountValue =
    Number(variant.discountValue) || 0;

  if (variant.discountType === "percentage") {
    return Math.max(
      0,
      price - (price * discountValue) / 100
    );
  }

  if (variant.discountType === "flat") {
    return Math.max(
      0,
      price - discountValue
    );
  }

  return price;
};

const getDiscountText = (variant) => {
  if (!variant) {
    return "";
  }

  const discountValue =
    Number(variant.discountValue) || 0;

  if (discountValue <= 0) {
    return "";
  }

  if (variant.discountType === "percentage") {
    return `${discountValue}% OFF`;
  }

  if (variant.discountType === "flat") {
    return `₹${discountValue} OFF`;
  }

  return "";
};

const getCategoryName = (category) => {
  if (!category) {
    return "";
  }

  if (typeof category === "string") {
    return category;
  }

  if (typeof category === "object") {
    return category.name || "";
  }

  return "";
};

const getAttributes = (attributes) => {
  if (!attributes) {
    return [];
  }

  if (
    typeof attributes.entries === "function"
  ) {
    return Array.from(attributes.entries());
  }

  if (
    typeof attributes === "object" &&
    !Array.isArray(attributes)
  ) {
    return Object.entries(attributes);
  }

  return [];
};

const Products = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlist = useSelector(
    (state) =>
      state.wishlist ||
      state.whishlist ||
      []
  );

  const cart = useSelector(
    (state) => state.cart || []
  );

  const user = useSelector(
    (state) => state.user
  );

  const isAuthenticated = Boolean(user);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [loading, setLoading] =
    useState(false);

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [category, setCategory] =
    useState("");

  const [sort, setSort] =
    useState("newest");

  const [currentPage, setCurrentPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [totalProducts, setTotalProducts] =
    useState(0);

  const productsPerPage = 10;

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setCategoryLoading(true);

        const response =
          await api.get("/categories");

        setCategories(
          response.data?.categories ||
            response.data ||
            []
        );
      } catch (error) {
        console.error(
          "Categories API Error:",
          error
        );

        setCategories([]);
      } finally {
        setCategoryLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          "/products",
          {
            params: {
              category,
              page: currentPage,
              limit: productsPerPage,
            },
          }
        );

        const data = response.data || {};

        const productData =
          Array.isArray(data)
            ? data
            : data.products || [];

        setProducts(
          Array.isArray(productData)
            ? productData
            : []
        );

        const apiTotalPages =
          Number(
            data.totalPages ??
              data.pagination?.totalPages
          ) || 0;

        const apiTotalProducts =
          Number(
            data.totalProducts ??
              data.total ??
              data.pagination?.totalProducts ??
              data.pagination?.total
          ) || 0;

        if (apiTotalPages > 0) {
          setTotalPages(apiTotalPages);
        } else if (apiTotalProducts > 0) {
          setTotalPages(
            Math.ceil(
              apiTotalProducts /
                productsPerPage
            )
          );
        } else {
          setTotalPages(
            productData.length <
              productsPerPage
              ? currentPage
              : currentPage + 1
          );
        }

        if (apiTotalProducts > 0) {
          setTotalProducts(
            apiTotalProducts
          );
        } else {
          setTotalProducts(
            productData.length
          );
        }
      } catch (error) {
        console.error(
          "Products API Error:",
          error
        );

        setError(
          error.response?.data?.message ||
            error.message ||
            "Failed to fetch products"
        );

        setProducts([]);
        setTotalPages(1);
        setTotalProducts(0);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [category]);

  const handleLoginRequired = () => {
    toast.warning(
      "Please login first."
    );

    navigate("/login");
  };

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    const variant =
      getVariant(product);

    if (!variant) {
      toast.error(
        "Product variant is not available"
      );
      return;
    }

    if (
      Number(variant.stock) <= 0
    ) {
      toast.error(
        "Product is out of stock"
      );
      return;
    }

    const alreadyInCart =
      cart.some(
        (item) =>
          String(
            item._id ||
              item.product
          ) ===
          String(product._id)
      );

    if (alreadyInCart) {
      toast.info(
        <div className="existing-cart-toast">
          <span>
            Product is already in
            your cart
          </span>

          <Link
            to="/cart"
            className="existing-cart-link"
          >
            Go to Cart
          </Link>
        </div>
      );

      return;
    }

    const finalPrice =
      getFinalPrice(variant);

    dispatch(
      addToCart({
        _id: product._id,

        product: product._id,

        name: product.name,

        variantId: variant._id,

        variant,

        attributes:
          Object.fromEntries(
            getAttributes(
              variant.attributes
            )
          ),

        price: finalPrice,

        originalPrice:
          Number(
            variant.price
          ) || 0,

        stock:
          Number(
            variant.stock
          ) || 0,

        images:
          variant.images || [],

        image:
          variant.images?.[0] ||
          "",

        quantity: 1,
      })
    );

    toast.success(
      `${product.name} added to cart`
    );
  };

  const handleWishlist = (
    event,
    product
  ) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    const isWishlisted =
      wishlist.some(
        (item) =>
          String(item._id) ===
          String(product._id)
      );

    dispatch(
      toggleWishlist(product)
    );

    if (isWishlisted) {
      toast.info(
        `${product.name} removed from favorites`
      );
    } else {
      toast.success(
        `${product.name} added to favorites`
      );
    }
  };

  const sortedProducts =
    [...products].sort(
      (a, b) => {
        const variantA =
          getVariant(a);

        const variantB =
          getVariant(b);

        if (sort === "low") {
          return (
            getFinalPrice(
              variantA
            ) -
            getFinalPrice(
              variantB
            )
          );
        }

        if (sort === "high") {
          return (
            getFinalPrice(
              variantB
            ) -
            getFinalPrice(
              variantA
            )
          );
        }

        return (
          new Date(
            b.createdAt || 0
          ) -
          new Date(
            a.createdAt || 0
          )
        );
      }
    );

  const handlePageChange = (
    page
  ) => {
    if (
      page < 1 ||
      page > totalPages ||
      page === currentPage
    ) {
      return;
    }

    setCurrentPage(page);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 7) {
      for (
        let i = 1;
        i <= totalPages;
        i++
      ) {
        pages.push(i);
      }

      return pages;
    }

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push("...");
    }

    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-heading">
          <span className="catalog-eyebrow">
            OUR COLLECTION
          </span>

          <h1>
            All Products
          </h1>

          <p>
            Explore our collection
            of quality products made
            for you.
          </p>
        </div>

        <div className="catalog-filters">
          <div className="catalog-filter-group">
            <label htmlFor="catalog-category">
              Category
            </label>

            <select
              id="catalog-category"
              value={category}
              onChange={(e) => {
                setCategory(
                  e.target.value
                );
                setCurrentPage(1);
              }}
            >
              <option value="">
                All Categories
              </option>

              {categoryLoading ? (
                <option disabled>
                  Loading categories...
                </option>
              ) : (
                categories.map(
                  (item) => (
                    <option
                      key={item._id}
                      value={item._id}
                    >
                      {item.name}
                    </option>
                  )
                )
              )}
            </select>
          </div>

          <div className="catalog-filter-group">
            <label htmlFor="catalog-sort">
              Sort By
            </label>

            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) =>
                setSort(
                  e.target.value
                )
              }
            >
              <option value="newest">
                Newest First
              </option>

              <option value="low">
                Price: Low to High
              </option>

              <option value="high">
                Price: High to Low
              </option>
            </select>
          </div>
        </div>
      </section>

      {loading && (
        <div className="catalog-message">
          Loading products...
        </div>
      )}

      {error && (
        <div className="catalog-message catalog-error">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        sortedProducts.length > 0 && (
          <section className="catalog-products-section">
            <div className="catalog-results">
              <p>
                {totalProducts ||
                  sortedProducts.length}{" "}
                {(
                  totalProducts ||
                  sortedProducts.length
                ) === 1
                  ? "product"
                  : "products"}
              </p>
            </div>

            <div className="catalog-grid">
              {sortedProducts.map(
                (product) => {
                  const variant =
                    getVariant(
                      product
                    );

                  const image =
                    variant?.images?.[0] ||
                    product?.images?.[0] ||
                    product?.image ||
                    "";

                  const finalPrice =
                    getFinalPrice(
                      variant
                    );

                  const originalPrice =
                    Number(
                      variant?.price
                    ) || 0;

                  const hasDiscount =
                    finalPrice <
                    originalPrice;

                  const discountText =
                    getDiscountText(
                      variant
                    );

                  const categoryName =
                    getCategoryName(
                      product.category
                    );

                  const isWishlisted =
                    wishlist.some(
                      (item) =>
                        String(
                          item._id
                        ) ===
                        String(
                          product._id
                        )
                    );

                  const stock =
                    Number(
                      variant?.stock
                    ) || 0;

                  return (
                    <div
                      className="catalog-card"
                      key={
                        product._id
                      }
                    >
                      <Link
                        to={`/products/${product._id}`}
                        className="catalog-image-link"
                      >
                        <div className="catalog-image-box">
                          {image ? (
                            <img
                              src={getImageUrl(
                                image
                              )}
                              alt={
                                product.name
                              }
                              className="catalog-product-image"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  "none";

                                const parent =
                                  event
                                    .currentTarget
                                    .parentElement;

                                if (
                                  parent &&
                                  !parent.querySelector(
                                    ".catalog-no-image"
                                  )
                                ) {
                                  const div =
                                    document.createElement(
                                      "div"
                                    );

                                  div.className =
                                    "catalog-no-image";

                                  div.textContent =
                                    "No Image";

                                  parent.appendChild(
                                    div
                                  );
                                }
                              }}
                            />
                          ) : (
                            <div className="catalog-no-image">
                              No Image
                            </div>
                          )}

                          {hasDiscount &&
                            discountText && (
                              <span className="catalog-discount">
                                {
                                  discountText
                                }
                              </span>
                            )}

                          <button
                            type="button"
                            className={`catalog-heart ${
                              isWishlisted
                                ? "catalog-heart-active"
                                : ""
                            }`}
                            onClick={(
                              event
                            ) =>
                              handleWishlist(
                                event,
                                product
                              )
                            }
                            aria-label={
                              isWishlisted
                                ? "Remove from wishlist"
                                : "Add to wishlist"
                            }
                          >
                            <Heart
                              size={
                                19
                              }
                              color={
                                isWishlisted
                                  ? "#ee0f0f"
                                  : "currentColor"
                              }
                              fill={
                                isWishlisted
                                  ? "#e61818"
                                  : "none"
                              }
                              strokeWidth={
                                1.8
                              }
                            />
                          </button>
                        </div>
                      </Link>

                      <div className="catalog-info">
                        {categoryName && (
                          <span className="catalog-category">
                            {
                              categoryName
                            }
                          </span>
                        )}

                        <h3>
                          {
                            product.name
                          }
                        </h3>

                        {variant &&
                          getAttributes(
                            variant.attributes
                          ).length >
                            0 && (
                            <div className="catalog-attributes">
                              {getAttributes(
                                variant.attributes
                              )
                                .slice(
                                  0,
                                  3
                                )
                                .map(
                                  ([
                                    key,
                                    value,
                                  ]) => (
                                    <span
                                      key={
                                        key
                                      }
                                    >
                                      {
                                        key
                                      }
                                      :{" "}
                                      {
                                        value
                                      }
                                    </span>
                                  )
                                )}
                            </div>
                          )}

                        <p className="catalog-description">
                          {
                            product.description
                          }
                        </p>

                        <div className="catalog-bottom">
                          <div className="catalog-price-area">
                            <span className="catalog-price">
                              ₹
                              {Math.round(
                                finalPrice
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </span>

                            {hasDiscount && (
                              <span className="catalog-old-price">
                                ₹
                                {Math.round(
                                  originalPrice
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            className="catalog-cart"
                            onClick={() =>
                              handleAddToCart(
                                product
                              )
                            }
                            disabled={
                              isAuthenticated &&
                              (!variant ||
                                stock <=
                                  0)
                            }
                          >
                            <ShoppingCart
                              size={
                                16
                              }
                            />

                            {stock >
                            0
                              ? "Add"
                              : "Out"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>

            {totalPages > 1 && (
              <div className="catalog-pagination">
                <button
                  type="button"
                  className="catalog-pagination-arrow"
                  onClick={() =>
                    handlePageChange(
                      currentPage -
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    1
                  }
                  aria-label="Previous page"
                >
                  <ChevronLeft
                    size={18}
                  />
                </button>

                <div className="catalog-pagination-pages">
                  {getPageNumbers().map(
                    (
                      page,
                      index
                    ) =>
                      page ===
                      "..." ? (
                        <span
                          key={`dots-${index}`}
                          className="catalog-pagination-dots"
                        >
                          ...
                        </span>
                      ) : (
                        <button
                          key={
                            page
                          }
                          type="button"
                          className={`catalog-pagination-page ${
                            currentPage ===
                            page
                              ? "catalog-pagination-page-active"
                              : ""
                          }`}
                          onClick={() =>
                            handlePageChange(
                              page
                            )
                          }
                        >
                          {
                            page
                          }
                        </button>
                      )
                  )}
                </div>

                <button
                  type="button"
                  className="catalog-pagination-arrow"
                  onClick={() =>
                    handlePageChange(
                      currentPage +
                        1
                    )
                  }
                  disabled={
                    currentPage ===
                    totalPages
                  }
                  aria-label="Next page"
                >
                  <ChevronRight
                    size={18}
                  />
                </button>
              </div>
            )}
          </section>
        )}

      {!loading &&
        !error &&
        sortedProducts.length ===
          0 && (
          <div className="catalog-message">
            No products found.
          </div>
        )}
    </div>
  );
};

export default Products;