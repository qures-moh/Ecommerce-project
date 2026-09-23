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
  ChevronDown,
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

  const user = useSelector((state) => state.user?.user);

  const menuItems = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "Products",
      path: "/products",
      icon: Package,
    },
    {
      name: "Orders",
      path: "/orders",
      icon: ShoppingCart,
    },
    {
      name: "Users",
      path: "/users",
      icon: Users,
    },
    {
      name: "Categories",
      path: "/categories",
      icon: Tag,
    },
    {
      name: "Subcategories",
      path: "/subcategories",
      icon: Tags,
    },
    {
      name: "Attributes",
      path: "/attributes",
      icon: SlidersHorizontal,
    },
    {
      name: "Attribute Values",
      path: "/attribute-values",
      icon: List,
    },
  ];

  const handleLogout = async () => {
    try {
      await api.post("user/logout");
    } catch (error) {
      console.log(error);
    }

    dispatch(removeUser());
    dispatch(removeToken());

    toast.success("Logout successful");

    navigate("/admin/login");
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
          <div className="admin-logo-box">
            <Package size={23} />
          </div>

          <h1>Shoply</h1>

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

        <div className="admin-sidebar-bottom">
          <div className="grow-store-card">
            <div className="grow-icon">
              <Package size={27} />
            </div>

            <h3>Grow Your Store</h3>

            <p>
              Add new products and increase your sales
            </p>

            <button
              onClick={() => navigate("/products/add")}
            >
              <Plus size={18} />
              Add Product
            </button>
          </div>
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
            <div className="admin-profile">
              <div className="admin-avatar">
                {user?.firstName
                  ? user.firstName.charAt(0).toUpperCase()
                  : "A"}
              </div>

              <div className="admin-profile-info">
                <p>{user?.firstName || "Admin"}</p>
                <span>Administrator</span>
              </div>

              <ChevronDown size={17} />
            </div>

            <button
              className="admin-logout"
              onClick={handleLogout}
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;