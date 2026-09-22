import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
} from "lucide-react";
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
    Array.isArray(item?.images) &&
    item.images.length > 0
  ) {
    return item.images[0];
  }

  if (
    Array.isArray(item?.product?.images) &&
    item.product.images.length > 0
  ) {
    return item.product.images[0];
  }

  if (item?.image) {
    return item.image;
  }

  if (item?.product?.image) {
    return item.product.image;
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

const getStatusIcon = (status) => {
  switch (status) {
    case "confirmed":
      return <CheckCircle size={17} />;

    case "processing":
      return <Clock size={17} />;

    case "shipped":
      return <Truck size={17} />;

    case "out_for_delivery":
      return <Truck size={17} />;

    case "delivered":
      return <CheckCircle size={17} />;

    case "cancelled":
      return <XCircle size={17} />;

    default:
      return <Package size={17} />;
  }
};

const getStatusClass = (status) => {
  switch (status) {
    case "confirmed":
      return "status-confirmed";

    case "processing":
      return "status-processing";

    case "shipped":
      return "status-shipped";

    case "out_for_delivery":
      return "status-shipped";

    case "delivered":
      return "status-delivered";

    case "cancelled":
      return "status-cancelled";

    default:
      return "status-default";
  }
};

const formatStatus = (status) => {
  if (!status) {
    return "Pending";
  }

  return status
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join(" ");
};

const formatDate = (date) => {
  if (!date) {
    return "";
  }

  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatPrice = (price) => {
  return Number(price || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export default function Order() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/orders/my-orders");

      console.log("MY ORDERS:", response.data);

      setOrders(response.data?.orders || []);
    } catch (error) {
      console.log("GET MY ORDERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load your orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="shoply-orders-page">
        <div className="shoply-orders-container">
          <div className="shoply-orders-loading">
            <div className="shoply-orders-spinner"></div>
            <p>Loading your orders...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="shoply-orders-page">
        <div className="shoply-orders-container">
          <div className="shoply-orders-error">
            <Package size={45} />

            <h2>Unable to load orders</h2>

            <p>{error}</p>

            <button
              className="shoply-orders-retry"
              onClick={fetchOrders}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="shoply-orders-page">
        <div className="shoply-orders-container">
          <div className="shoply-empty-orders">
            <div className="shoply-empty-orders-icon">
              <ShoppingBag size={55} />
            </div>

            <h2>No Orders Yet</h2>

            <p>
              You haven't placed any orders yet. Start
              shopping and your orders will appear here.
            </p>

            <Link
              to="/products"
              className="shoply-start-shopping"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="shoply-orders-page">
      <div className="shoply-orders-container">
        <div className="shoply-orders-header">
          <div>
            <h1>My Orders</h1>

            <p>
              Track and manage all your orders
            </p>
          </div>

          <div className="shoply-orders-count">
            {orders.length}{" "}
            {orders.length === 1 ? "Order" : "Orders"}
          </div>
        </div>

        <div className="shoply-orders-list">
          {orders.map((order) => (
            <div
              className="shoply-order-card"
              key={order._id}
            >
              <div className="shoply-order-card-header">
                <div className="shoply-order-info">
                  <div className="shoply-order-number">
                    Order #
                    {order._id
                      ?.slice(-8)
                      .toUpperCase()}
                  </div>

                  <div className="shoply-order-date">
                    <Clock size={15} />
                    {formatDate(order.createdAt)}
                  </div>
                </div>

                <div
                  className={`shoply-order-status ${getStatusClass(
                    order.status
                  )}`}
                >
                  {getStatusIcon(order.status)}
                  {formatStatus(order.status)}
                </div>
              </div>

              <div className="shoply-order-card-body">
                <div className="shoply-order-products">
                  {order.items?.map((item, index) => {
                    const productImage =
                      getProductImage(item);

                    const attributes =
                      getAttributes(
                        item.attributes
                      );

                    const itemPrice =
                      Number(item.price) || 0;

                    const itemQuantity =
                      Number(item.quantity) || 0;

                    const itemTotal =
                      item.total !== undefined
                        ? Number(item.total) || 0
                        : itemPrice *
                          itemQuantity;

                    return (
                      <div
                        className="shoply-order-product"
                        key={
                          item.variantId ||
                          item.product?._id ||
                          item.product ||
                          index
                        }
                      >
                        <div className="shoply-order-product-image">
                          {productImage ? (
                            <img
                              src={getImageUrl(
                                productImage
                              )}
                              alt={
                                item.name ||
                                "Product"
                              }
                            />
                          ) : (
                            <Package size={28} />
                          )}
                        </div>

                        <div className="shoply-order-product-info">
                          <h3>
                            {item.name ||
                              "Product"}
                          </h3>

                          <div className="shoply-order-product-meta">
                            <span>
                              Qty:{" "}
                              {itemQuantity}
                            </span>

                            <span>
                              ₹
                              {formatPrice(
                                itemPrice
                              )}
                            </span>
                          </div>

                          {Object.keys(
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
                        </div>

                        <div className="shoply-order-item-total">
                          ₹{formatPrice(itemTotal)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="shoply-order-card-footer">
                <div className="shoply-order-total">
                  <span>Total Amount</span>

                  <strong>
                    ₹{formatPrice(order.total)}
                  </strong>
                </div>

                <Link
                  to={`/orders/${order._id}`}
                  className="shoply-view-order"
                >
                  View Details
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}