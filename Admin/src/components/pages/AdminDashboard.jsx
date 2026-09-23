import { useEffect, useState } from "react";

import {
  Users,
  Package,
  ShoppingCart,
  IndianRupee,
  ArrowUpRight,
  Eye,
} from "lucide-react";

import { toast } from "react-toastify";

import api from "../../utils/axios";
import { Link } from "react-router-dom";

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const getDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/admin/dashboard");

      console.log("Dashboard API:", response.data);

      setDashboard(response.data);
    } catch (error) {
      console.log("Dashboard error:", error.response?.data || error);

      toast.error(error.response?.data?.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDashboard();
  }, []);

  /* =========================
     LOADING
  ========================= */

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-loader"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  /* =========================
     ERROR
  ========================= */

  if (!dashboard) {
    return (
      <div className="dashboard-error">
        <h2>Unable to load dashboard</h2>

        <button onClick={getDashboard}>Try Again</button>
      </div>
    );
  }

  const { stats, recentOrders = [], recentUsers = [] } = dashboard;

  return (
    <div className="admin-dashboard">
      {/* =========================
          DASHBOARD HEADING
      ========================= */}

      <div className="dashboard-heading">
        <div>
          <h1>Dashboard</h1>

          <p>Welcome back! Here's what's happening with your store.</p>
        </div>

        <select className="dashboard-filter">
          <option>All Time</option>
          <option>Last 7 Days</option>
          <option>Last 30 Days</option>
          <option>Last 3 Months</option>
          <option>This Year</option>
        </select>
      </div>

      {/* =========================
          STATISTICS
      ========================= */}

      <div className="dashboard-stats">
        {/* Customers */}

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Users size={22} />
            </div>
          </div>

          <div className="stat-info">
            <p>Total Customers</p>

            <h2>{stats.totalUsers.toLocaleString()}</h2>
          </div>

          <span className="stat-description">Registered customers</span>
        </div>

        {/* Products */}

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <Package size={22} />
            </div>
          </div>

          <div className="stat-info">
            <p>Total Products</p>

            <h2>{stats.totalProducts.toLocaleString()}</h2>
          </div>

          <span className="stat-description">Products in store</span>
        </div>

        {/* Orders */}

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <ShoppingCart size={22} />
            </div>
          </div>

          <div className="stat-info">
            <p>Total Orders</p>

            <h2>{stats.totalOrders.toLocaleString()}</h2>
          </div>

          <span className="stat-description">Orders received</span>
        </div>

        {/* Revenue */}

        <div className="stat-card">
          <div className="stat-card-top">
            <div className="stat-icon">
              <IndianRupee size={22} />
            </div>
          </div>

          <div className="stat-info">
            <p>Total Revenue</p>

            <h2>
              ₹{Math.round(Number(stats.totalRevenue)).toLocaleString("en-IN")}
            </h2>
          </div>

          <span className="stat-description">Total store revenue</span>
        </div>
      </div>

      {/* =========================
          RECENT ORDERS
      ========================= */}

      <div className="dashboard-card recent-orders-card">
        <div className="dashboard-card-header">
          <div>
            <h2>Recent Orders</h2>

            <p>Latest customer orders</p>
          </div>

          <button className="view-all-button">
            View All
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="empty-table">
                    No orders found
                  </td>
                </tr>
              ) : (
                recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="order-id">#{order._id.slice(-6)}</td>

                    <td>
                      {order.user
                        ? `${order.user.firstName} ${order.user.lastName}`
                        : "Unknown Customer"}
                    </td>

                    <td>
                      {order.items?.length > 0
                        ? `${order.items.length} item${
                            order.items.length > 1 ? "s" : ""
                          }`
                        : "No items"}
                    </td>

                    <td className="order-amount">
                      ₹{Math.round(Number(order.total)).toLocaleString("en-IN")}
                    </td>

                    <td>
                      <span
                        className={`order-status ${
                          order.status ? order.status.toLowerCase() : "pending"
                        }`}
                      >
                        {order.status || "Pending"}
                      </span>
                    </td>

                    <td>
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="order-eye"
                        title="View Order"
                      >
                        <Eye size={18} />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="dashboard-bottom-grid">
        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Recent Customers</h2>

              <p>Recently registered customers</p>
            </div>

            <button className="view-all-button">
              View All
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="recent-users">
            {recentUsers.length === 0 ? (
              <p className="empty-message">No customers found.</p>
            ) : (
              recentUsers.map((user) => (
                <div className="recent-user-item" key={user._id}>
                  <div className="user-avatar">
                    {user.firstName?.charAt(0).toUpperCase()}
                  </div>

                  <div className="user-information">
                    <h4>
                      {user.firstName} {user.lastName}
                    </h4>

                    <p>{user.email}</p>
                  </div>

                  <span className="customer-label">Customer</span>
                </div>
              ))
            )}
          </div>
        </div>

      

        <div className="dashboard-card">
          <div className="dashboard-card-header">
            <div>
              <h2>Store Overview</h2>

              <p>Quick store information</p>
            </div>
          </div>

          <div className="store-overview">
            <div className="overview-item">
              <div className="overview-icon">
                <Users size={20} />
              </div>

              <div>
                <p>Total Customers</p>

                <h3>{stats.totalUsers}</h3>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon">
                <Users size={20} />
              </div>

              <div>
                <p>Total Admins</p>

                <h3>{stats.totalAdmins}</h3>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon">
                <Package size={20} />
              </div>

              <div>
                <p>Total Products</p>

                <h3>{stats.totalProducts}</h3>
              </div>
            </div>

            <div className="overview-item">
              <div className="overview-icon">
                <ShoppingCart size={20} />
              </div>

              <div>
                <p>Total Orders</p>

                <h3>{stats.totalOrders}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
