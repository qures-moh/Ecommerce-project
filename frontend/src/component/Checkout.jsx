import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  ShoppingBag,
  Lock,
  CreditCard,
  Banknote,
} from "lucide-react";

import api from "../utils/axios";
import { clearCart } from "../utils/cartSlice";

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart || []);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    paymentMethod: "cod",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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

    if (product.variants && product.variantId) {
      return (
        product.variants.find(
          (variant) =>
            String(variant._id) === String(product.variantId)
        ) || null
      );
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

  const getFinalPrice = (product) => {
    const variant = getVariant(product);

    if (!variant) {
      return Number(product?.price || 0);
    }

    let price = Number(variant.price || 0);

    if (variant.discountType === "flat") {
      price -= Number(variant.discountValue || 0);
    }

    if (variant.discountType === "percentage") {
      price -=
        (price * Number(variant.discountValue || 0)) / 100;
    }

    return Math.max(0, Number(price.toFixed(2)));
  };

  const getProductImage = (product) => {
    const variant = getVariant(product);

    if (variant?.images?.length) {
      return variant.images[0];
    }

    if (product?.image) {
      return product.image;
    }

    if (product?.images?.length) {
      return product.images[0];
    }

    return "";
  };

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

  const subtotal = cart.reduce((total, product) => {
    const finalPrice = getFinalPrice(product);
    const quantity = Number(product.quantity || 1);

    return total + finalPrice * quantity;
  }, 0);

  const shipping = 0;

  const total = subtotal + shipping;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setApiError("");
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (formData.firstName.trim().length < 2) {
      newErrors.firstName =
        "First name must be at least 2 characters";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (formData.lastName.trim().length < 2) {
      newErrors.lastName =
        "Last name must be at least 2 characters";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)
    ) {
      newErrors.email = "Enter a valid email";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone =
        "Enter a valid 10-digit phone number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    } else if (formData.address.trim().length < 5) {
      newErrors.address = "Enter a valid address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state) {
      newErrors.state = "Please select a state";
    }

    if (!formData.pinCode.trim()) {
      newErrors.pinCode = "PIN code is required";
    } else if (!/^\d{6}$/.test(formData.pinCode)) {
      newErrors.pinCode = "PIN code must be 6 digits";
    }

    if (!["cod", "online"].includes(formData.paymentMethod)) {
      newErrors.paymentMethod =
        "Please select a payment method";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    setApiError("");

    if (cart.length === 0) {
      setApiError("Your cart is empty");
      return;
    }

    const isValid = validateForm();

    if (!isValid) {
      return;
    }

    for (const product of cart) {
      if (!product.variantId) {
        setApiError(
          `${product.name} does not have a selected variant`
        );
        return;
      }

      if (!getVariant(product)) {
        setApiError(
          `Selected variant for ${product.name} could not be found`
        );
        return;
      }
    }

    try {
      setLoading(true);

      const items = cart.map((product) => ({
        product: product.product || product._id,
        variantId: product.variantId,
        quantity: Number(product.quantity || 1),
      }));

      const response = await api.post("/orders/place", {
        items,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state,
        pinCode: formData.pinCode.trim(),
        paymentMethod: formData.paymentMethod,
      });

      console.log("ORDER RESPONSE:", response.data);

      dispatch(clearCart());

      navigate("/order-success", {
        state: {
          order: response.data.order,
        },
      });
    } catch (error) {
      console.log("PLACE ORDER ERROR:", error);

      if (error.response) {
        setApiError(
          error.response.data?.message ||
            "Failed to place order"
        );
      } else {
        setApiError(
          "Unable to connect to the server"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shoply-checkout-page">
      <div className="shoply-checkout-container">
        <div className="shoply-checkout-header">
          <h1>Checkout</h1>
          <p>
            Complete your order by providing your details.
          </p>
        </div>

        <div className="shoply-checkout-content">
          <div className="shoply-checkout-card">
            <div className="shoply-checkout-card-header">
              <div className="shoply-checkout-card-icon">
                <MapPin size={24} />
              </div>

              <div>
                <h2>Shipping Details</h2>
                <p>
                  Enter your delivery information.
                </p>
              </div>
            </div>

            <form
              className="shoply-checkout-form"
              onSubmit={handlePlaceOrder}
            >
              <div className="shoply-form-row">
                <div className="shoply-form-group">
                  <label>
                    First Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="firstName"
                    placeholder="Enter first name"
                    value={formData.firstName}
                    onChange={handleChange}
                  />

                  {errors.firstName && (
                    <small className="shoply-error">
                      {errors.firstName}
                    </small>
                  )}
                </div>

                <div className="shoply-form-group">
                  <label>
                    Last Name <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="lastName"
                    placeholder="Enter last name"
                    value={formData.lastName}
                    onChange={handleChange}
                  />

                  {errors.lastName && (
                    <small className="shoply-error">
                      {errors.lastName}
                    </small>
                  )}
                </div>
              </div>

              <div className="shoply-form-group">
                <label>
                  Email Address <span>*</span>
                </label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                />

                {errors.email && (
                  <small className="shoply-error">
                    {errors.email}
                  </small>
                )}
              </div>

              <div className="shoply-form-group">
                <label>
                  Phone Number <span>*</span>
                </label>

                <input
                  type="tel"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  maxLength={10}
                />

                {errors.phone && (
                  <small className="shoply-error">
                    {errors.phone}
                  </small>
                )}
              </div>

              <div className="shoply-form-group">
                <label>
                  Address <span>*</span>
                </label>

                <textarea
                  name="address"
                  placeholder="House no., Street, Area"
                  value={formData.address}
                  onChange={handleChange}
                />

                {errors.address && (
                  <small className="shoply-error">
                    {errors.address}
                  </small>
                )}
              </div>

              <div className="shoply-form-row-three">
                <div className="shoply-form-group">
                  <label>
                    City <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="city"
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={handleChange}
                  />

                  {errors.city && (
                    <small className="shoply-error">
                      {errors.city}
                    </small>
                  )}
                </div>

                <div className="shoply-form-group">
                  <label>
                    State <span>*</span>
                  </label>

                  <select
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  >
                    <option value="">
                      Select State
                    </option>
                    <option value="Madhya Pradesh">
                      Madhya Pradesh
                    </option>
                    <option value="Maharashtra">
                      Maharashtra
                    </option>
                    <option value="Rajasthan">
                      Rajasthan
                    </option>
                    <option value="Delhi">
                      Delhi
                    </option>
                    <option value="Gujarat">
                      Gujarat
                    </option>
                  </select>

                  {errors.state && (
                    <small className="shoply-error">
                      {errors.state}
                    </small>
                  )}
                </div>

                <div className="shoply-form-group">
                  <label>
                    PIN Code <span>*</span>
                  </label>

                  <input
                    type="text"
                    name="pinCode"
                    placeholder="452001"
                    value={formData.pinCode}
                    onChange={handleChange}
                    maxLength={6}
                  />

                  {errors.pinCode && (
                    <small className="shoply-error">
                      {errors.pinCode}
                    </small>
                  )}
                </div>
              </div>

              <div className="shoply-payment-section">
                <div className="shoply-payment-header">
                  <h3>Payment Method</h3>
                  <p>
                    Select how you want to pay for your order.
                  </p>
                </div>

                <div className="shoply-payment-options">
                  <label
                    className={`shoply-payment-option ${
                      formData.paymentMethod === "cod"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="cod"
                      checked={
                        formData.paymentMethod === "cod"
                      }
                      onChange={handleChange}
                    />

                    <div className="shoply-payment-icon">
                      <Banknote size={20} />
                    </div>

                    <div className="shoply-payment-info">
                      <strong>
                        Cash on Delivery
                      </strong>

                      <p>
                        Pay when your order is delivered
                      </p>
                    </div>

                    <div className="shoply-payment-radio"></div>
                  </label>

                  <label
                    className={`shoply-payment-option ${
                      formData.paymentMethod === "online"
                        ? "active"
                        : ""
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="online"
                      checked={
                        formData.paymentMethod === "online"
                      }
                      onChange={handleChange}
                    />

                    <div className="shoply-payment-icon">
                      <CreditCard size={20} />
                    </div>

                    <div className="shoply-payment-info">
                      <strong>
                        Online Payment
                      </strong>

                      <p>
                        Pay securely using online payment
                      </p>
                    </div>

                    <div className="shoply-payment-radio"></div>
                  </label>
                </div>

                {errors.paymentMethod && (
                  <small className="shoply-error">
                    {errors.paymentMethod}
                  </small>
                )}
              </div>

              {apiError && (
                <p className="shoply-api-error">
                  {apiError}
                </p>
              )}

              <button
                className="shoply-place-order-btn"
                type="submit"
                disabled={
                  loading || cart.length === 0
                }
              >
                <Lock size={18} />

                {loading
                  ? formData.paymentMethod === "online"
                    ? "Processing Payment..."
                    : "Placing Order..."
                  : formData.paymentMethod === "online"
                  ? "Pay & Place Order"
                  : "Place Order"}
              </button>
            </form>
          </div>

          <div className="shoply-order-summary">
            <div className="shoply-order-summary-header">
              <div className="shoply-checkout-card-header">
                <div className="shoply-checkout-card-icon">
                  <ShoppingBag size={24} />
                </div>

                <div>
                  <h2>Order Summary</h2>
                  <p>
                    Review your items before placing the order.
                  </p>
                </div>
              </div>

              <span className="shoply-order-summary-count">
                {cart.length}{" "}
                {cart.length === 1 ? "item" : "items"}
              </span>
            </div>

            <div className="shoply-checkout-items">
              {cart.length === 0 ? (
                <div className="shoply-checkout-empty">
                  <ShoppingBag size={35} />

                  <p>
                    Your cart is empty.
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/products")
                    }
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                cart.map((product, index) => {
                  const finalPrice =
                    getFinalPrice(product);

                  const quantity =
                    Number(product.quantity || 1);

                  const attributes =
                    getVariantAttributes(product);

                  const image =
                    getProductImage(product);

                  return (
                    <div
                      className="shoply-order-item"
                      key={`${product._id}-${product.variantId}-${index}`}
                    >
                      <div className="shoply-order-item-image">
                        {image ? (
                          <img
                            src={getImageUrl(image)}
                            alt={product.name}
                          />
                        ) : (
                          <ShoppingBag size={25} />
                        )}
                      </div>

                      <div className="shoply-order-item-info">
                        <h3>{product.name}</h3>

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

                        <p>
                          Qty: {quantity}
                        </p>
                      </div>

                      <div className="shoply-order-item-price">
                        ₹
                        {(
                          finalPrice * quantity
                        ).toLocaleString("en-IN")}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="shoply-order-totals">
              <div className="shoply-total-row">
                <span>Subtotal</span>

                <span>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <div className="shoply-total-row">
                <span>Shipping</span>

                <span className="shoply-shipping-free">
                  Free
                </span>
              </div>

              <div className="shoply-grand-total">
                <span>Total</span>

                <span>
                  ₹
                  {total.toLocaleString(
                    "en-IN"
                  )}
                </span>
              </div>

              <p className="shoply-checkout-terms">
                By placing your order, you agree to our{" "}
                <a href="#">
                  Terms & Conditions
                </a>{" "}
                and{" "}
                <a href="#">
                  Privacy Policy
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;