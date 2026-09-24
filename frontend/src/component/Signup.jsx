import { useState, useEffect } from "react";
import api from "../utils/axios";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Users,
  Camera,
  UserPlus,
  Eye,
  EyeOff,
} from "lucide-react";

export default function SignUp() {
  const navigate = useNavigate();

  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
    profileImage: null,
  });

  const [confirmPassword, setConfirmPassword] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const validateSignup = () => {
    const newErrors = {};

    const firstName = user.firstName.trim();
    const lastName = user.lastName.trim();
    const email = user.email.trim();
    const password = user.password;

    if (!firstName) {
      newErrors.firstName = "First name is required";
    } else if (firstName.length < 2) {
      newErrors.firstName = "First name must be at least 2 characters";
    } else if (firstName.length > 30) {
      newErrors.firstName = "First name cannot exceed 30 characters";
    }

    if (!lastName) {
      newErrors.lastName = "Last name is required";
    } else if (lastName.length < 2) {
      newErrors.lastName = "Last name must be at least 2 characters";
    } else if (lastName.length > 30) {
      newErrors.lastName = "Last name cannot exceed 30 characters";
    }

    if (!email) {
      newErrors.email = "Email is required";
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(email)) {
        newErrors.email = "Please enter a valid email";
      }
    }

    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (!user.dob) {
      newErrors.dob = "Date of birth is required";
    }

    if (!user.gender) {
      newErrors.gender = "Please select your gender";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    setSubmitError("");
  };

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;

    setConfirmPassword(value);

    setErrors((prev) => ({
      ...prev,
      confirmPassword: "",
    }));

    setSubmitError("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Please select a valid image",
      }));

      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        profileImage: "Image size should be less than 5MB",
      }));

      e.target.value = "";
      return;
    }

    setErrors((prev) => ({
      ...prev,
      profileImage: "",
    }));

    setUser((prev) => ({
      ...prev,
      profileImage: file,
    }));

    const previewUrl = URL.createObjectURL(file);
    setImagePreview(previewUrl);
  };

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmitError("");

    if (!validateSignup()) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("firstName", user.firstName.trim());

      formData.append("lastName", user.lastName.trim());

      formData.append("email", user.email.trim());

      formData.append("password", user.password);

      formData.append("dob", user.dob);

      formData.append("gender", user.gender);

      if (user.profileImage) {
        formData.append("profileImage", user.profileImage);
      }

      const res = await api.post("/user/signup", formData);

      setUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        dob: "",
        gender: "",
        profileImage: null,
      });

      setConfirmPassword("");
      setImagePreview("");
      setErrors({});

      navigate("/");
    } catch (error) {
      console.log("Signup error:", error);

      setSubmitError(
        error.response?.data?.message || "Signup failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-header">
          <div className="signup-logo">
            <UserPlus size={22} />
          </div>

          <h1>Create your account</h1>

          <p>Join Shoply and start shopping today</p>
        </div>

        {submitError && (
          <div className="signup-submit-error">{submitError}</div>
        )}

        <form className="signup-form" onSubmit={handleSubmit} noValidate>
          <div className="signup-name-grid">
            <div className="signup-form-group">
              <label className="signup-field-label" htmlFor="firstName">
                First name
              </label>

              <div
                className={`signup-input-wrapper ${
                  errors.firstName ? "signup-input-error" : ""
                }`}
              >
                <User size={18} />

                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={user.firstName}
                  placeholder="Enter first name"
                  onChange={handleChange}
                  autoComplete="given-name"
                />
              </div>

              {errors.firstName && (
                <span className="signup-error">{errors.firstName}</span>
              )}
            </div>

            <div className="signup-form-group">
              <label className="signup-field-label" htmlFor="lastName">
                Last name
              </label>

              <div
                className={`signup-input-wrapper ${
                  errors.lastName ? "signup-input-error" : ""
                }`}
              >
                <User size={18} />

                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={user.lastName}
                  placeholder="Enter last name"
                  onChange={handleChange}
                  autoComplete="family-name"
                />
              </div>

              {errors.lastName && (
                <span className="signup-error">{errors.lastName}</span>
              )}
            </div>
          </div>

          <div className="signup-form-group">
            <label className="signup-field-label" htmlFor="signup-email">
              Email address
            </label>

            <div
              className={`signup-input-wrapper ${
                errors.email ? "signup-input-error" : ""
              }`}
            >
              <Mail size={18} />

              <input
                id="signup-email"
                type="email"
                name="email"
                value={user.email}
                placeholder="Enter your email"
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            {errors.email && (
              <span className="signup-error">{errors.email}</span>
            )}
          </div>

          <div className="signup-form-group">
            <label className="signup-field-label" htmlFor="signup-password">
              Password
            </label>

            <div
              className={`signup-input-wrapper ${
                errors.password ? "signup-input-error" : ""
              }`}
            >
              <Lock size={18} />

              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                placeholder="Enter your password"
                onChange={handleChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <span className="signup-error">{errors.password}</span>
            )}
          </div>

          <div className="signup-form-group">
            <label
              className="signup-field-label"
              htmlFor="signup-confirm-password"
            >
              Confirm password
            </label>

            <div
              className={`signup-input-wrapper ${
                errors.confirmPassword ? "signup-input-error" : ""
              }`}
            >
              <Lock size={18} />

              <input
                id="signup-confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={handleConfirmPasswordChange}
                autoComplete="new-password"
              />

              <button
                type="button"
                className="signup-password-toggle"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.confirmPassword && (
              <span className="signup-error">{errors.confirmPassword}</span>
            )}
          </div>

          <div className="signup-name-grid">
            <div className="signup-form-group">
              <label className="signup-field-label" htmlFor="dob">
                Date of birth
              </label>

              <div
                className={`signup-input-wrapper ${
                  errors.dob ? "signup-input-error" : ""
                }`}
              >
                <Calendar size={18} />

                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={user.dob}
                  onChange={handleChange}
                />
              </div>

              {errors.dob && <span className="signup-error">{errors.dob}</span>}
            </div>

            <div className="signup-form-group">
              <label className="signup-field-label" htmlFor="gender">
                Gender
              </label>

              <div
                className={`signup-input-wrapper ${
                  errors.gender ? "signup-input-error" : ""
                }`}
              >
                <Users size={18} />

                <select
                  id="gender"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                >
                  <option value="">Select gender</option>

                  <option value="Male">Male</option>

                  <option value="Female">Female</option>

                  <option value="Other">Other</option>
                </select>
              </div>

              {errors.gender && (
                <span className="signup-error">{errors.gender}</span>
              )}
            </div>
          </div>

          <div className="signup-form-group">
            <label className="signup-field-label" htmlFor="profileImage">
              Profile photo
            </label>

            {imagePreview && (
              <div className="signup-image-preview">
                <img src={imagePreview} alt="Selected profile" />
              </div>
            )}

            <label
              htmlFor="profileImage"
              className={`signup-file-upload ${
                errors.profileImage ? "signup-file-upload-error" : ""
              }`}
            >
              <Camera className="signup-file-icon" size={18} />

              <span className="signup-file-text">
                {user.profileImage
                  ? user.profileImage.name
                  : "Choose profile photo"}
              </span>

              <span className="signup-file-button">Browse</span>

              <input
                id="profileImage"
                type="file"
                name="profileImage"
                accept="image/*"
                onChange={handleFileChange}
              />
            </label>

            <span className="signup-file-info">
              JPG, PNG or JPEG · Maximum 5MB
            </span>

            {errors.profileImage && (
              <span className="signup-error">{errors.profileImage}</span>
            )}
          </div>

          <button
            type="submit"
            className="signup-submit-button"
            disabled={loading}
          >
            <UserPlus size={18} />

            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <div className="signup-footer">
          <p>
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
