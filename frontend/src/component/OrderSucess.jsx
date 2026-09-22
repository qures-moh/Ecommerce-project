import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  Package,
  CalendarDays,
  IndianRupee,
  ArrowRight,
  ShoppingBag,
  CreditCard,
  Truck,
  MapPin,
} from "lucide-react";

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const order = location.state?.order;

  if (!order) {
    return (
      <div className="shop-order-success-page">
        <div className="shop-order-success-empty">
          <Package size={50} />

          <h2>Order information not found</h2>

          <p>
            Your order may still have been placed. You can check your
            orders from your profile.
          </p>

          <Link
            to="/products"
            className="shop-order-success-primary"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const orderId = order._id || order.id;

  const subtotal = Number(
    order.subtotal ??
      order.subTotal ??
      0
  );

  const shipping = Number(
    order.shipping ?? 0
  );

  const orderTotal = Number(
    order.total ??
      order.totalAmount ??
      order.amount ??
      subtotal + shipping
  );

  const paymentMethod =
    order.paymentMethod || "cod";

  const paymentStatus =
    order.paymentStatus || "pending";

  const orderStatus =
    order.status || "confirmed";

  const orderDate = order.createdAt
    ? new Date(
        order.createdAt
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : new Date().toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

  const displayOrderId = orderId
    ? `#${String(orderId)
        .slice(-8)
        .toUpperCase()}`
    : "N/A";

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return status
      .split("_")
      .map(
        (word) =>
          word.charAt(0).toUpperCase() +
          word.slice(1)
      )
      .join(" ");
  };

  const getPaymentMethod = () => {
    if (paymentMethod === "online") {
      return "Online Payment";
    }

    return "Cash on Delivery";
  };

  const getPaymentStatus = () => {
    if (paymentStatus === "paid") {
      return "Paid";
    }

    if (paymentStatus === "failed") {
      return "Failed";
    }

    return "Pending";
  };

  return (
    <div className="shop-order-success-page">
      <div className="shop-order-success-container">
        <div className="shop-order-success-card">
          <div className="shop-order-success-icon">
            <CheckCircle
              size={58}
              strokeWidth={2}
            />
          </div>

          <h1>
            Order Placed Successfully!
          </h1>

          <p className="shop-order-success-message">
            Thank you for your purchase. Your
            order has been successfully placed
            and is being processed.
          </p>

          <div className="shop-order-success-details">
            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <Package size={20} />
              </div>

              <div>
                <span>Order ID</span>
                <strong>
                  {displayOrderId}
                </strong>
              </div>
            </div>

            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <CalendarDays size={20} />
              </div>

              <div>
                <span>Order Date</span>
                <strong>
                  {orderDate}
                </strong>
              </div>
            </div>

            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <CreditCard size={20} />
              </div>

              <div>
                <span>Payment Method</span>
                <strong>
                  {getPaymentMethod()}
                </strong>
              </div>
            </div>

            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <CheckCircle size={20} />
              </div>

              <div>
                <span>Payment Status</span>
                <strong className="shop-order-success-status">
                  {getPaymentStatus()}
                </strong>
              </div>
            </div>

            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <Truck size={20} />
              </div>

              <div>
                <span>Order Status</span>
                <strong className="shop-order-success-status">
                  {formatStatus(
                    orderStatus
                  )}
                </strong>
              </div>
            </div>

            <div className="shop-order-success-detail">
              <div className="shop-order-success-detail-icon">
                <IndianRupee size={20} />
              </div>

              <div>
                <span>Total Amount</span>
                <strong>
                  ₹
                  {orderTotal.toLocaleString(
                    "en-IN",
                    {
                      maximumFractionDigits: 0,
                    }
                  )}
                </strong>
              </div>
            </div>
          </div>

          <div className="shop-order-success-summary">
            <div className="shop-order-success-summary-row">
              <span>Subtotal</span>

              <strong>
                ₹
                {subtotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>

            <div className="shop-order-success-summary-row">
              <span>Shipping</span>

              <strong>
                {shipping === 0
                  ? "Free"
                  : `₹${shipping.toLocaleString(
                      "en-IN",
                      {
                        maximumFractionDigits: 0,
                      }
                    )}`}
              </strong>
            </div>

            <div className="shop-order-success-summary-divider"></div>

            <div className="shop-order-success-summary-row shop-order-success-total-row">
              <span>Total</span>

              <strong>
                ₹
                {orderTotal.toLocaleString(
                  "en-IN",
                  {
                    maximumFractionDigits: 0,
                  }
                )}
              </strong>
            </div>
          </div>

          {order.shippingAddress && (
            <div className="shop-order-success-address">
              <div className="shop-order-success-address-header">
                <MapPin size={19} />

                <strong>
                  Delivery Address
                </strong>
              </div>

              <div className="shop-order-success-address-content">
                <strong>
                  {order.shippingAddress.firstName}{" "}
                  {order.shippingAddress.lastName}
                </strong>

                <span>
                  {order.shippingAddress.address}
                </span>

                <span>
                  {order.shippingAddress.city},{" "}
                  {order.shippingAddress.state} -{" "}
                  {order.shippingAddress.pinCode}
                </span>

                <span>
                  Phone:{" "}
                  {order.shippingAddress.phone}
                </span>
              </div>
            </div>
          )}

          <div className="shop-order-success-actions">
            <button
              className="shop-order-success-primary"
              onClick={() =>
                navigate(
                  `/orders/${orderId}`
                )
              }
            >
              View Order Details
              <ArrowRight size={18} />
            </button>

            <Link
              to="/products"
              className="shop-order-success-secondary"
            >
              <ShoppingBag size={18} />
              Continue Shopping
            </Link>
          </div>
        </div>

        <div className="shop-order-success-note">
          <Package size={18} />

          <span>
            You can track your order anytime
            from your orders section.
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;