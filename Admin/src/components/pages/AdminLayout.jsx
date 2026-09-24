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
  Search,
} from "lucide-react";

import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

import api from "../../utils/axios";
import { removeUser } from "../../utils/userSlice";
import { removeToken } from "../../utils/authSlice";

const AdminLayout = () => {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [search, setSearch] = useState("");

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
      name: "Add Product",
      path: "/admin/products/add",
      icon: Plus,
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

  const filteredMenuItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase().trim())
  );

  const handleMenuClick = (path) => {
    navigate(path);
    setSearch("");
    setMobileMenu(false);
  };

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

  return (
    <div
      className={`admin-layout ${
        sidebarCollapsed ? "admin-sidebar-collapsed" : ""
      }`}
    >
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
            <NavLink
              to="/admin/dashboard"
              onClick={() => setMobileMenu(false)}
              className={({ isActive }) =>
                `admin-nav-link ${
                  isActive ? "admin-nav-active" : ""
                }`
              }
            >
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>

            <button
              className="admin-nav-link admin-add-product-sidebar"
              onClick={() => handleMenuClick("/admin/products/add")}
            >
              <Plus size={20} />
              <span>Add Product</span>
            </button>

            {menuItems.slice(2).map((item) => {
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
              className="admin-desktop-menu"
              onClick={() =>
                setSidebarCollapsed((prev) => !prev)
              }
            >
              <Menu size={24} />
            </button>

            <button
              className="admin-mobile-menu"
              onClick={() => setMobileMenu(true)}
            >
              <Menu size={24} />
            </button>
          </div>

          <div className="admin-topbar-search">
            <Search size={19} />

            <input
              type="text"
              placeholder="Search menu..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {search && (
              <button
                className="admin-topbar-search-clear"
                onClick={() => setSearch("")}
              >
                <X size={15} />
              </button>
            )}

            {search && (
              <div className="admin-search-suggestions">
                {filteredMenuItems.length > 0 ? (
                  filteredMenuItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.path}
                        className="admin-search-suggestion"
                        onClick={() => handleMenuClick(item.path)}
                      >
                        <Icon size={18} />
                        <span>{item.name}</span>
                      </button>
                    );
                  })
                ) : (
                  <div className="admin-no-search-result">
                    No menu found
                  </div>
                )}
              </div>
            )}
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