import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Eye as EyeIcon,
  Pencil,
  Package,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import api from "../../utils/axios";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 10;

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/orders", {
        params: {
          page,
          limit,
          search: searchQuery,
          status,
        },
      });

      setOrders(response.data.orders || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("FETCH ORDERS ERROR:", error);

      setError(error.response?.data?.message || "Unable to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchOrders();
  }, [page, searchQuery, status]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
    setPage(1);
  };

  const getStatusClass = (orderStatus) => {
    return `order-status status-${orderStatus}`;
  };

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getCustomerName = (order) => {
    if (!order.user) {
      return "Unknown Customer";
    }

    return (
      `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim() ||
      "Unknown Customer"
    );
  };

  const getItemsCount = (order) => {
    if (!Array.isArray(order.items)) {
      return 0;
    }

    return order.items.reduce(
      (total, item) => total + Number(item.quantity || 1),
      0,
    );
  };

  const getUniqueItemsCount = (order) => {
    if (!Array.isArray(order.items)) {
      return 0;
    }

    return order.items.length;
  };

  if (loading) {
    return (
      <div className="admin-orders-page">
        <div className="orders-header">
          <div>
            <h1>Orders</h1>
            <p>Manage customer orders</p>
          </div>
        </div>

        <div className="orders-loading">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="admin-orders-page">
      <div className="orders-header">
        <div>
          <h1>Orders</h1>
          <p>Manage and track customer orders</p>
        </div>
      </div>

      {error && <div className="orders-error">{error}</div>}

      <div className="orders-filters">
        <div className="order-search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search orders..."
            value={search}
            onChange={handleSearch}
          />
        </div>

        <select value={status} onChange={handleStatusChange}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="orders-table-card">
        {orders.length === 0 ? (
          <div className="orders-empty">
            <Package size={38} />

            <h3>No orders found</h3>

            <p>There are no orders matching your search.</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>
                    <strong className="order-number">
                      #{order._id?.slice(-8).toUpperCase()}
                    </strong>
                  </td>

                  <td>
                    <div className="customer-cell">
                      <div className="customer-avatar">
                        {getCustomerName(order).charAt(0).toUpperCase()}
                      </div>

                      <div>
                        <strong>{getCustomerName(order)}</strong>

                        <span>
                          {order.user?.email ||
                            order.shippingAddress?.email ||
                            "No email"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div>
                      <strong>{getItemsCount(order)}</strong>

                      <span
                        style={{
                          display: "block",
                          fontSize: "12px",
                          color: "#6b7280",
                        }}
                      >
                        {getUniqueItemsCount(order)}{" "}
                        {getUniqueItemsCount(order) === 1
                          ? "product"
                          : "products"}
                      </span>
                    </div>
                  </td>

                  <td>
                    <strong className="order-total">
                      ₹
                      {Math.round(Number(order.total || 0)).toLocaleString(
                        "en-IN",
                      )}
                    </strong>
                  </td>

                  <td>
                    <span className={getStatusClass(order.status)}>
                      {order.status?.charAt(0).toUpperCase() +
                        order.status?.slice(1)}
                    </span>
                  </td>

                  <td>{formatDate(order.createdAt)}</td>

                  <td>
                    <div className="order-actions">
                      <Link
                        to={`/admin/orders/${order._id}`}
                        className="view-order-btn"
                        title="View Order"
                      >
                        <EyeIcon size={18} />
                      </Link>

                      <Link
                        to={`/admin/orders/edit/${order._id}`}
                        className="edit-order-btn"
                        title="Edit Order"
                      >
                        <Pencil size={18} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {orders.length > 0 && (
        <div className="orders-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
          >
            <ChevronLeft size={17} />
            Previous
          </button>

          <span>
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((prev) => prev + 1)}
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      )}
    </div>
  );
}
