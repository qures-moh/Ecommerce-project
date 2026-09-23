import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  ShieldCheck,
  ShoppingBag,
  Package,
} from "lucide-react";
import api from "../../utils/axios";

export default function AdminUserDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/admin/users/${id}`);

      setUser(response.data.user || null);
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error("FETCH USER ERROR:", error);

      setError(error.response?.data?.message || "Unable to load user details.");
    } finally {
      setLoading(false);
    }
  };

  const getUserName = () => {
    if (!user) return "Unknown User";

    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() || "Unknown User"
    );
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatStatus = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getOrderTotal = () => {
    return orders.reduce((total, order) => total + Number(order.total || 0), 0);
  };

  const getItemsCount = (order) => {
    if (!order.items) return 0;

    return order.items.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0,
    );
  };

  if (loading) {
    return (
      <div className="admin-user-details-page">
        <div className="user-details-loading">Loading user details...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-user-details-page">
        <button
          type="button"
          className="user-details-back-btn"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft size={18} />
          Back to Users
        </button>

        <div className="user-details-error">{error || "User not found."}</div>
      </div>
    );
  }

  return (
    <div className="admin-user-details-page">
      <div className="user-details-header">
        <button
          type="button"
          className="user-details-back-btn"
          onClick={() => navigate("/admin/users")}
        >
          <ArrowLeft size={18} />
          Back to Users
        </button>

        <div className="user-title-row">
          <div>
            <h1>User Details</h1>
            <p>Customer account information</p>
          </div>

          <span
            className={`user-details-status ${
              user.isActive ? "user-details-active" : "user-details-inactive"
            }`}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </div>
      </div>

      {error && <div className="user-details-error">{error}</div>}

      <div className="user-details-grid">
        <div className="user-main-column">
          <div className="user-profile-card">
            <div className="user-profile-top">
              <div className="user-profile-avatar">
                {user.profileImage ? (
                  <img
                    src={`http://localhost:3000/${user.profileImage}`}
                    alt={getUserName()}
                  />
                ) : (
                  getUserName().charAt(0).toUpperCase()
                )}
              </div>

              <div className="user-profile-name">
                <h2>{getUserName()}</h2>
                <p>{user.email}</p>
              </div>
            </div>

            <div className="user-information">
              <div className="user-information-item">
                <div className="information-icon">
                  <Mail size={18} />
                </div>

                <div>
                  <span>Email</span>
                  <strong>{user.email}</strong>
                </div>
              </div>

              <div className="user-information-item">
                <div className="information-icon">
                  <User size={18} />
                </div>

                <div>
                  <span>Gender</span>
                  <strong>{user.gender || "—"}</strong>
                </div>
              </div>

              <div className="user-information-item">
                <div className="information-icon">
                  <Calendar size={18} />
                </div>

                <div>
                  <span>Date of Birth</span>
                  <strong>{formatDate(user.dob)}</strong>
                </div>
              </div>

              <div className="user-information-item">
                <div className="information-icon">
                  <Calendar size={18} />
                </div>

                <div>
                  <span>Joined</span>
                  <strong>{formatDate(user.createdAt)}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="user-orders-card">
            <div className="user-card-header">
              <div className="user-card-title">
                <ShoppingBag size={20} />
                <h2>Order History</h2>
              </div>

              <span>
                {orders.length} {orders.length === 1 ? "Order" : "Orders"}
              </span>
            </div>

            {orders.length === 0 ? (
              <div className="user-orders-empty">
                <Package size={35} />
                <h3>No orders yet</h3>
                <p>This customer has not placed any orders.</p>
              </div>
            ) : (
              <div className="user-orders-table-wrapper">
                <table className="user-orders-table">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>

                  <tbody>
                    {orders.map((order) => (
                      <tr key={order._id}>
                        <td>
                          <strong className="user-order-number">
                            #{order._id?.slice(-8).toUpperCase()}
                          </strong>
                        </td>

                        <td>{getItemsCount(order)}</td>

                        <td>
                          <strong className="user-order-total">
                            ₹
                            {Math.round(
                              Number(order.total || 0),
                            ).toLocaleString("en-IN")}
                          </strong>
                        </td>

                        <td>
                          <span
                            className={`user-order-status status-${order.status}`}
                          >
                            {formatStatus(order.status)}
                          </span>
                        </td>

                        <td>{formatDate(order.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="user-side-column">
          <div className="user-stat-card">
            <div className="user-stat-icon">
              <ShoppingBag size={20} />
            </div>

            <div>
              <span>Total Orders</span>
              <strong>{orders.length}</strong>
            </div>
          </div>

          <div className="user-stat-card">
            <div className="user-stat-icon">
              <Package size={20} />
            </div>

            <div>
              <span>Total Spent</span>
              <strong>
                ₹{Math.round(getOrderTotal()).toLocaleString("en-IN")}
              </strong>
            </div>
          </div>

          <div className="user-account-card">
            <div className="user-card-title">
              <ShieldCheck size={20} />
              <h2>Account</h2>
            </div>

            <div className="account-details">
              <div>
                <span>Role</span>
                <strong>{user.role || "customer"}</strong>
              </div>

              <div>
                <span>Status</span>
                <strong
                  className={
                    user.isActive ? "account-active" : "account-inactive"
                  }
                >
                  {user.isActive ? "Active" : "Inactive"}
                </strong>
              </div>

              <div>
                <span>Member Since</span>
                <strong>{formatDate(user.createdAt)}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
