import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Minus,
  Plus,
  ShoppingCart,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import api from "../utils/axios";
import { addToCart } from "../utils/cartSlice";
import { toggleWishlist } from "../utils/wishlist";

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

const getVariants = (product) => {
  if (!Array.isArray(product?.variants)) {
    return [];
  }

  return product.variants.filter(
    (variant) => variant?.isActive !== false
  );
};

const getAttributes = (variant) => {
  if (!variant?.attributes) {
    return {};
  }

  if (variant.attributes instanceof Map) {
    return Object.fromEntries(variant.attributes.entries());
  }

  if (
    typeof variant.attributes === "object" &&
    !Array.isArray(variant.attributes)
  ) {
    return variant.attributes;
  }

  return {};
};

const getAttributeOptions = (
  variants,
  selectedAttributes = {}
) => {
  const groups = {};

  variants
    .filter((variant) => Number(variant?.stock) > 0)
    .forEach((variant) => {
      const attributes = getAttributes(variant);

      Object.entries(attributes).forEach(([key, value]) => {
        const matchesOtherAttributes = Object.entries(
          selectedAttributes
        ).every(([selectedKey, selectedValue]) => {
          if (selectedKey === key) {
            return true;
          }

          return (
            attributes[selectedKey] !== undefined &&
            String(attributes[selectedKey]) ===
              String(selectedValue)
          );
        });

        if (!matchesOtherAttributes) {
          return;
        }

        if (!groups[key]) {
          groups[key] = [];
        }

        const stringValue = String(value);

        if (!groups[key].includes(stringValue)) {
          groups[key].push(stringValue);
        }
      });
    });

  return groups;
};

const getVariantFinalPrice = (variant) => {
  const price = Number(variant?.price) || 0;
  const discount = Number(variant?.discountValue) || 0;

  if (variant?.discountType === "percentage") {
    return Math.max(
      0,
      price - (price * discount) / 100
    );
  }

  if (variant?.discountType === "flat") {
    return Math.max(0, price - discount);
  }

  return price;
};

const getDiscountPercentage = (variant) => {
  const price = Number(variant?.price) || 0;
  const discount = Number(variant?.discountValue) || 0;

  if (variant?.discountType === "percentage") {
    return Math.round(discount);
  }

  if (variant?.discountType === "flat" && price > 0) {
    return Math.round((discount / price) * 100);
  }

  return 0;
};

const getVariantImages = (variant) => {
  if (!Array.isArray(variant?.images)) {
    return [];
  }

  return variant.images.filter(
    (image) => typeof image === "string" && image.length > 0
  );
};

