import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Camera,
  ArrowLeft,
  Save,
} from "lucide-react";
import { toast } from "react-toastify";

import api from "../utils/axios";
import { addUser } from "../utils/userSlice";

const UpdateProfile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    dob: user?.dob ? user.dob.split("T")[0] : "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(
    user?.profileImage
      ? `http://localhost:3000/${user.profileImage.replace(/^\/+/, "")}`
      : ""
  );

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim()) {
      toast.error("First name is required");
      return;
    }

    if (!formData.lastName.trim()) {
      toast.error("Last name is required");
      return;
    }

    if (!formData.dob) {
      toast.error("Date of birth is required");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();

      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("dob", formData.dob);

      if (profileImage) {
        data.append("profileImage", profileImage);
      }

      const response = await api.put(
        "/user/update-profile",
        data
      );

      dispatch(addUser(response.data.user));

      toast.success("Profile updated successfully");

      navigate("/profile");
    } catch (error) {
      console.log(
        "UPDATE PROFILE ERROR:",
        error.response?.data
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="update-profile-page">
        <div className="update-login-box">
          <h2>Please login to update your profile</h2>

          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="update-profile-page">
      <div className="update-profile-container">

        <div className="update-profile-header">
          <button
            className="back-profile-btn"
            onClick={() => navigate("/profile")}
          >
            <ArrowLeft size={18} />
            Back to Profile
          </button>

          <h1>Update Profile</h1>

          <p>
            Update your personal information and profile photo
          </p>
        </div>

        <form
          className="update-profile-card"
          onSubmit={handleSubmit}
        >

          <div className="update-profile-top">

            <div className="update-image-section">
              <div className="update-profile-image">

                {preview ? (
                  <img
                    src={preview}
                    alt="Profile"
                  />
                ) : (
                  <User size={48} />
                )}

              </div>

              <label
                htmlFor="profileImage"
                className="change-photo-btn"
              >
                <Camera size={17} />
                Change Photo
              </label>

              <input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                hidden
              />

              <span className="photo-info">
                JPG, PNG or JPEG
              </span>
            </div>

            <div className="profile-basic-info">
              <h2>
                {user.firstName} {user.lastName}
              </h2>

              <p>{user.email}</p>
            </div>

          </div>

          <div className="update-divider"></div>

          <div className="update-profile-body">

            <div className="section-heading">
              <h2>Personal Information</h2>
              <p>
                Update your account information below.
              </p>
            </div>

            <div className="update-form-grid">

              <div className="update-form-group">
                <label>
                  First Name
                </label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter first name"
                  />
                </div>
              </div>

              <div className="update-form-group">
                <label>
                  Last Name
                </label>

                <div className="input-wrapper">
                  <User size={18} />

                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="update-form-group">
                <label>
                  Email Address
                </label>

                <div className="input-wrapper disabled-input">
                  <Mail size={18} />

                  <input
                    type="email"
                    value={user.email || ""}
                    disabled
                  />
                </div>

                <span className="field-note">
                  Email cannot be changed.
                </span>
              </div>

              <div className="update-form-group">
                <label>
                  Date of Birth
                </label>

                <div className="input-wrapper">
                  <Calendar size={18} />

                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                  />
                </div>
              </div>

            </div>

            <div className="gender-info">
              <div className="gender-icon">
                <User size={19} />
              </div>

              <div>
                <span>Gender</span>
                <strong>
                  {user.gender || "Not provided"}
                </strong>
              </div>

              <small>
                Gender cannot be changed.
              </small>
            </div>

          </div>

          <div className="update-profile-footer">

            <button
              type="button"
              className="cancel-update-btn"
              onClick={() => navigate("/profile")}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-profile-btn"
              disabled={loading}
            >
              <Save size={18} />

              {loading
                ? "Saving..."
                : "Save Changes"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UpdateProfile;