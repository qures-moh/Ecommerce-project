import { useState } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { setToken } from "../utils/authSlice";
import { useDispatch } from "react-redux";
import { addUser } from "../utils/userSlice";
import { Mail, Lock, LogIn } from "lucide-react";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

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

    const { email, password } = user;

    if (!validateLogin()) {
      return;
    }

    try {
      const res = await api.post("/user/login", {
        email,
        password,
      });

      console.log("Login response:", res.data);

      dispatch(setToken(res.data.token));
      dispatch(addUser(res.data.user));

      toast.success(
        res.data.message || "Login successful!"
      );

      setUser({
        email: "",
        password: "",
      });

      navigate("/");
    } catch (error) {
      console.log("Login error:", error);

      toast.error(
        error.response?.data?.message ||
          "Login failed"
      );
    }
  };

  return (
    <div className="login login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={22} />
          </div>

          <h1>Welcome back</h1>

          <p>
            Sign in to your Shoply account
          </p>
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
          noValidate
        >
          <div className="login-form-group">
            <label htmlFor="email">
              Email address
            </label>

            <div className="login-input-wrapper">
              <Mail size={19} />

              <input
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email"
                value={user.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="login-form-group">
            <label htmlFor="password">
              Password
            </label>

            <div className="login-input-wrapper">
              <Lock size={19} />

              <input
                id="password"
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
            className="login-submit-button"
          >
            <LogIn size={18} />
            Login
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <Link to="/signup">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}