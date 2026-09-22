import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Package,
  MapPin,
  ShoppingBag,
  Calendar,
  CreditCard,
  CheckCircle,
} from "lucide-react";
import api from "../utils/axios";
import { toast } from "react-toastify";

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

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

    const baseUrl =
      api.defaults.baseURL?.replace(/\/api\/?$/, "") ||
      "http://localhost:3000";

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${baseUrl}/${cleanImage}`;
  };

  const getProductImage = (item) => {
    if (
      Array.isArray(item.images) &&
      item.images.length > 0
    ) {
      return item.images[0];
    }

    if (item.image) {
      return item.image;
    }

    return "";
  };

  const getAttributes = (attributes) => {
    if (!attributes) {
      return {};
    }

    if (attributes instanceof Map) {
      return Object.fromEntries(attributes);
    }

    if (typeof attributes === "object") {
      return attributes;
    }

    return {};
  };

  const formatStatus = (status) => {
    if (!status) {
      return "Processing";
    }

    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(" ");
  };

  const formatPaymentMethod = (method) => {
    if (method === "cod") {
      return "Cash on Delivery";
    }

    if (method === "online") {
      return "Online Payment";
    }

    return "Not Available";
  };

  const formatPaymentStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return (
      status.charAt(0).toUpperCase() +
      status.slice(1)
    );
  };

  useEffect(() => {
    const getOrder = async () => {
      try {
        const response = await api.get(`/orders/${id}`);
        setOrder(response.data.order);
      } catch (error) {
        console.log("GET ORDER ERROR:", error);

        toast.error(
          error.response?.data?.message ||
            "Failed to fetch order"
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      getOrder();
    } else {
      setLoading(false);
    }
  }, [id, user]);

  if (!user) {
    return (
      <div className="order-details-page">
        <div className="order-details-empty">
          <ShoppingBag size={45} />

          <h2>
            Please login to view your order
          </h2>

          <button
            type="button"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="order-details-page">
        <div className="order-details-loading">
          Loading order...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-details-page">
        <div className="order-details-empty">
          <Package size={45} />

          <h2>Order not found</h2>

          <button
            type="button"
            onClick={() => navigate("/orders")}
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="order-details-page">
      <div className="order-details-container">
        <button
          type="button"
          className="back-orders-btn"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div className="order-details-header">
          <div>
            <h1>Order Details</h1>

            <p>
              Order #
              {order._id
                ? order._id.slice(-8).toUpperCase()
                : ""}
            </p>
          </div>

          <span className="order-details-status">
            {formatStatus(order.status)}
          </span>
        </div>

        <div className="order-date">
          <Calendar size={17} />

          <span>
            Placed on{" "}
            {order.createdAt
              ? new Date(
                  order.createdAt
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "long",
                  year: "numeric",
                })
              : "Not Available"}
          </span>
        </div>

        <div className="order-details-grid">
          <div className="order-details-card">
            <div className="details-card-header">
              <div className="details-icon">
                <ShoppingBag size={21} />
              </div>

              <div>
                <h2>Ordered Items</h2>

                <p>
                  {order.items?.length || 0}{" "}
                  {order.items?.length === 1
                    ? "item"
                    : "items"}
                </p>
              </div>
            </div>

            <div className="details-items">
              {order.items?.map((item, index) => {
                const productImage =
                  getProductImage(item);

                const itemPrice =
                  Number(item.price) || 0;

                const itemQuantity =
                  Number(item.quantity) || 0;

                const itemTotal =
                  item.total !== undefined
                    ? Number(item.total) || 0
                    : itemPrice * itemQuantity;

                const attributes =
                  getAttributes(item.attributes);

                return (
                  <div
                    className="details-item"
                    key={
                      item.variantId ||
                      item.product ||
                      index
                    }
                  >
                    <div className="details-item-image">
                      {productImage ? (
                        <img
                          src={getImageUrl(
                            productImage
                          )}
                          alt={item.name || "Product"}
                        />
                      ) : (
                        <Package size={24} />
                      )}
                    </div>

                    <div className="details-item-info">
                      <h3>
                        {item.name ||
                          "Product"}
                      </h3>

                      <p>
                        Quantity: {itemQuantity}
                      </p>

                      <p>
                        Price: ₹
                        {itemPrice.toLocaleString(
                          "en-IN"
                        )}
                      </p>

                      {Object.keys(attributes)
                        .length > 0 && (
                        <div className="order-item-attributes">
                          {Object.entries(
                            attributes
                          ).map(
                            ([key, value]) => (
                              <span key={key}>
                                <b>
                                  {key}:
                                </b>{" "}
                                {value}
                              </span>
                            )
                          )}
                        </div>
                      )}
                    </div>

                    <strong>
                      ₹
                      {itemTotal.toLocaleString(
                        "en-IN"
                      )}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="order-details-card">
            <div className="details-card-header">
              <div className="details-icon">
                <MapPin size={21} />
              </div>

              <div>
                <h2>Shipping Address</h2>

                <p>
                  Delivery information
                </p>
              </div>
            </div>

            <div className="shipping-details">
              <h3>
                {
                  order.shippingAddress
                    ?.firstName
                }{" "}
                {
                  order.shippingAddress
                    ?.lastName
                }
              </h3>

              <p>
                {
                  order.shippingAddress
                    ?.email
                }
              </p>

              <p>
                {
                  order.shippingAddress
                    ?.phone
                }
              </p>

              <div className="shipping-address">
                {
                  order.shippingAddress
                    ?.address
                }
              </div>

              <p>
                {
                  order.shippingAddress
                    ?.city
                }
                ,{" "}
                {
                  order.shippingAddress
                    ?.state
                }
              </p>

              <p>
                PIN Code:{" "}
                {
                  order.shippingAddress
                    ?.pinCode
                }
              </p>
            </div>
          </div>
        </div>

        <div className="price-details-card">
          <div className="details-card-header">
            <div className="details-icon">
              <Package size={21} />
            </div>

            <div>
              <h2>Price Details</h2>

              <p>
                Order payment summary
              </p>
            </div>
          </div>

          <div className="price-rows">
            <div>
              <span>Subtotal</span>

              <strong>
                ₹
                {Number(
                  order.subtotal || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>

            <div>
              <span>Shipping</span>

              <strong className="free-shipping">
                {Number(order.shipping || 0) ===
                0
                  ? "Free"
                  : `₹${Number(
                      order.shipping
                    ).toLocaleString(
                      "en-IN"
                    )}`}
              </strong>
            </div>

            <div className="price-total">
              <span>Total</span>

              <strong>
                ₹
                {Number(
                  order.total || 0
                ).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>
        </div>

        <div className="order-details-card order-payment-card">
          <div className="details-card-header">
            <div className="details-icon">
              <CreditCard size={21} />
            </div>

            <div>
              <h2>Payment Details</h2>

              <p>
                Payment information
              </p>
            </div>
          </div>

          <div className="payment-details">
            <div className="payment-detail-row">
              <span>Payment Method</span>

              <strong>
                {formatPaymentMethod(
                  order.paymentMethod
                )}
              </strong>
            </div>

            <div className="payment-detail-row">
              <span>Payment Status</span>

              <strong className="payment-status">
                <CheckCircle size={16} />

                {formatPaymentStatus(
                  order.paymentStatus
                )}
              </strong>
            </div>

            <div className="payment-detail-row">
              <span>Order Status</span>

              <strong>
                {formatStatus(order.status)}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;