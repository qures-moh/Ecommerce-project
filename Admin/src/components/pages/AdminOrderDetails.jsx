import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  User,
  Calendar,
  MapPin,
} from "lucide-react";
import api from "../../utils/axios";

export default function AdminOrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/admin/orders/${id}`
      );

      setOrder(response.data.order);
    } catch (error) {
      console.error("FETCH ORDER ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  const getCustomerName = () => {
    if (!order?.user) {
      return "Unknown Customer";
    }

    return (
      `${order.user.firstName || ""} ${
        order.user.lastName || ""
      }`.trim() || "Unknown Customer"
    );
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getItemName = (item) => {
    if (item.name) {
      return item.name;
    }

    if (item.product?.name) {
      return item.product.name;
    }

    return "Product";
  };

  const getItemPrice = (item) => {
    return Number(item.price || 0);
  };

  const getItemQuantity = (item) => {
    return Number(item.quantity || 1);
  };

  const getItemTotal = (item) => {
    if (item.total !== undefined) {
      return Number(item.total || 0);
    }

    return (
      getItemPrice(item) *
      getItemQuantity(item)
    );
  };

  const getItemImage = (item) => {
    if (item.image) {
      return item.image;
    }

    if (
      item.product?.images &&
      Array.isArray(item.product.images) &&
      item.product.images.length > 0
    ) {
      return item.product.images[0];
    }

    if (item.product?.image) {
      return item.product.image;
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
      api.defaults.baseURL ||
      "http://localhost:3000/api";

    const cleanBaseURL =
      baseURL.replace(/\/api\/?$/, "");

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${cleanBaseURL}/${cleanImage}`;
  };

  const getAttributes = (item) => {
    if (!item?.attributes) {
      return {};
    }

    if (item.attributes instanceof Map) {
      return Object.fromEntries(item.attributes);
    }

    return item.attributes;
  };

  if (loading) {
    return (
      <div className="admin-order-details-page">
        <div className="order-details-loading">
          Loading order...
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="admin-order-details-page">
        <button
          className="back-order-btn"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="order-details-error">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-order-details-page">
      <div className="order-details-header">
        <button
          className="back-order-btn"
          onClick={() =>
            navigate("/admin/orders")
          }
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="order-title-row">
          <div>
            <h1>Order Details</h1>

            <p>
              Order #
              {order._id
                ?.slice(-8)
                .toUpperCase()}
            </p>
          </div>

          <span
            className={`order-details-status status-${order.status}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>

      <div className="order-details-grid">
        <div className="order-main-card">
          <div className="order-card-title">
            <Package size={20} />
            <h2>Order Items</h2>
          </div>

          <div className="order-items-table">
            <div className="order-items-header">
              <span>Product</span>
              <span>Price</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>

            {order.items?.map((item, index) => {
              const attributes =
                getAttributes(item);

              const image =
                getItemImage(item);

              return (
                <div
                  className="order-item-row"
                  key={`${item.product?._id || item.product}-${item.variantId}-${index}`}
                >
                  <div className="order-product-info">
                    {image ? (
                      <img
                        src={getImageUrl(image)}
                        alt={getItemName(item)}
                      />
                    ) : (
                      <div className="product-placeholder">
                        <Package size={20} />
                      </div>
                    )}

                    <div>
                      <strong>
                        {getItemName(item)}
                      </strong>

                      {Object.entries(
                        attributes
                      ).length > 0 && (
                        <div className="order-item-attributes">
                          {Object.entries(
                            attributes
                          ).map(
                            ([key, value]) => (
                              <span
                                key={key}
                              >
                                <b>
                                  {key}:
                                </b>{" "}
                                {value}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      {item.variantId && (
                        <small>
                          Variant selected
                        </small>
                      )}
                    </div>
                  </div>

                  <span>
                    ₹
                    {Math.round(
                      getItemPrice(item)
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </span>

                  <span>
                    {getItemQuantity(item)}
                  </span>

                  <strong>
                    ₹
                    {Math.round(
                      getItemTotal(item)
                    ).toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>
              );
            })}
          </div>

          <div className="order-total-section">
            <div>
              <span>Subtotal</span>

              <strong>
                ₹
                {Math.round(
                  Number(
                    order.subtotal ||
                      order.total ||
                      0
                  )
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>

            {Number(order.discount || 0) > 0 && (
              <div>
                <span>Discount</span>

                <strong className="discount-value">
                  -₹
                  {Math.round(
                    Number(order.discount)
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            )}

            {Number(order.shipping || 0) > 0 && (
              <div>
                <span>Shipping</span>

                <strong>
                  ₹
                  {Math.round(
                    Number(order.shipping)
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>
            )}

            <div className="grand-total">
              <span>Total</span>

              <strong>
                ₹
                {Math.round(
                  Number(order.total || 0)
                ).toLocaleString(
                  "en-IN"
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="order-side-column">
          <div className="order-info-card">
            <div className="order-card-title">
              <User size={19} />
              <h2>Customer</h2>
            </div>

            <div className="customer-details">
              <div className="customer-avatar">
                {getCustomerName()
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div>
                <strong>
                  {getCustomerName()}
                </strong>

                <span>
                  {order.user?.email ||
                    order.shippingAddress
                      ?.email ||
                    "No email"}
                </span>
              </div>
            </div>
          </div>

          <div className="order-info-card">
            <div className="order-card-title">
              <Calendar size={19} />
              <h2>Order Information</h2>
            </div>

            <div className="info-list">
              <div>
                <span>Order ID</span>

                <strong>
                  #
                  {order._id
                    ?.slice(-8)
                    .toUpperCase()}
                </strong>
              </div>

              <div>
                <span>Order Date</span>

                <strong>
                  {formatDate(
                    order.createdAt
                  )}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {formatStatus(
                    order.status
                  )}
                </strong>
              </div>

              <div>
                <span>Payment</span>

                <strong>
                  {order.paymentMethod ===
                  "online"
                    ? "Online Payment"
                    : "Cash on Delivery"}
                </strong>
              </div>

              <div>
                <span>Payment Status</span>

                <strong>
                  {formatStatus(
                    order.paymentStatus
                  )}
                </strong>
              </div>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="order-info-card">
              <div className="order-card-title">
                <MapPin size={19} />
                <h2>
                  Shipping Address
                </h2>
              </div>

              <div className="shipping-address">
                {typeof order.shippingAddress ===
                "string" ? (
                  <p>
                    {order.shippingAddress}
                  </p>
                ) : (
                  <>
                    <strong>
                      {order.shippingAddress
                        .firstName ||
                        order.shippingAddress
                          .name ||
                        ""}
                      {" "}
                      {order.shippingAddress
                        .lastName ||
                        ""}
                    </strong>

                    <p>
                      {order.shippingAddress
                        .email || ""}
                    </p>

                    <p>
                      {order.shippingAddress
                        .phone || ""}
                    </p>

                    <p>
                      {order.shippingAddress
                        .address || ""}
                    </p>

                    <p>
                      {order.shippingAddress
                        .city || ""}
                      {order.shippingAddress
                        .city &&
                      order.shippingAddress
                        .state
                        ? ", "
                        : ""}
                      {order.shippingAddress
                        .state || ""}
                    </p>

                    <p>
                      {order.shippingAddress
                        .pinCode ||
                        order.shippingAddress
                          .pincode ||
                        order.shippingAddress
                          .zipCode ||
                        ""}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}