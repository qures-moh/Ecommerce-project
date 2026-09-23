import { useState, useEffect } from "react";
import api from "../utils/axios";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Calendar,
  Users,
  Camera,
  UserPlus,
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

  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  const validateSignup = () => {
    const firstName = user.firstName.trim();
    const lastName = user.lastName.trim();
    const email = user.email.trim();
    const password = user.password;

    if (!firstName) {
      toast.error("First name is required");
      return false;
    }

    if (firstName.length < 2) {
      toast.error(
        "First name must be at least 2 characters"
      );
      return false;
    }

    if (firstName.length > 30) {
      toast.error(
        "First name cannot exceed 30 characters"
      );
      return false;
    }

    if (!lastName) {
      toast.error("Last name is required");
      return false;
    }

    if (lastName.length < 2) {
      toast.error(
        "Last name must be at least 2 characters"
      );
      return false;
    }

    if (lastName.length > 30) {
      toast.error(
        "Last name cannot exceed 30 characters"
      );
      return false;
    }

    if (!email) {
      toast.error("Email is required");
      return false;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email");
      return false;
    }

    if (!password) {
      toast.error("Password is required");
      return false;
    }

    if (password.length < 6) {
      toast.error(
        "Password must be at least 6 characters"
      );
      return false;
    }

    if (!user.dob) {
      toast.error("Date of birth is required");
      return false;
    }

    if (!user.gender) {
      toast.error("Please select your gender");
      return false;
    }

    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setUser((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        "Image size should be less than 5MB"
      );
      e.target.value = "";
      return;
    }

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

    if (!validateSignup()) {
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append(
        "firstName",
        user.firstName.trim()
      );

      formData.append(
        "lastName",
        user.lastName.trim()
      );

      formData.append(
        "email",
        user.email.trim()
      );

      formData.append(
        "password",
        user.password
      );

      formData.append(
        "dob",
        user.dob
      );

      formData.append(
        "gender",
        user.gender
      );

      if (user.profileImage) {
        formData.append(
          "profileImage",
          user.profileImage
        );
      }

      const res = await api.post(
        "/user/signup",
        formData
      );

      setUser({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        dob: "",
        gender: "",
        profileImage: null,
      });

      setImagePreview("");

      toast.success(
        res.data.message ||
          "Signup successful!"
      );

      navigate("/");
    } catch (error) {
      console.log(
        "Signup error:",
        error
      );

      toast.error(
        error.response?.data?.message ||
          "Signup failed!"
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

          <p>
            Join Shoply and start shopping today
          </p>
        </div>

        <form
          className="signup-form"
          onSubmit={handleSubmit}
          noValidate
        >

          <div className="signup-name-grid">

            <div className="signup-form-group">
              <label
                className="signup-field-label"
                htmlFor="firstName"
              >
                First name
              </label>

              <div className="signup-input-wrapper">
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
            </div>

            <div className="signup-form-group">
              <label
                className="signup-field-label"
                htmlFor="lastName"
              >
                Last name
              </label>

              <div className="signup-input-wrapper">
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
            </div>

          </div>

          <div className="signup-form-group">
            <label
              className="signup-field-label"
              htmlFor="signup-email"
            >
              Email address
            </label>

            <div className="signup-input-wrapper">
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
          </div>

          <div className="signup-form-group">
            <label
              className="signup-field-label"
              htmlFor="signup-password"
            >
              Password
            </label>

            <div className="signup-input-wrapper">
              <Lock size={18} />

              <input
                id="signup-password"
                type="password"
                name="password"
                value={user.password}
                placeholder="Enter your password"
                onChange={handleChange}
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="signup-name-grid">

            <div className="signup-form-group">
              <label
                className="signup-field-label"
                htmlFor="dob"
              >
                Date of birth
              </label>

              <div className="signup-input-wrapper">
                <Calendar size={18} />

                <input
                  id="dob"
                  type="date"
                  name="dob"
                  value={user.dob}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="signup-form-group">
              <label
                className="signup-field-label"
                htmlFor="gender"
              >
                Gender
              </label>

              <div className="signup-input-wrapper">
                <Users size={18} />

                <select
                  id="gender"
                  name="gender"
                  value={user.gender}
                  onChange={handleChange}
                >
                  <option value="">
                    Select gender
                  </option>

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                  <option value="Other">
                    Other
                  </option>
                </select>
              </div>
            </div>

          </div>

          <div className="signup-form-group">

            <label
              className="signup-field-label"
              htmlFor="profileImage"
            >
              Profile photo
            </label>

            {imagePreview && (
              <div className="signup-image-preview">
                <img
                  src={imagePreview}
                  alt="Selected profile"
                />
              </div>
            )}

            <label
              htmlFor="profileImage"
              className="signup-file-upload"
            >
              <Camera
                className="signup-file-icon"
                size={18}
              />

              <span className="signup-file-text">
                {user.profileImage
                  ? user.profileImage.name
                  : "Choose profile photo"}
              </span>

              <span className="signup-file-button">
                Browse
              </span>

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

          </div>

          <button
            type="submit"
            className="signup-submit-button"
            disabled={loading}
          >
            <UserPlus size={18} />

            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

        </form>

        <div className="signup-footer">
          <p>
            Already have an account?{" "}
            <Link to="/login">
              Login
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}