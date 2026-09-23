import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";
import { toast } from "react-toastify";

import { getProducts } from "../utils/productSlice";
import { addToCart } from "../utils/cartSlice";
import { toggleWishlist } from "../utils/wishlist";
import api from "../utils/axios";

const getImageUrl = (image) => {
  if (!image || typeof image !== "string") {
    return "";
  }

  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }

  const baseUrl =
    api.defaults.baseURL?.replace(/\/api\/?$/, "") ||
    "http://localhost:3000";

  const cleanImage = image.replace(/\\/g, "/").replace(/^\/+/, "");

  return `${baseUrl}/${cleanImage}`;
};

const getVariant = (product) => {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return null;
  }

  return (
    product.variants.find((variant) => variant.isActive !== false) ||
    product.variants[0]
  );
};

const getFinalPrice = (variant) => {
  if (!variant) {
    return 0;
  }

  const price = Number(variant.price) || 0;
  const discountValue = Number(variant.discountValue) || 0;

  if (variant.discountType === "percentage") {
    return Math.max(0, price - (price * discountValue) / 100);
  }

  if (variant.discountType === "flat") {
    return Math.max(0, price - discountValue);
  }

  return price;
};

const getDiscountText = (variant) => {
  if (!variant) {
    return "";
  }

  const discountValue = Number(variant.discountValue) || 0;

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

  if (typeof attributes.entries === "function") {
    return Array.from(attributes.entries());
  }

  return Object.entries(attributes);
};

