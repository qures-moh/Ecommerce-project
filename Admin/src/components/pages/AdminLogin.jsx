import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, LogIn } from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch } from "react-redux";

import api from "../../utils/axios";
import { setToken } from "../../utils/authSlice";
import { addUser } from "../../utils/userSlice";

export default function AdminLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser({
      ...user,
      [name]: value,
    });
  };

  const validateLogin = () => {
    const email = user.email.trim();
    const password = user.password;

    if (!email) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return false;
    }

    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!validateLogin()) {
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/login", {
        email: user.email.trim(),
        password: user.password,
      });

      console.log("Admin login response:", res.data);

      const loggedInUser = res.data.user;

      if (loggedInUser?.role !== "admin") {
        toast.error("You are not authorized to access the admin panel");
        return;
      }

      dispatch(setToken(res.data.token));
      dispatch(addUser(loggedInUser));

      toast.success(
        res.data.message || "Admin login successful!"
      );

      setUser({
        email: "",
        password: "",
      });

      navigate("/admin/dashboard");
    } catch (error) {
      console.log("Admin login error:", error);

      toast.error(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-container">
        <div className="admin-login-header">
          <div className="admin-login-logo">
            <LogIn size={22} />
          </div>

          <h1>Admin Login</h1>

          <p>
            Sign in to your Shoply admin account
          </p>
        </div>

        <form
          className="admin-login-form"
          onSubmit={handleLogin}
          noValidate
        >
          <div className="admin-login-form-group">
            <label htmlFor="admin-login-email">
              Email address
            </label>

            <div className="admin-login-input-wrapper">
              <Mail size={19} />

              <input
                id="admin-login-email"
                type="email"
                name="email"
                placeholder="Enter your admin email"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="admin-login-form-group">
            <label htmlFor="admin-login-password">
              Password
            </label>

            <div className="admin-login-input-wrapper">
              <Lock size={19} />

              <input
                id="admin-login-password"
                type="password"
                name="password"
                placeholder="Enter your password"
                value={user.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-login-submit-button"
            disabled={loading}
          >
            <LogIn size={18} />

            {loading ? "Logging in..." : "Admin Login"}
          </button>
        </form>
      </div>
    </div>
  );
}