const findMatchingVariant = (
  variants,
  selectedAttributes
) => {
  return variants.find((variant) => {
    const attributes = getAttributes(variant);
    const keys = Object.keys(attributes);

    if (!keys.length) {
      return false;
    }

    return keys.every(
      (key) =>
        selectedAttributes[key] !== undefined &&
        String(attributes[key]) ===
          String(selectedAttributes[key])
    );
  });
};

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart || []);
  const wishlist = useSelector((state) => state.wishlist || []);

  const user = useSelector((state) => state.user);

  const isAuthenticated = Boolean(user);

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAttributes, setSelectedAttributes] =
    useState({});
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(`/products/${id}`);

        const productData = response.data?.product;

        if (!productData) {
          throw new Error("Product not found");
        }

        setProduct(productData);

        const productVariants = getVariants(productData);

        if (productVariants.length > 0) {
          const firstVariant =
            productVariants.find(
              (variant) => Number(variant.stock) > 0
            ) || productVariants[0];

          setSelectedVariant(firstVariant);

          const attributes = getAttributes(firstVariant);

          setSelectedAttributes(attributes);

          const variantImages =
            getVariantImages(firstVariant);

          setSelectedImage(variantImages[0] || "");
        } else {
          setSelectedVariant(null);
          setSelectedAttributes({});
          setSelectedImage("");
        }
      } catch (error) {
        console.error("FETCH PRODUCT ERROR:", error);

        setError(
          error.response?.data?.message ||
            "Failed to load product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const variants = getVariants(product);

  const attributeOptions = getAttributeOptions(
    variants,
    selectedAttributes
  );

  const images = getVariantImages(selectedVariant);

  const finalPrice = selectedVariant
    ? getVariantFinalPrice(selectedVariant)
    : 0;

  const originalPrice = selectedVariant
    ? Number(selectedVariant.price) || 0
    : 0;

  const discountPercentage = selectedVariant
    ? getDiscountPercentage(selectedVariant)
    : 0;

  const stock = Number(selectedVariant?.stock) || 0;

  const outOfStock = stock <= 0;

  const hasDiscount = finalPrice < originalPrice;

  const categoryName =
    typeof product?.category === "object"
      ? product.category?.name
      : product?.category;

  const subcategoryName =
    typeof product?.subcategory === "object"
      ? product.subcategory?.name
      : product?.subcategory;

  const cartItem = cart.find((item) => {
    const itemProductId = item.product || item._id;

    const itemVariantId =
      item.variantId || item.variant?._id;

    return (
      String(itemProductId) === String(product?._id) &&
      String(itemVariantId) ===
        String(selectedVariant?._id)
    );
  });

  const cartQuantity = Number(cartItem?.quantity) || 0;

  const isWishlisted =
    product &&
    wishlist.some(
      (item) =>
        String(item._id) === String(product._id)
    );

  const handleLoginRequired = () => {
    toast.warning("Please login first.");

    navigate("/login");
  };

  const handleAttributeChange = (
    attributeName,
    value
  ) => {
    const newAttributes = {
      ...selectedAttributes,
      [attributeName]: value,
    };

    const matchingVariant = findMatchingVariant(
      variants.filter(
        (variant) => Number(variant.stock) > 0
      ),
      newAttributes
    );

    if (matchingVariant) {
      setSelectedAttributes(newAttributes);
      setSelectedVariant(matchingVariant);

      const variantImages =
        getVariantImages(matchingVariant);

      setSelectedImage(variantImages[0] || "");
      setQuantity(1);

      return;
    }

    setSelectedAttributes(newAttributes);
    setSelectedVariant(null);
    setSelectedImage("");
    setQuantity(1);
  };

  const handleImageChange = (image) => {
    setSelectedImage(image);
  };

  const increaseQuantity = () => {
    if (quantity >= stock) {
      toast.info(`Only ${stock} available`);
      return;
    }

    setQuantity((prev) => prev + 1);
  };

  const decreaseQuantity = () => {
    setQuantity((prev) => Math.max(1, prev - 1));
  };

  const createCartProduct = () => {
    if (!product || !selectedVariant) {
      return null;
    }

    const variantImages =
      getVariantImages(selectedVariant);

    const attributes = getAttributes(selectedVariant);

    return {
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      subcategory: product.subcategory,

      variantId: selectedVariant._id,

      variant: {
        _id: selectedVariant._id,
        attributes,
        price: Number(selectedVariant.price) || 0,
        discountType: selectedVariant.discountType,
        discountValue:
          Number(selectedVariant.discountValue) || 0,
        stock: Number(selectedVariant.stock) || 0,
        images: variantImages,
      },

      attributes,

      price: finalPrice,

      originalPrice,

      discountType: selectedVariant.discountType,

      discountValue:
        Number(selectedVariant.discountValue) || 0,

      stock,

      images: variantImages,

      image: variantImages[0] || "",

      quantity: 1,
    };
  };

  const addQuantityToCart = () => {
    const cartProduct = createCartProduct();

    if (!cartProduct) {
      return false;
    }

    for (let i = 0; i < quantity; i++) {
      dispatch(addToCart(cartProduct));
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a valid variant");
      return;
    }

    if (outOfStock) {
      toast.error("Selected variant is out of stock");
      return;
    }

    if (cartItem) {
      toast.info(
        <div className="existing-cart-toast">
          <span>Product is already in your cart</span>

          <button
            type="button"
            className="existing-cart-link"
            onClick={() => {
              toast.dismiss();
              navigate("/cart");
            }}
          >
            Go to Cart
          </button>
        </div>
      );

      return;
    }

    if (quantity > stock) {
      toast.error(`Only ${stock} available`);
      return;
    }

    const added = addQuantityToCart();

    if (!added) {
      return;
    }

    toast.success("Added to cart");
  };

  const handleBuyNow = () => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    if (!selectedVariant) {
      toast.error("Please select a valid variant");
      return;
    }

    if (outOfStock) {
      toast.error("Selected variant is out of stock");
      return;
    }

    if (cartQuantity + quantity > stock) {
      toast.error(`Only ${stock} available`);
      return;
    }

    const added = addQuantityToCart();

    if (!added) {
      return;
    }

    navigate("/checkout");
  };

  const handleWishlist = () => {
    if (!isAuthenticated) {
      handleLoginRequired();
      return;
    }

    if (!product) {
      return;
    }

    dispatch(toggleWishlist(product));

    toast.success(
      isWishlisted
        ? "Removed from wishlist"
        : "Added to wishlist"
    );
  };

  if (loading) {
    return (
      <section className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-loading">
            <div className="product-details-loader"></div>

            <p className="product-loading-text">
              Loading product...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error || !product) {
    return (
      <section className="product-details-page">
        <div className="product-details-container">
          <div className="product-details-error">
            <h2 className="product-error-title product-secondary-heading">
              Product not found
            </h2>

            <p className="product-error-text">
              {error || "Unable to load product"}
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="product-details-page">
      <div className="product-details-container">
        <div className="product-breadcrumb">
          <Link to="/">Home</Link>

          <span>/</span>

          <Link
            to={`/categories/${
              product.category?._id || product.category
            }`}
          >
            {categoryName || "Category"}
          </Link>

          <span>/</span>

          <span>
            {subcategoryName || "Subcategory"}
          </span>

          <span>/</span>

          <span>{product.name}</span>
        </div>

        <button
          type="button"
          className="product-page-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="product-details-layout">
          <div className="product-image-section">
            <div
              className={`product-image-gallery ${
                images.length === 1
                  ? "product-single-image-gallery"
                  : ""
              }`}
            >
              {images.length > 1 && (
                <div className="product-thumbnail-list">
                  {images.map((image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      className={`product-thumbnail ${
                        selectedImage === image
                          ? "product-thumbnail-active"
                          : ""
                      }`}
                      onClick={() =>
                        handleImageChange(image)
                      }
                    >
                      <img
                        src={getImageUrl(image)}
                        alt={`${product.name} ${
                          index + 1
                        }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="product-image-card">
                {hasDiscount && (
                  <span className="product-image-discount">
                    {discountPercentage}% OFF
                  </span>
                )}

                {selectedImage ? (
                  <img
                    src={getImageUrl(selectedImage)}
                    alt={product.name}
                    className="product-main-image"
                  />
                ) : (
                  <div className="product-no-image">
                    No Image Available
                  </div>
                )}

                {outOfStock && (
                  <div className="product-image-out">
                    Out of Stock
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="product-info-section">
            <span className="product-category product-meta-text">
              {subcategoryName ||
                categoryName ||
                "Product"}
            </span>

            <h1 className="product-title product-main-heading">
              {product.name}
            </h1>

            <div className="product-price-row">
              <strong className="product-price">
                {`₹${Math.round(
                  finalPrice
                ).toLocaleString("en-IN")}`}
              </strong>

              {hasDiscount && (
                <>
                  <del className="product-original-price">
                    ₹
                    {Math.round(
                      originalPrice
                    ).toLocaleString("en-IN")}
                  </del>

                  <span className="product-discount">
                    {discountPercentage}% OFF
                  </span>
                </>
              )}
            </div>

            {product.description && (
              <p className="product-description product-body-text">
                {product.description}
              </p>
            )}

            {Object.entries(attributeOptions).map(
              ([attributeName, values]) => (
                <div
                  className="product-variant-selector"
                  key={attributeName}
                >
                  <div className="product-variant-title product-label-text">
                    <strong className="product-option-label">
                      {attributeName}
                    </strong>

                    <span className="product-option-value">
                      {selectedAttributes[
                        attributeName
                      ] || ""}
                    </span>
                  </div>

                  <div className="product-variant-options">
                    {values.map((value) => {
                      const isSelected =
                        String(
                          selectedAttributes[
                            attributeName
                          ]
                        ) === String(value);

                      return (
                        <button
                          key={value}
                          type="button"
                          className={`product-variant-option ${
                            isSelected
                              ? "product-variant-option-active"
                              : ""
                          }`}
                          onClick={() =>
                            handleAttributeChange(
                              attributeName,
                              value
                            )
                          }
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )
            )}

            {selectedVariant && (
              <div className="product-selected-variant">
                {Object.entries(
                  getAttributes(selectedVariant)
                ).map(([key, value]) => (
                  <div key={key}>
                    <span className="product-meta-text">
                      {key}
                    </span>

                    <strong className="product-value-text">
                      {value}
                    </strong>
                  </div>
                ))}
              </div>
            )}

            {!selectedVariant && variants.length > 0 && (
              <div className="product-selected-variant">
                <strong className="product-warning-text">
                  This combination is not available
                </strong>
              </div>
            )}

            <div className="product-stock-row product-label-text">
              <strong className="product-label-text">
                Stock:
              </strong>

              {outOfStock ? (
                <span className="product-stock-out">
                  <span></span>
                  Out of Stock
                </span>
              ) : (
                <span className="product-stock-in">
                  <span></span>
                  In Stock
                  <small className="product-small-text">
                    ({stock} available)
                  </small>
                </span>
              )}
            </div>

            <div className="product-quantity-row product-label-text">
              <strong className="product-label-text">
                Quantity:
              </strong>

              <div className="product-quantity-control">
                <button
                  type="button"
                  onClick={decreaseQuantity}
                  disabled={
                    quantity <= 1 || outOfStock
                  }
                >
                  <Minus size={18} />
                </button>

                <span>{quantity}</span>

                <button
                  type="button"
                  onClick={increaseQuantity}
                  disabled={
                    outOfStock || quantity >= stock
                  }
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            <div className="product-action-row">
              <button
                type="button"
                className={`product-wishlist-button ${
                  isWishlisted
                    ? "product-wishlist-active"
                    : ""
                }`}
                onClick={handleWishlist}
              >
                <Heart
                  size={22}
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
                />
              </button>

              <button
                type="button"
                className="product-cart-button"
                onClick={handleAddToCart}
                disabled={
                  outOfStock || !selectedVariant
                }
              >
                <ShoppingCart size={19} />
                Add to Cart
              </button>

              <button
                type="button"
                className="product-buy-button"
                onClick={handleBuyNow}
                disabled={
                  outOfStock || !selectedVariant
                }
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}