const Products = () => {
  const dispatch = useDispatch();

  const wishlist = useSelector(
    (state) => state.wishlist || state.whishlist || []
  );

  const {
    products = [],
    loading,
    error,
  } = useSelector((state) => state.products);

  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("newest");

  useEffect(() => {
    console.log("API URL:", api.defaults.baseURL);

    const testApi = async () => {
      try {
        const response = await api.get("/products", {
          params: {
            category,
          },
        });

        console.log("DIRECT API RESPONSE:", response.data);
      } catch (error) {
        console.error("DIRECT API ERROR:", error);
      }
    };

    testApi();

    dispatch(getProducts(category));
  }, [dispatch, category]);

  const categories = [
    "All",
    "clothing",
    "Footwear",
    "Electronics",
    "Accessories",
    "Home & Living",
    "Beauty",
    "Sports",
  ];

  const handleAddToCart = (product) => {
    const variant = getVariant(product);

    if (!variant) {
      toast.error("Product variant is not available");
      return;
    }

    if (Number(variant.stock) <= 0) {
      toast.error("Product is out of stock");
      return;
    }

    const finalPrice = getFinalPrice(variant);

    dispatch(
      addToCart({
        _id: product._id,
        product: product._id,
        name: product.name,
        variantId: variant._id,
        variant,
        attributes: Object.fromEntries(getAttributes(variant.attributes)),
        price: finalPrice,
        originalPrice: Number(variant.price) || 0,
        stock: Number(variant.stock) || 0,
        images: variant.images || [],
        image: variant.images?.[0] || "",
        quantity: 1,
      })
    );

    toast.success(`${product.name} added to cart`);
  };

  const handleWishlist = (event, product) => {
    event.preventDefault();
    event.stopPropagation();

    const isWishlisted = wishlist.some(
      (item) => String(item._id) === String(product._id)
    );

    dispatch(toggleWishlist(product));

    if (isWishlisted) {
      toast.info(`${product.name} removed from favorites`);
    } else {
      toast.success(`${product.name} added to favorites`);
    }
  };

  const sortedProducts = [...products].sort((a, b) => {
    const variantA = getVariant(a);
    const variantB = getVariant(b);

    if (sort === "low") {
      return getFinalPrice(variantA) - getFinalPrice(variantB);
    }

    if (sort === "high") {
      return getFinalPrice(variantB) - getFinalPrice(variantA);
    }

    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="catalog-page">
      <section className="catalog-header">
        <div className="catalog-heading">
          <span className="catalog-eyebrow">OUR COLLECTION</span>

          <h1>All Products</h1>

          <p>Explore our collection of quality products made for you.</p>
        </div>

        <div className="catalog-filters">
          <div className="catalog-filter-group">
            <label htmlFor="catalog-category">Category</label>

            <select
              id="catalog-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((item) => (
                <option key={item} value={item === "All" ? "" : item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div className="catalog-filter-group">
            <label htmlFor="catalog-sort">Sort By</label>

            <select
              id="catalog-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="low">Price: Low to High</option>
              <option value="high">Price: High to Low</option>
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

      {!loading && !error && sortedProducts.length > 0 && (
        <section className="catalog-products-section">
          <div className="catalog-results">
            <p>
              {sortedProducts.length}{" "}
              {sortedProducts.length === 1 ? "product" : "products"}
            </p>
          </div>

          <div className="catalog-grid">
            {sortedProducts.map((product) => {
              const variant = getVariant(product);

              const image = variant?.images?.[0] || "";

              const finalPrice = getFinalPrice(variant);

              const originalPrice = Number(variant?.price) || 0;

              const hasDiscount = finalPrice < originalPrice;

              const discountText = getDiscountText(variant);

              const categoryName = getCategoryName(product.category);

              const isWishlisted = wishlist.some(
                (item) => String(item._id) === String(product._id)
              );

              const stock = Number(variant?.stock) || 0;

              return (
                <div className="catalog-card" key={product._id}>
                  <Link
                    to={`/products/${product._id}`}
                    className="catalog-image-link"
                  >
                    <div className="catalog-image-box">
                      {image ? (
                        <img
                          src={getImageUrl(image)}
                          alt={product.name}
                        />
                      ) : (
                        <div className="catalog-no-image">
                          No Image
                        </div>
                      )}

                      {hasDiscount && discountText && (
                        <span className="catalog-discount">
                          {discountText}
                        </span>
                      )}

                      <button
                        type="button"
                        className={`catalog-heart ${
                          isWishlisted
                            ? "catalog-heart-active"
                            : ""
                        }`}
                        onClick={(event) =>
                          handleWishlist(event, product)
                        }
                        aria-label={
                          isWishlisted
                            ? "Remove from wishlist"
                            : "Add to wishlist"
                        }
                      >
                        <Heart
                          size={19}
                          fill={
                            isWishlisted
                              ? "currentColor"
                              : "none"
                          }
                          strokeWidth={1.8}
                        />
                      </button>
                    </div>
                  </Link>

                  <div className="catalog-info">
                    {categoryName && (
                      <span className="catalog-category">
                        {categoryName}
                      </span>
                    )}

                    <h3>{product.name}</h3>

                    {variant &&
                      getAttributes(variant.attributes).length >
                        0 && (
                        <div className="catalog-attributes">
                          {getAttributes(variant.attributes)
                            .slice(0, 3)
                            .map(([key, value]) => (
                              <span key={key}>
                                {key}: {value}
                              </span>
                            ))}
                        </div>
                      )}

                    <p className="catalog-description">
                      {product.description}
                    </p>

                    <div className="catalog-bottom">
                      <div className="catalog-price-area">
                        <span className="catalog-price">
                          ₹{finalPrice.toLocaleString("en-IN")}
                        </span>

                        {hasDiscount && (
                          <span className="catalog-old-price">
                            ₹{originalPrice.toLocaleString("en-IN")}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        className="catalog-cart"
                        onClick={() => handleAddToCart(product)}
                        disabled={!variant || stock <= 0}
                      >
                        <ShoppingCart size={16} />

                        {stock > 0 ? "Add" : "Out"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {!loading &&
        !error &&
        sortedProducts.length === 0 && (
          <div className="catalog-message">
            No products found.
          </div>
        )}
    </div>
  );
};

export default Products;