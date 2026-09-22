import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  UserRound,
  Edit,
  ShoppingBag,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();

  const user = useSelector((state) => state.user);

  if (!user) {
    return (
      <div className="profile-page">
        <div className="profile-empty">
          <h2>Please login to view your profile</h2>

          <button onClick={() => navigate("/login")}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">

     

        <div className="profile-page-header">
          <h1>My Profile</h1>

          <p>
            Manage your personal information and orders
          </p>
        </div>

     

        <div className="profile-card">

      
          <div className="profile-card-header">

            <div className="profile-user">
            <div className="profile-image">
  {user.profileImage ? (
    <img
      src={`http://localhost:3000/${String(user.profileImage)
        .replace(/^\/+/, "")
        .replace(/\\/g, "/")}`}
      alt="Profile"
    />
  ) : (
    <User size={42} />
  )}
</div>
              

              <div className="profile-user-info">

                <h2>
                  {user.firstName} {user.lastName}
                </h2>

                <p>{user.email}</p>

              </div>

            </div>

            <button
              className="edit-profile-btn"
              onClick={() => navigate("/update-profile")}
            >
              <Edit size={17} />
              Edit Profile
            </button>

          </div>

      

          <div className="profile-details">

            <div className="section-heading">

              <h2>User Details</h2>

              <p>Your personal account information</p>

            </div>

            <div className="details-grid">

           

              <div className="detail-item">

                <div className="detail-icon">
                  <User size={19} />
                </div>

                <div>
                  <span>First Name</span>
                  <p>{user.firstName || "Not provided"}</p>
                </div>

              </div>

         
              <div className="detail-item">

                <div className="detail-icon">
                  <User size={19} />
                </div>

                <div>
                  <span>Last Name</span>
                  <p>{user.lastName || "Not provided"}</p>
                </div>

              </div>

            

              <div className="detail-item">

                <div className="detail-icon">
                  <Mail size={19} />
                </div>

                <div>
                  <span>Email Address</span>
                  <p>{user.email || "Not provided"}</p>
                </div>

              </div>

            

              <div className="detail-item">

                <div className="detail-icon">
                  <Calendar size={19} />
                </div>

                <div>
                  <span>Date of Birth</span>
                  <p>{user.dob || "Not provided"}</p>
                </div>

              </div>

             

              <div className="detail-item">

                <div className="detail-icon">
                  <UserRound size={19} />
                </div>

                <div>
                  <span>Gender</span>
                  <p>{user.gender || "Not provided"}</p>
                </div>

              </div>

            </div>

          </div>

        </div>

   

        <div className="orders-card">

          <div className="orders-card-content">

            <div className="orders-icon">
              <ShoppingBag size={24} />
            </div>

            <div>
              <h2>My Orders</h2>

              <p>
                View and manage your previous orders
              </p>
            </div>

          </div>

          <button
            className="view-orders-btn"
            onClick={() => navigate("/orders")}
          >
            View Orders
          </button>

        </div>

      </div>
    </div>
  );
};

export default Profile;