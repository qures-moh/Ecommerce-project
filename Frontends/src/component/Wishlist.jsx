import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingCart } from "lucide-react";

import { toggleWishlist } from "../utils/wishlist";
import { addToCart } from "../utils/cartSlice";
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

  const cleanImage = image
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");

  return `${baseUrl}/${cleanImage}`;
};

const getVariant = (product) => {
  if (!Array.isArray(product?.variants) || product.variants.length === 0) {
    return null;
  }

  if (product.variantId) {
    const selectedVariant = product.variants.find(
      (variant) => String(variant._id) === String(product.variantId)
    );

    if (selectedVariant) {
      return selectedVariant;
    }
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
    return Math.max(
      0,
      price - (price * discountValue) / 100
    );
  }

  if (variant.discountType === "flat") {
    return Math.max(0, price - discountValue);
  }

  return price;
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

const Wishlist = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const wishlist = useSelector(
    (state) => state.wishlist || state.whishlist || []
  );

  const handleAddToCart = (product) => {
    const variant = getVariant(product);

    if (!variant) {
      navigate(`/products/${product._id}`);
      return;
    }

    if (Number(variant.stock) <= 0) {
      return;
    }

    dispatch(
      addToCart({
        _id: product._id,
        product: product._id,
        name: product.name,
        variantId: variant._id,
        variant,
        attributes: Object.fromEntries(
          getAttributes(variant.attributes)
        ),
        price: getFinalPrice(variant),
        originalPrice: Number(variant.price) || 0,
        stock: Number(variant.stock) || 0,
        images: variant.images || [],
        image: variant.images?.[0] || "",
        quantity: 1,
      })
    );
  };

  return (
    <div className="wish-page">
      <div className="wish-container">

        <div className="wish-header">
          <div>
            <h1>My Wishlist</h1>
            <p>Save your favorite products for later.</p>
          </div>

          <div className="wish-count">
            {wishlist.length}{" "}
            {wishlist.length === 1 ? "item" : "items"}
          </div>
        </div>

        {wishlist.length === 0 ? (
          <div className="wish-empty">

            <div className="wish-empty-icon">
              <Heart size={38} />
            </div>

            <h2>Your wishlist is empty</h2>

            <p>
              You haven't added any products to your wishlist yet.
            </p>

            <Link to="/products">
              Browse Products
            </Link>

          </div>
        ) : (
          <div className="wish-grid">

            {wishlist.map((product) => {
              const variant = getVariant(product);

              const image =
                variant?.images?.[0] ||
                product.image ||
                "";

              const finalPrice =
                getFinalPrice(variant);

              const attributes =
                getAttributes(variant?.attributes);

              return (
                <div
                  className="wish-card"
                  key={`${product._id}-${variant?._id || ""}`}
                >

                  <div className="wish-image">

                    {image ? (
                      <img
                        src={getImageUrl(image)}
                        alt={product.name}
                      />
                    ) : (
                      <div>No Image</div>
                    )}

                    <button
                      type="button"
                      className="wish-remove"
                      onClick={() =>
                        dispatch(toggleWishlist(product))
                      }
                    >
                      <Heart
                        size={21}
                        fill="currentColor"
                      />
                    </button>

                  </div>

                  <div className="wish-info">

                    {product.category &&
                      typeof product.category === "string" && (
                        <span className="wish-category">
                          {product.category}
                        </span>
                      )}

                    <h2>{product.name}</h2>

                    {attributes.length > 0 && (
                      <div className="wish-attributes">

                        {attributes.map(([key, value]) => (
                          <span key={key}>
                            <strong>
                              {key}:
                            </strong>{" "}
                            {value}
                          </span>
                        ))}

                      </div>
                    )}

                    <p>
                      {product.description}
                    </p>

                    <div className="wish-bottom">

                      <div className="wish-price">
                        ₹
                        {finalPrice.toLocaleString(
                          "en-IN"
                        )}
                      </div>

                      <button
                        type="button"
                        className="wish-cart"
                        onClick={() =>
                          handleAddToCart(product)
                        }
                        disabled={
                          !variant ||
                          Number(variant.stock) <= 0
                        }
                      >
                        <ShoppingCart size={17} />

                        {variant &&
                        Number(variant.stock) > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>
    </div>
  );
};

export default Wishlist;