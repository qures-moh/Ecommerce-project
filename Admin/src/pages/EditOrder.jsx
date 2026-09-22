import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, AlertTriangle } from "lucide-react";
import api from "../../utils/axios";


export default function EditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  const statuses = [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
  ];

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/orders/${id}`);

      const orderData = response.data.order;

      setOrder(orderData);
      setStatus(orderData.status || "pending");
    } catch (error) {
      setError(
        error.response?.data?.message || "Unable to load order."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = () => {
    if (!order) return;

    if (status === order.status) {
      setError("Please select a different status.");
      return;
    }

    setError("");
    setShowConfirm(true);
  };

  const handleConfirmUpdate = async () => {
    try {
      setSaving(true);
      setError("");

      await api.patch(`/admin/orders/${id}/status`, {
        status,
      });

      navigate("/admin/orders");
    } catch (error) {
      setShowConfirm(false);

      setError(
        error.response?.data?.message ||
          "Unable to update order status."
      );
    } finally {
      setSaving(false);
    }
  };

  const formatStatus = (value) => {
    if (!value) return "";

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const getCustomerName = () => {
    if (!order?.user) return "Unknown Customer";

    return (
      `${order.user.firstName || ""} ${
        order.user.lastName || ""
      }`.trim() || "Unknown Customer"
    );
  };

  if (loading) {
    return (
      <div className="edit-order-page">
        <div className="edit-order-loading">
          Loading order...
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="edit-order-page">
        <div className="edit-order-error">
          {error || "Order not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="edit-order-page">
      <div className="edit-order-header">
        <button
          type="button"
          className="back-order-btn"
          onClick={() => navigate("/admin/orders")}
        >
          <ArrowLeft size={18} />
          Back to Orders
        </button>

        <div>
          <h1>Edit Order</h1>
          <p>Update the order status</p>
        </div>
      </div>

      {error && (
        <div className="edit-order-error">
          {error}
        </div>
      )}

      <div className="edit-order-card">
        <div className="order-info-header">
          <div>
            <span>Order</span>
            <h2>
              #{order._id?.slice(-8).toUpperCase()}
            </h2>
          </div>

          <span className={`edit-status status-${order.status}`}>
            {formatStatus(order.status)}
          </span>
        </div>

        <div className="order-customer-info">
          <div className="customer-avatar-large">
            {getCustomerName().charAt(0).toUpperCase()}
          </div>

          <div>
            <h3>{getCustomerName()}</h3>
            <p>{order.user?.email || "No email"}</p>
          </div>
        </div>

        <div className="order-summary">
          <div>
            <span>Items</span>
            <strong>
              {order.items?.reduce(
                (total, item) =>
                  total + Number(item.quantity || 1),
                0
              ) || 0}
            </strong>
          </div>

          <div>
            <span>Total</span>
            <strong>
              ₹
              {Math.round(
                Number(order.total || 0)
              ).toLocaleString("en-IN")}
            </strong>
          </div>
        </div>

        <div className="status-section">
          <label htmlFor="order-status">
            Order Status
          </label>

          <select
            id="order-status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setError("");
            }}
          >
            {statuses.map((item) => (
              <option key={item} value={item}>
                {formatStatus(item)}
              </option>
            ))}
          </select>

          <p>
            Current status:{" "}
            <strong>{formatStatus(order.status)}</strong>
          </p>
        </div>

        <div className="edit-order-actions">
          <button
            type="button"
            className="cancel-edit-btn"
            onClick={() => navigate("/admin/orders")}
          >
            Cancel
          </button>

          <button
            type="button"
            className="update-order-btn"
            onClick={handleUpdateClick}
            disabled={saving}
          >
            <Check size={17} />
            Update Order
          </button>
        </div>
      </div>

      {showConfirm && (
        <div className="confirm-overlay">
          <div className="confirm-modal">
            <div className="confirm-icon">
              <AlertTriangle size={24} />
            </div>

            <h2>Confirm Status Change</h2>

            <p>
              Are you sure you want to change this
              order status?
            </p>

            <div className="status-change">
              <span>{formatStatus(order.status)}</span>

              <span className="status-arrow">→</span>

              <strong>{formatStatus(status)}</strong>
            </div>

            <div className="confirm-actions">
              <button
                type="button"
                className="confirm-cancel-btn"
                onClick={() => setShowConfirm(false)}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="button"
                className="confirm-update-btn"
                onClick={handleConfirmUpdate}
                disabled={saving}
              >
                {saving ? "Updating..." : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}