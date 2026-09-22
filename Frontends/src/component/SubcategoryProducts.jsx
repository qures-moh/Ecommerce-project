import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingBag,
  ShoppingCart,
  Check,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../utils/cartSlice";
import api from "../utils/axios";

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

  const baseURL =
    api.defaults.baseURL ||
    "http://localhost:3000/api";

  const cleanBaseURL = baseURL.replace(
    /\/api\/?$/,
    ""
  );

  const cleanImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${cleanBaseURL}/${cleanImage}`;
};

const getVariantFinalPrice = (variant) => {
  const price =
    Number(variant?.price) || 0;

  const discountValue =
    Number(variant?.discountValue) || 0;

  if (
    variant?.discountType ===
    "percentage"
  ) {
    return Math.max(
      0,
      price -
        (price * discountValue) / 100
    );
  }

  if (
    variant?.discountType === "flat"
  ) {
    return Math.max(
      0,
      price - discountValue
    );
  }

  return price;
};

const getProductVariants = (product) => {
  if (
    !Array.isArray(product?.variants)
  ) {
    return [];
  }

  return product.variants.filter(
    (variant) =>
      variant?.isActive !== false
  );
};

const getProductStats = (product) => {
  const variants =
    getProductVariants(product);

  if (!variants.length) {
    return {
      minPrice: 0,
      maxPrice: 0,
      minFinalPrice: 0,
      maxFinalPrice: 0,
      totalStock: 0,
      hasDiscount: false,
      maxDiscount: 0,
    };
  }

  const prices = variants.map(
    (variant) =>
      Number(variant?.price) || 0
  );

  const finalPrices =
    variants.map((variant) =>
      getVariantFinalPrice(variant)
    );

  const totalStock =
    variants.reduce(
      (total, variant) =>
        total +
        (Number(variant?.stock) || 0),
      0
    );

  const discounts = variants.map(
    (variant) => {
      const price =
        Number(variant?.price) || 0;

      const discount =
        Number(
          variant?.discountValue
        ) || 0;

      if (
        variant?.discountType ===
        "percentage"
      ) {
        return discount;
      }

      if (
        variant?.discountType ===
          "flat" &&
        price > 0
      ) {
        return (
          (discount / price) * 100
        );
      }

      return 0;
    }
  );

  const maxDiscount =
    discounts.length
      ? Math.max(...discounts)
      : 0;

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
    minFinalPrice:
      Math.min(...finalPrices),
    maxFinalPrice:
      Math.max(...finalPrices),
    totalStock,
    hasDiscount:
      maxDiscount > 0,
    maxDiscount,
  };
};

const getProductImage = (product) => {
  const variants =
    getProductVariants(product);

  for (const variant of variants) {
    if (
      Array.isArray(
        variant?.images
      ) &&
      variant.images.length > 0
    ) {
      return getImageUrl(
        variant.images[0]
      );
    }
  }

  return "";
};

const getVariantDiscountText = (
  variant
) => {
  const discount =
    Number(
      variant?.discountValue
    ) || 0;

  if (
    !discount ||
    !variant?.discountType
  ) {
    return "";
  }

  if (
    variant.discountType ===
    "percentage"
  ) {
    return `${discount}% OFF`;
  }

  if (
    variant.discountType === "flat"
  ) {
    return `₹${discount.toLocaleString(
      "en-IN"
    )} OFF`;
  }

  return "";
};

const formatPrice = (price) => {
  return `₹${Number(
    price || 0
  ).toLocaleString("en-IN")}`;
};

const formatPriceRange = (
  min,
  max
) => {
  if (min === max) {
    return formatPrice(min);
  }

  return `${formatPrice(
    min
  )} - ${formatPrice(max)}`;
};

const getFirstAvailableVariant = (
  product
) => {
  const variants =
    getProductVariants(product);

  return (
    variants.find(
      (variant) =>
        Number(variant?.stock) > 0
    ) ||
    variants[0] ||
    null
  );
};

export default function SubcategoryProducts() {
  const {
    categoryId,
    subcategoryId,
  } = useParams();

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector(
    (state) => state.cart
  );

  const [subcategory, setSubcategory] =
    useState(null);

  const [products, setProducts] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const [
          subcategoryResponse,
          productResponse,
        ] = await Promise.all([
          api.get(
            `/subcategories/${subcategoryId}`
          ),
          api.get(
            `/products?category=${categoryId}&subcategory=${subcategoryId}`
          ),
        ]);

        setSubcategory(
          subcategoryResponse.data
            ?.subcategory || null
        );

        setProducts(
          Array.isArray(
            productResponse.data
              ?.products
          )
            ? productResponse.data
                .products
            : []
        );
      } catch (error) {
        console.error(
          "FAILED TO FETCH SUBCATEGORY PRODUCTS:",
          error
        );

        setError(
          error.response?.data
            ?.message ||
            "Failed to load products"
        );
      } finally {
        setLoading(false);
      }
    };

    if (
      categoryId &&
      subcategoryId
    ) {
      fetchProducts();
    }
  }, [
    categoryId,
    subcategoryId,
  ]);

  const getCartItemKey = (
    productId,
    variantId
  ) => {
    return `${productId}_${variantId}`;
  };

  const isInCart = (
    productId,
    variantId
  ) => {
    return cart.some((item) => {
      const itemVariantId =
        item.variantId ||
        item.variant?._id;

      return (
        item._id === productId &&
        itemVariantId === variantId
      );
    });
  };

  const handleAddToCart = (
    e,
    product
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const variants =
      getProductVariants(product);

    if (!variants.length) {
      return;
    }

    if (variants.length > 1) {
      navigate(
        `/products/${product._id}`
      );
      return;
    }

    const variant =
      getFirstAvailableVariant(
        product
      );

    if (!variant) {
      return;
    }

    if (
      Number(variant.stock) <= 0
    ) {
      return;
    }

    const alreadyInCart =
      isInCart(
        product._id,
        variant._id
      );

    if (alreadyInCart) {
      return;
    }

    const cartProduct = {
      _id: product._id,
      name: product.name,
      description:
        product.description,
      category: product.category,
      subcategory:
        product.subcategory,
      variantId: variant._id,
      variant: {
        _id: variant._id,
        attributes:
          variant.attributes,
        price: Number(
          variant.price
        ),
        discountType:
          variant.discountType,
        discountValue: Number(
          variant.discountValue
        ) || 0,
        stock: Number(
          variant.stock
        ) || 0,
        images:
          Array.isArray(
            variant.images
          )
            ? variant.images
            : [],
      },
      price: getVariantFinalPrice(
        variant
      ),
      originalPrice:
        Number(variant.price) || 0,
      discountType:
        variant.discountType,
      discountValue:
        Number(
          variant.discountValue
        ) || 0,
      stock:
        Number(variant.stock) || 0,
      images:
        Array.isArray(
          variant.images
        )
          ? variant.images
          : [],
      quantity: 1,
    };

    dispatch(
      addToCart(cartProduct)
    );
  };

  if (loading) {
    return (
      <section className="subcat-products-page">
        <div className="subcat-products-container">
          <div className="subcat-products-loading">
            <div className="subcat-products-loader"></div>

            <p>
              Loading products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="subcat-products-page">
        <div className="subcat-products-container">
          <div className="subcat-products-error">
            <div className="subcat-products-error-icon">
              !
            </div>

            <h2>
              Something went wrong
            </h2>

            <p>{error}</p>

            <Link
              to={`/categories/${categoryId}`}
              className="subcat-products-back"
            >
              <ArrowLeft size={17} />
              Back to Subcategories
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="subcat-products-page">
      <div className="subcat-products-container">
        <Link
          to={`/categories/${categoryId}`}
          className="subcat-products-back"
        >
          <ArrowLeft size={17} />
          Back
        </Link>

        <div className="subcat-products-heading">
          <div className="subcat-products-heading-content">
            <span>
              SUBCATEGORY
            </span>

            <h1>
              {subcategory?.name ||
                "Products"}
            </h1>

            {subcategory?.description && (
              <p>
                {
                  subcategory.description
                }
              </p>
            )}
          </div>

          <div className="subcat-products-count">
            <strong>
              {products.length}
            </strong>

            <span>
              {products.length === 1
                ? "Product"
                : "Products"}
            </span>
          </div>
        </div>

        {products.length === 0 ? (
          <div className="subcat-products-empty">
            <ShoppingBag size={45} />

            <h2>
              No products available
            </h2>

            <p>
              There are currently no
              products in this
              subcategory.
            </p>
          </div>
        ) : (
          <div className="subcat-products-grid">
            {products.map(
              (product) => {
                const variants =
                  getProductVariants(
                    product
                  );

                const stats =
                  getProductStats(
                    product
                  );

                const image =
                  getProductImage(
                    product
                  );

                const firstVariant =
                  getFirstAvailableVariant(
                    product
                  );

                const hasMultipleVariants =
                  variants.length > 1;

                const outOfStock =
                  stats.totalStock <= 0;

                const productInCart =
                  firstVariant
                    ? isInCart(
                        product._id,
                        firstVariant._id
                      )
                    : false;

                const discountText =
                  firstVariant
                    ? getVariantDiscountText(
                        firstVariant
                      )
                    : "";

                return (
                  <div
                    key={product._id}
                    className="subcat-product-card"
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="subcat-product-link"
                    >
                      <div className="subcat-product-image">
                        {image ? (
                          <img
                            src={image}
                            alt={
                              product.name
                            }
                            onError={(
                              e
                            ) => {
                              e.currentTarget.style.display =
                                "none";
                            }}
                          />
                        ) : (
                          <div className="subcat-product-no-image">
                            <ShoppingBag
                              size={30}
                            />
                          </div>
                        )}

                        {stats.hasDiscount && (
                          <span className="subcat-product-discount">
                            {hasMultipleVariants
                              ? `Up to ${Math.round(
                                  stats.maxDiscount
                                )}% OFF`
                              : discountText}
                          </span>
                        )}

                        {outOfStock && (
                          <span className="subcat-product-stock">
                            Out of Stock
                          </span>
                        )}
                      </div>

                      <div className="subcat-product-info">
                        <h3>
                          {product.name}
                        </h3>

                        <span className="subcat-product-category">
                          {product
                            .subcategory
                            ?.name ||
                            subcategory?.name}
                        </span>

                        <div className="subcat-product-price">
                          <strong>
                            {formatPriceRange(
                              stats.minFinalPrice,
                              stats.maxFinalPrice
                            )}
                          </strong>

                          {stats.hasDiscount && (
                            <del>
                              {formatPriceRange(
                                stats.minPrice,
                                stats.maxPrice
                              )}
                            </del>
                          )}
                        </div>
                      </div>
                    </Link>

                    <button
                      type="button"
                      className={`subcat-add-cart ${
                        productInCart
                          ? "added"
                          : ""
                      }`}
                      disabled={
                        outOfStock
                      }
                      onClick={(e) =>
                        handleAddToCart(
                          e,
                          product
                        )
                      }
                    >
                      {productInCart ? (
                        <>
                          <Check
                            size={17}
                          />
                          Added to Cart
                        </>
                      ) : hasMultipleVariants ? (
                        <>
                          <ShoppingCart
                            size={17}
                          />
                          Select Options
                        </>
                      ) : (
                        <>
                          <ShoppingCart
                            size={17}
                          />
                          Add to Cart
                        </>
                      )}
                    </button>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </section>
  );
}