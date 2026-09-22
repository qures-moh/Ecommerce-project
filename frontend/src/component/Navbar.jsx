import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useDispatch,
  useSelector,
} from "react-redux";

import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  MapPin,
  Home,
  Grid2X2,
  Menu,
  X,
  Bell,
  ShoppingCart,
  Heart,
  User,
  LogOut,
  LayoutDashboard,
  Navigation,
  Package,
} from "lucide-react";

import api from "../utils/axios";
import { toast } from "react-toastify";

import { removeUser } from "../utils/userSlice";
import { removeToken } from "../utils/authSlice";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const [mobileOpen, setMobileOpen] =
    useState(false);

  const [profileOpen, setProfileOpen] =
    useState(false);

  const [locationOpen, setLocationOpen] =
    useState(false);

  const [locationSearch, setLocationSearch] =
    useState("");

  const [selectedLocation, setSelectedLocation] =
    useState({
      city: "Indore",
      state: "Madhya Pradesh",
      country: "India",
    });

  const [detectingLocation, setDetectingLocation] =
    useState(false);

  const [logoutConfirmOpen, setLogoutConfirmOpen] =
    useState(false);

  const profileRef = useRef(null);

  const user = useSelector(
    (store) => store.user
  );

  const cart = useSelector(
    (store) => store.cart
  );

  const isAdmin =
    user?.role === "admin";

  const cartCount = Array.isArray(cart)
    ? cart.reduce(
        (total, item) =>
          total +
          (Number(item.quantity) || 1),
        0
      )
    : 0;

  const locations = [
    {
      city: "Bengaluru",
      state: "Karnataka",
      country: "India",
    },
    {
      city: "Guwahati",
      state: "Assam",
      country: "India",
    },
    {
      city: "Indore",
      state: "Madhya Pradesh",
      country: "India",
    },
    {
      city: "Rajasthan",
      state: "Rajasthan",
      country: "India",
    },
    {
      city: "Thane",
      state: "Maharashtra",
      country: "India",
    },
    {
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
    },
    {
      city: "Delhi",
      state: "Delhi",
      country: "India",
    },
    {
      city: "Pune",
      state: "Maharashtra",
      country: "India",
    },
    {
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
    },
    {
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
    },
  ];

  const filteredLocations =
    locations.filter((item) => {
      const value =
        locationSearch
          .toLowerCase()
          .trim();

      if (!value) {
        return true;
      }

      return (
        item.city
          .toLowerCase()
          .includes(value) ||
        item.state
          .toLowerCase()
          .includes(value)
      );
    });

  const popularLocations =
    locations.filter(
      (item) =>
        item.city === "Bengaluru"
    );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen ||
      locationOpen ||
      logoutConfirmOpen
        ? "hidden"
        : "";

    return () => {
      document.body.style.overflow =
        "";
    };
  }, [
    mobileOpen,
    locationOpen,
    logoutConfirmOpen,
  ]);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  const openLocationSelector = () => {
    setLocationOpen(true);
    setLocationSearch("");
    setMobileOpen(false);
  };

  const closeLocationSelector = () => {
    if (!detectingLocation) {
      setLocationOpen(false);
      setLocationSearch("");
    }
  };

  const handleLocationSelect = (
    selected
  ) => {
    setSelectedLocation(selected);
    setLocationOpen(false);
    setLocationSearch("");

    toast.success(
      `Location changed to ${selected.city}`
    );
  };

  const handleLogout = () => {
    setLogoutConfirmOpen(true);
    setProfileOpen(false);
  };

  const cancelLogout = () => {
    setLogoutConfirmOpen(false);
  };

  const confirmLogout = async () => {
    try {
      await api.post(
        "/user/logout"
      );
    } catch (error) {
      console.log(
        "Logout error:",
        error
      );
    }

    dispatch(removeUser());
    dispatch(removeToken());

    setProfileOpen(false);
    setMobileOpen(false);
    setLogoutConfirmOpen(false);

    toast.success(
      "Logout successful"
    );

    navigate("/login");
  };

  const isActive = (path) => {
    if (path === "/") {
      return (
        location.pathname === "/"
      );
    }

    return location.pathname.startsWith(
      path
    );
  };

  return (
    <>
      <header className="jbi-navbar">
        <div className="jbi-navbar-inner">

          <Link
            to="/"
            className="jbi-brand"
            onClick={
              closeMobileMenu
            }
          >
            <img
              src="/Just-book.png"
              alt="Just Book It"
              className="jbi-logo"
            />
          </Link>

          <nav className="jbi-desktop-nav">

            <Link
              to="/"
              className={`jbi-nav-link ${
                isActive("/")
                  ? "jbi-nav-active"
                  : ""
              }`}
            >
              Home
            </Link>

            <Link
              to="/products"
              className={`jbi-nav-link ${
                isActive("/products")
                  ? "jbi-nav-active"
                  : ""
              }`}
            >
              Products
            </Link>

            <Link
              to="/categories"
              className={`jbi-nav-link ${
                isActive("/categories")
                  ? "jbi-nav-active"
                  : ""
              }`}
            >
              Categories
            </Link>

            {user && (
              <Link
                to="/orders"
                className={`jbi-nav-link ${
                  isActive("/orders")
                    ? "jbi-nav-active"
                    : ""
                }`}
              >
                Orders
              </Link>
            )}

          </nav>

          <div className="jbi-navbar-actions">

            <button
              type="button"
              className="jbi-location-box"
              onClick={
                openLocationSelector
              }
            >
              <MapPin size={18} />

              <span>
                {selectedLocation.city},{" "}
                {selectedLocation.state}
              </span>
            </button>

            {user ? (
              <>

                <button
                  type="button"
                  className="jbi-icon-button"
                  title="Notifications"
                >
                  <Bell size={19} />
                </button>

                <button
                  type="button"
                  className="jbi-icon-button"
                  title="Wishlist"
                  onClick={() =>
                    navigate(
                      "/wishlist"
                    )
                  }
                >
                  <Heart size={20} />
                </button>

                <button
                  type="button"
                  className="jbi-icon-button jbi-cart-button"
                  title="Cart"
                  onClick={() =>
                    navigate("/cart")
                  }
                >
                  <ShoppingCart
                    size={20}
                  />

                  {cartCount > 0 && (
                    <span className="jbi-cart-badge">
                      {cartCount > 99
                        ? "99+"
                        : cartCount}
                    </span>
                  )}
                </button>

                <div
                  className="jbi-profile-wrapper"
                  ref={profileRef}
                >

                  <button
                    type="button"
                    className="jbi-avatar-button"
                    onClick={() =>
                      setProfileOpen(
                        (prev) =>
                          !prev
                      )
                    }
                    title="Profile"
                  >
                    {user?.firstName
                      ?.charAt(0)
                      ?.toUpperCase() ||
                      "M"}
                  </button>

                  {profileOpen && (
                    <div className="jbi-profile-dropdown">

                      <div className="jbi-profile-name">
                        {user?.firstName ||
                          "User"}{" "}
                        {user?.lastName ||
                          ""}
                      </div>

                      <div className="jbi-dropdown-divider" />

                      <Link
                        to="/profile"
                        className="jbi-dropdown-item"
                        onClick={() =>
                          setProfileOpen(
                            false
                          )
                        }
                      >
                        <User size={18} />

                        <span>
                          My Profile
                        </span>
                      </Link>

                      <Link
                        to="/wishlist"
                        className="jbi-dropdown-item"
                        onClick={() =>
                          setProfileOpen(
                            false
                          )
                        }
                      >
                        <Heart size={18} />

                        <span>
                          Wishlist
                        </span>
                      </Link>

                      <Link
                        to="/orders"
                        className="jbi-dropdown-item"
                        onClick={() =>
                          setProfileOpen(
                            false
                          )
                        }
                      >
                        <Package
                          size={18}
                        />

                        <span>
                          My Orders
                        </span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="jbi-dropdown-item"
                          onClick={() =>
                            setProfileOpen(
                              false
                            )
                          }
                        >
                          <LayoutDashboard
                            size={18}
                          />

                          <span>
                            Admin Panel
                          </span>
                        </Link>
                      )}

                      <button
                        type="button"
                        className="jbi-dropdown-item jbi-dropdown-logout"
                        onClick={
                          handleLogout
                        }
                      >
                        <LogOut
                          size={18}
                        />

                        <span>
                          Log out
                        </span>
                      </button>

                    </div>
                  )}

                </div>

              </>
            ) : (
              <Link
                to="/login"
                className="jbi-signin-button"
              >
                Sign in
              </Link>
            )}

          </div>

          <button
            type="button"
            className="jbi-mobile-toggle"
            onClick={() =>
              setMobileOpen(
                (prev) => !prev
              )
            }
            aria-label="Toggle navigation"
          >
            {mobileOpen ? (
              <X size={28} />
            ) : (
              <Menu size={28} />
            )}
          </button>

        </div>

        <div
          className={`jbi-mobile-menu ${
            mobileOpen
              ? "jbi-mobile-menu-open"
              : ""
          }`}
        >

          <button
            type="button"
            className="jbi-mobile-location"
            onClick={
              openLocationSelector
            }
          >
            <MapPin size={21} />

            <div>
              <strong>
                Location
              </strong>

              <span>
                {selectedLocation.city},{" "}
                {selectedLocation.state}
              </span>
            </div>
          </button>

          <nav className="jbi-mobile-nav">

            <Link
              to="/"
              className={`jbi-mobile-link ${
                isActive("/")
                  ? "jbi-mobile-link-active"
                  : ""
              }`}
              onClick={
                closeMobileMenu
              }
            >
              <Home size={21} />

              <span>
                Home
              </span>
            </Link>

            <Link
              to="/products"
              className={`jbi-mobile-link ${
                isActive("/products")
                  ? "jbi-mobile-link-active"
                  : ""
              }`}
              onClick={
                closeMobileMenu
              }
            >
              <ShoppingCart
                size={21}
              />

              <span>
                Products
              </span>
            </Link>

            {user && (
              <Link
                to="/wishlist"
                className={`jbi-mobile-link ${
                  isActive("/wishlist")
                    ? "jbi-mobile-link-active"
                    : ""
                }`}
                onClick={
                  closeMobileMenu
                }
              >
                <Heart size={21} />

                <span>
                  Wishlist
                </span>
              </Link>
            )}

            <Link
              to="/categories"
              className={`jbi-mobile-link ${
                isActive("/categories")
                  ? "jbi-mobile-link-active"
                  : ""
              }`}
              onClick={
                closeMobileMenu
              }
            >
              <Grid2X2 size={21} />

              <span>
                Categories
              </span>
            </Link>

            {user && (
              <Link
                to="/orders"
                className={`jbi-mobile-link ${
                  isActive("/orders")
                    ? "jbi-mobile-link-active"
                    : ""
                }`}
                onClick={
                  closeMobileMenu
                }
              >
                <Package size={21} />

                <span>
                  Orders
                </span>
              </Link>
            )}

            {user && (
              <Link
                to="/cart"
                className={`jbi-mobile-link ${
                  isActive("/cart")
                    ? "jbi-mobile-link-active"
                    : ""
                }`}
                onClick={
                  closeMobileMenu
                }
              >
                <ShoppingCart
                  size={21}
                />

                <span>
                  Cart
                  {cartCount > 0
                    ? ` (${cartCount})`
                    : ""}
                </span>
              </Link>
            )}

            {user && (
              <Link
                to="/profile"
                className={`jbi-mobile-link ${
                  isActive("/profile")
                    ? "jbi-mobile-link-active"
                    : ""
                }`}
                onClick={
                  closeMobileMenu
                }
              >
                <User size={21} />

                <span>
                  My Profile
                </span>
              </Link>
            )}

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                className={`jbi-mobile-link ${
                  isActive("/admin")
                    ? "jbi-mobile-link-active"
                    : ""
                }`}
                onClick={
                  closeMobileMenu
                }
              >
                <LayoutDashboard
                  size={21}
                />

                <span>
                  Admin Panel
                </span>
              </Link>
            )}

          </nav>

          {user ? (
            <button
              type="button"
              className="jbi-mobile-signin"
              onClick={
                handleLogout
              }
            >
              <LogOut size={19} />

              Log out
            </button>
          ) : (
            <Link
              to="/login"
              className="jbi-mobile-signin"
              onClick={
                closeMobileMenu
              }
            >
              Sign in
            </Link>
          )}

        </div>

      </header>

      {locationOpen && (
        <div
          className="jbi-location-overlay"
          onClick={
            closeLocationSelector
          }
        >
          <div
            className="jbi-location-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="jbi-location-header">

              <h3>
                Choose location
              </h3>

              <button
                type="button"
                onClick={
                  closeLocationSelector
                }
                disabled={
                  detectingLocation
                }
                aria-label="Close"
              >
                <X size={18} />
              </button>

            </div>

            <button
              type="button"
              className="jbi-current-location"
              onClick={() => {
                setDetectingLocation(
                  true
                );

                setTimeout(() => {
                  setSelectedLocation({
                    city: "Indore",
                    state:
                      "Madhya Pradesh",
                    country:
                      "India",
                  });

                  setDetectingLocation(
                    false
                  );

                  setLocationOpen(
                    false
                  );

                  toast.success(
                    "Location detected successfully"
                  );
                }, 700);
              }}
              disabled={
                detectingLocation
              }
            >

              <div className="jbi-current-location-icon">
                <Navigation
                  size={19}
                />
              </div>

              <div>
                <strong>
                  {detectingLocation
                    ? "Detecting location..."
                    : "Use current location"}
                </strong>

                <span>
                  {detectingLocation
                    ? "Please wait..."
                    : "Detect from your device"}
                </span>
              </div>

            </button>

            <div className="jbi-location-search">

              <input
                type="text"
                placeholder="Search city or state..."
                value={
                  locationSearch
                }
                onChange={(e) =>
                  setLocationSearch(
                    e.target.value
                  )
                }
                autoFocus
              />

            </div>

            {!locationSearch && (
              <div className="jbi-popular-section">

                <div className="jbi-location-title">
                  POPULAR CITIES
                </div>

                <div className="jbi-popular-list">

                  {popularLocations.map(
                    (item) => (
                      <button
                        type="button"
                        key={
                          item.city
                        }
                        className={`jbi-popular-city ${
                          selectedLocation.city ===
                          item.city
                            ? "jbi-selected-city"
                            : ""
                        }`}
                        onClick={() =>
                          handleLocationSelect(
                            item
                          )
                        }
                      >
                        {item.city}
                      </button>
                    )
                  )}

                </div>

              </div>
            )}

            <div className="jbi-all-cities">

              <div className="jbi-location-title">
                {locationSearch
                  ? "SEARCH RESULTS"
                  : "ALL CITIES"}
              </div>

              <div className="jbi-location-list">

                {filteredLocations.length >
                0 ? (
                  filteredLocations.map(
                    (item) => (
                      <button
                        type="button"
                        key={`${item.city}-${item.state}`}
                        className={`jbi-location-option ${
                          selectedLocation.city ===
                            item.city &&
                          selectedLocation.state ===
                            item.state
                            ? "jbi-location-option-selected"
                            : ""
                        }`}
                        onClick={() =>
                          handleLocationSelect(
                            item
                          )
                        }
                      >

                        <div>
                          <strong>
                            {item.city}
                          </strong>

                          <span>
                            {item.state},{" "}
                            {item.country}
                          </span>
                        </div>

                        {selectedLocation.city ===
                          item.city &&
                          selectedLocation.state ===
                            item.state && (
                            <span className="jbi-location-check">
                              ✓
                            </span>
                          )}

                      </button>
                    )
                  )
                ) : (
                  <div className="jbi-no-location">
                    No locations found.
                  </div>
                )}

              </div>

            </div>

          </div>
        </div>
      )}

      {logoutConfirmOpen && (
        <div
          className="jbi-logout-overlay"
          onClick={cancelLogout}
        >
          <div
            className="jbi-logout-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="jbi-logout-icon">
              <LogOut size={24} />
            </div>

            <h3>
              Logout Confirmation
            </h3>

            <p>
              Are you sure you want to logout
              from your account?
            </p>

            <div className="jbi-logout-actions">

              <button
                type="button"
                className="jbi-logout-cancel"
                onClick={cancelLogout}
              >
                Cancel
              </button>

              <button
                type="button"
                className="jbi-logout-confirm"
                onClick={confirmLogout}
              >
                Logout
              </button>

            </div>

          </div>
        </div>
      )}

    </>
  );
}