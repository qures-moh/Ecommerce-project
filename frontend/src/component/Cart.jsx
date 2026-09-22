import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  Truck,
  Headphones,
} from "lucide-react";

import {
  increaseQuantity,
  decreaseQuantity,
  removeFromCart,
  clearCart,
} from "../utils/cartSlice";

import api from "../utils/axios";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const cart = useSelector((state) => state.cart || []);

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
      api.defaults.baseURL || "http://localhost:3000/api";

    const cleanBaseURL = baseURL.replace(/\/api\/?$/, "");

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${cleanBaseURL}/${cleanImage}`;
  };

  const getVariant = (product) => {
    if (!product) {
      return null;
    }

    if (product.variant) {
      return product.variant;
    }

    if (product.selectedVariant) {
      return product.selectedVariant;
    }

    return null;
  };

  const getVariantAttributes = (product) => {
    const variant = getVariant(product);

    if (!variant?.attributes) {
      return {};
    }

    if (variant.attributes instanceof Map) {
      return Object.fromEntries(variant.attributes);
    }

    return variant.attributes;
  };

  const getProductImage = (product) => {
    const variant = getVariant(product);

    if (
      variant?.images &&
      Array.isArray(variant.images) &&
      variant.images.length > 0
    ) {
      return variant.images[0];
    }

    if (
      product.images &&
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    if (product.image) {
      return product.image;
    }

    return "";
  };

  const getOriginalPrice = (product) => {
    const variant = getVariant(product);

    if (variant) {
      return Number(variant.price) || 0;
    }

    return Number(product.price) || 0;
  };

  const getDiscount = (product) => {
    const variant = getVariant(product);

    const price = getOriginalPrice(product);

    const discountType = variant
      ? variant.discountType
      : product.discountType;

    const discountValue = variant
      ? Number(variant.discountValue) || 0
      : Number(product.discountValue) || 0;

    if (!discountType || discountValue <= 0) {
      return 0;
    }

    if (discountType === "percentage") {
      return (price * discountValue) / 100;
    }

    if (discountType === "flat") {
      return discountValue;
    }

    return 0;
  };

  const getFinalPrice = (product) => {
    const price = getOriginalPrice(product);
    const discount = getDiscount(product);

    return Math.max(
      0,
      Number((price - discount).toFixed(2))
    );
  };

  const subtotal = cart.reduce((total, product) => {
    const price = getOriginalPrice(product);
    const quantity = Number(product.quantity) || 0;

    return total + price * quantity;
  }, 0);

  const discount = cart.reduce((total, product) => {
    return (
      total +
      getDiscount(product) *
        (Number(product.quantity) || 0)
    );
  }, 0);

  const discountedSubtotal = Math.max(
    0,
    subtotal - discount
  );

  const shipping = discountedSubtotal >= 499 ? 0 : 50;

  const total = discountedSubtotal + shipping;

  return (
    <div className="shop-cart-page">
      <div className="shop-cart-container">
        <div className="shop-cart-heading">
          <div>
            <h1>My Cart</h1>
            <p>
              Review your items and proceed to checkout.
            </p>
          </div>

          <span className="shop-cart-count">
            {cart.length}{" "}
            {cart.length === 1 ? "item" : "items"}
          </span>
        </div>

        {cart.length === 0 ? (
          <div className="shop-cart-empty">
            <div className="shop-cart-empty-icon">
              <ShoppingCartIcon />
            </div>

            <h2>Your cart is empty</h2>

            <p>
              Looks like you haven't added anything to your
              cart yet.
            </p>

            <Link
              to="/products"
              className="shop-cart-browse-button"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="shop-cart-layout">
            <div className="shop-cart-left">
              <div className="shop-cart-items">
                {cart.map((product, index) => {
                  const productDiscount =
                    getDiscount(product);

                  const price =
                    getOriginalPrice(product);

                  const finalPrice =
                    getFinalPrice(product);

                  const productImage =
                    getProductImage(product);

                  const attributes =
                    getVariantAttributes(product);

                  const categoryName =
                    typeof product.category === "object"
                      ? product.category?.name
                      : product.category;

                  const subcategoryName =
                    typeof product.subcategory === "object"
                      ? product.subcategory?.name
                      : product.subcategory;

                  return (
                    <div
                      className="shop-cart-item"
                      key={`${product._id}-${product.variantId}-${index}`}
                    >
                      <Link
                        to={`/products/${product._id}`}
                        className="shop-cart-product-image"
                      >
                        {productImage ? (
                          <img
                            src={getImageUrl(productImage)}
                            alt={product.name}
                          />
                        ) : (
                          <div className="shop-cart-no-image">
                            No Image
                          </div>
                        )}
                      </Link>

                      <div className="shop-cart-product-details">
                        <span className="shop-cart-category">
                          {subcategoryName ||
                            categoryName ||
                            "Product"}
                        </span>

                        <h2>{product.name}</h2>

                        {Object.entries(attributes).map(
                          ([key, value]) => (
                            <p key={key}>
                              <strong>
                                {key}:
                              </strong>{" "}
                              {value}
                            </p>
                          )
                        )}

                        {product.description && (
                          <p>
                            {product.description}
                          </p>
                        )}

                        <div className="shop-cart-price">
                          ₹
                          {Math.round(
                            finalPrice
                          ).toLocaleString("en-IN")}

                          {productDiscount > 0 && (
                            <span>
                              ₹
                              {Math.round(
                                price
                              ).toLocaleString("en-IN")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shop-cart-quantity">
                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              decreaseQuantity({
                                productId:
                                  product._id,
                                variantId:
                                  product.variantId,
                              })
                            )
                          }
                          aria-label="Decrease quantity"
                        >
                          <Minus size={15} />
                        </button>

                        <span>
                          {product.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            dispatch(
                              increaseQuantity({
                                productId:
                                  product._id,
                                variantId:
                                  product.variantId,
                              })
                            )
                          }
                          aria-label="Increase quantity"
                        >
                          <Plus size={15} />
                        </button>
                      </div>

                      <div className="shop-cart-item-total">
                        ₹
                        {Math.round(
                          finalPrice *
                            product.quantity
                        ).toLocaleString("en-IN")}
                      </div>

                      <button
                        type="button"
                        className="shop-cart-remove"
                        onClick={() =>
                          dispatch(
                            removeFromCart({
                              productId:
                                product._id,
                              variantId:
                                product.variantId,
                            })
                          )
                        }
                        aria-label="Remove product"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <div className="shop-cart-actions">
                <Link
                  to="/products"
                  className="shop-cart-continue"
                >
                  <ArrowLeft size={17} />
                  Continue Shopping
                </Link>

                <button
                  type="button"
                  className="shop-cart-clear"
                  onClick={() =>
                    dispatch(clearCart())
                  }
                >
                  <Trash2 size={16} />
                  Clear Cart
                </button>
              </div>
            </div>

            <div className="shop-cart-summary">
              <div className="shop-cart-summary-header">
                <h2>Order Summary</h2>

                <div className="shop-cart-subtotal-box">
                  <span>
                    Subtotal ({cart.length}{" "}
                    {cart.length === 1
                      ? "item"
                      : "items"})
                  </span>

                  <strong>
                    ₹
                    {Math.round(
                      subtotal
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="shop-cart-summary-boxes">
                <div className="shop-cart-summary-box">
                  <span>Discount</span>

                  <strong className="shop-cart-discount-value">
                    - ₹
                    {Math.round(
                      discount
                    ).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="shop-cart-summary-box">
                  <span>Shipping</span>

                  <strong>
                    {shipping === 0
                      ? "Free"
                      : `₹${shipping}`}
                  </strong>
                </div>
              </div>

              <div className="shop-cart-total-box">
                <span>Total</span>

                <strong>
                  ₹
                  {Math.round(
                    total
                  ).toLocaleString("en-IN")}
                </strong>
              </div>

              <button
                type="button"
                className="shop-cart-checkout"
                onClick={() =>
                  navigate("/checkout")
                }
              >
                <span>
                  Proceed to Checkout
                </span>

                <ArrowRight size={18} />
              </button>

              <div className="shop-cart-services">
                <div className="shop-cart-service">
                  <div className="shop-cart-service-icon">
                    <ShieldCheck size={20} />
                  </div>

                  <div>
                    <h4>
                      Secure Payments
                    </h4>

                    <p>
                      Your payment information is
                      safe with us.
                    </p>
                  </div>
                </div>

                <div className="shop-cart-service">
                  <div className="shop-cart-service-icon">
                    <Truck size={20} />
                  </div>

                  <div>
                    <h4>
                      Fast Delivery
                    </h4>

                    <p>
                      Quick and reliable delivery.
                    </p>
                  </div>
                </div>

                <div className="shop-cart-service">
                  <div className="shop-cart-service-icon">
                    <Headphones size={20} />
                  </div>

                  <div>
                    <h4>
                      Easy Returns
                    </h4>

                    <p>
                      Hassle-free returns within 7
                      days.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ShoppingCartIcon = () => {
  return (
    <span className="shop-cart-empty-cart-icon">
      🛒
    </span>
  );
};

export default Cart;