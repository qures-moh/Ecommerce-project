import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  Tags,
  SlidersHorizontal,
  List,
  Plus,
  Menu,
  X,
  LogOut,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../../utils/axios";
import { removeUser } from "../../utils/userSlice";
import { removeToken } from "../../utils/authSlice";

const AdminLayout = () => {
  const [mobileMenu, setMobileMenu] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);

  const isLoggedIn = !!user;

  const menuItems = [
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/admin/products",
      icon: Package,
    },
    {
      name: "Orders",
      path: "/admin/orders",
      icon: ShoppingCart,
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: Users,
    },
    {
      name: "Categories",
      path: "/admin/categories",
      icon: Tag,
    },
    {
      name: "Subcategories",
      path: "/admin/subcategories",
      icon: Tags,
    },
    {
      name: "Attributes",
      path: "/admin/attributes",
      icon: SlidersHorizontal,
    },
    {
      name: "Attribute Values",
      path: "/admin/attribute-values",
      icon: List,
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
    } catch (error) {
      console.log(error);
    }

    dispatch(removeUser());
    dispatch(removeToken());

    toast.success("Logout successful");

    navigate("/admin/login");
  };

  const handleLogin = () => {
    navigate("/admin/login");
  };

  const handleAddProduct = () => {
    navigate("/admin/products/add");
  };

  return (
    <div className="admin-layout">
      {mobileMenu && (
        <div
          className="admin-overlay"
          onClick={() => setMobileMenu(false)}
        ></div>
      )}

      <aside
        className={`admin-sidebar ${
          mobileMenu ? "admin-sidebar-open" : ""
        }`}
      >
        <div className="admin-logo-section">
          <img
            src="/image.png"
            alt="Just Book It"
            className="admin-logo-image"
          />

          <button
            className="admin-close-button"
            onClick={() => setMobileMenu(false)}
          >
            <X size={22} />
          </button>
        </div>

        <div className="admin-menu">
          <p className="admin-menu-title">MENU</p>

          <nav>
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) =>
                    `admin-nav-link ${
                      isActive ? "admin-nav-active" : ""
                    }`
                  }
                >
                  <Icon size={20} />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-topbar">
          <div className="admin-topbar-left">
            <button
              className="admin-mobile-menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="admin-topbar-right">
            {isLoggedIn ? (
              <>
                <div className="admin-profile">
                  <div className="admin-avatar">
                    {user?.firstName
                      ? user.firstName.charAt(0).toUpperCase()
                      : "A"}
                  </div>

                  <div className="admin-profile-info">
                    <p>{user?.firstName || "Admin"}</p>
                    <span>
                      {user?.role
                        ? user.role.charAt(0).toUpperCase() +
                          user.role.slice(1)
                        : "Admin"}
                    </span>
                  </div>
                </div>

                <button
                  className="admin-add-product-top"
                  onClick={handleAddProduct}
                >
                  <Plus size={17} />
                  Add Product
                </button>

                <button
                  className="admin-logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} />
                  Logout
                </button>
              </>
            ) : (
              <button
                className="admin-login-button"
                onClick={handleLogin}
              >
                Login
              </button>
            )}
          </div>
        </header>

        <main className="admin-content">
          {isLoggedIn ? (
            <Outlet />
          ) : (
            <div className="admin-login-required">
              <div className="admin-login-required-box">
                <h1>Please Login First</h1>

                <p>
                  You need to login as an administrator to access
                  the admin panel.
                </p>

                <button
                  className="admin-login-required-button"
                  onClick={handleLogin}
                >
                  Login
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;