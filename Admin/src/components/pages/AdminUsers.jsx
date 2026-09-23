import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  UserCheck,
  UserX,
  Trash2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import api from "../../utils/axios";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [confirmAction, setConfirmAction] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/admin/users", {
        params: {
          page,
          limit,
        },
      });

      setUsers(response.data.users || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (error) {
      console.error("FETCH USERS ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to load users."
      );
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getUserName = (user) => {
    return (
      `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
      "Unknown User"
    );
  };

  const getInitial = (user) => {
    return getUserName(user)
      .charAt(0)
      .toUpperCase();
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

    const baseUrl =
      api.defaults.baseURL?.replace(/\/api\/?$/, "") ||
      "http://localhost:3000";

    const cleanImage = image
      .replace(/\\/g, "/")
      .replace(/^\/+/, "");

    return `${baseUrl}/${cleanImage}`;
  };

  const handleImageError = (e) => {
    e.currentTarget.style.display = "none";

    const fallback =
      e.currentTarget.parentElement.querySelector(
        ".user-avatar-fallback"
      );

    if (fallback) {
      fallback.style.display = "flex";
    }
  };

  const openStatusConfirmation = (user) => {
    setConfirmAction({
      type: "status",
      user,
    });
  };

  const openDeleteConfirmation = (user) => {
    setConfirmAction({
      type: "delete",
      user,
    });
  };

  const closeConfirmation = () => {
    if (!actionLoading) {
      setConfirmAction(null);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmAction?.user) return;

    const user = confirmAction.user;

    try {
      setActionLoading(true);
      setError("");

      if (confirmAction.type === "status") {
        await api.patch(
          `/admin/users/${user._id}/status`,
          {
            isActive: !user.isActive,
          }
        );
      }

      if (confirmAction.type === "delete") {
        await api.delete(
          `/admin/users/${user._id}`
        );
      }

      setConfirmAction(null);
      await fetchUsers();
    } catch (error) {
      console.error("USER ACTION ERROR:", error);

      setError(
        error.response?.data?.message ||
          "Unable to complete the action."
      );
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-users-page">
        <div className="users-header">
          <div>
            <h1>Users</h1>
            <p>Manage your customers</p>
          </div>
        </div>

        <div className="users-loading">
          Loading users...
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-page">
      <div className="users-header">
        <div>
          <h1>Users</h1>
          <p>Manage your customers</p>
        </div>
      </div>

      {error && (
        <div className="users-error">
          {error}
        </div>
      )}

      <div className="users-table-card">
        {users.length === 0 ? (
          <div className="users-empty">
            <UserX size={40} />

            <h3>No users found</h3>

            <p>
              There are no customers available.
            </p>
          </div>
        ) : (
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">
                        <span
                          className="user-avatar-fallback"
                          style={{
                            display: user.profileImage
                              ? "none"
                              : "flex",
                          }}
                        >
                          {getInitial(user)}
                        </span>

                        {user.profileImage && (
                          <img
                            src={getImageUrl(
                              user.profileImage
                            )}
                            alt={getUserName(user)}
                            onError={handleImageError}
                          />
                        )}
                      </div>

                      <div className="user-name-wrapper">
                        <strong>
                          {getUserName(user)}
                        </strong>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="user-email">
                      {user.email}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`user-status ${
                        user.isActive
                          ? "user-active"
                          : "user-inactive"
                      }`}
                    >
                      {user.isActive
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </td>

                  <td>
                    <span className="user-date">
                      {formatDate(user.createdAt)}
                    </span>
                  </td>

                  <td>
                    <div className="user-actions">
                      <Link
                        to={`/admin/users/${user._id}`}
                        className="user-view-btn"
                        title="View User"
                      >
                        <Eye size={18} />
                      </Link>

                      <button
                        type="button"
                        className={`user-status-btn ${
                          user.isActive
                            ? "deactivate-btn"
                            : "activate-btn"
                        }`}
                        title={
                          user.isActive
                            ? "Deactivate User"
                            : "Activate User"
                        }
                        onClick={() =>
                          openStatusConfirmation(user)
                        }
                      >
                        {user.isActive ? (
                          <UserX size={17} />
                        ) : (
                          <UserCheck size={17} />
                        )}
                      </button>

                      <button
                        type="button"
                        className="user-delete-btn"
                        title="Delete User"
                        onClick={() =>
                          openDeleteConfirmation(user)
                        }
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {users.length > 0 && (
        <div className="users-pagination">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() =>
              setPage((prev) => prev - 1)
            }
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
            onClick={() =>
              setPage((prev) => prev + 1)
            }
          >
            Next
            <ChevronRight size={17} />
          </button>
        </div>
      )}

      {confirmAction && (
        <div className="user-confirm-overlay">
          <div className="user-confirm-modal">
            <div className="user-confirm-icon">
              <AlertTriangle size={25} />
            </div>

            {confirmAction.type === "status" ? (
              <>
                <h2>
                  {confirmAction.user.isActive
                    ? "Deactivate User?"
                    : "Activate User?"}
                </h2>

                <p>
                  Are you sure you want to{" "}
                  {confirmAction.user.isActive
                    ? "deactivate"
                    : "activate"}{" "}
                  <strong>
                    {getUserName(
                      confirmAction.user
                    )}
                  </strong>
                  ?
                </p>
              </>
            ) : (
              <>
                <h2>Delete User?</h2>

                <p>
                  Are you sure you want to delete{" "}
                  <strong>
                    {getUserName(
                      confirmAction.user
                    )}
                  </strong>
                  ? This action cannot be undone.
                </p>
              </>
            )}

            <div className="user-confirm-actions">
              <button
                type="button"
                className="user-confirm-cancel"
                onClick={closeConfirmation}
                disabled={actionLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className={
                  confirmAction.type === "delete"
                    ? "user-confirm-delete"
                    : "user-confirm-action"
                }
                onClick={handleConfirmAction}
                disabled={actionLoading}
              >
                {actionLoading
                  ? "Please wait..."
                  : confirmAction.type === "delete"
                  ? "Delete User"
                  : "Confirm Change"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}