
const jwt = require("jsonwebtoken");
const User = require("../model/User");

const adminMiddleware = async (req, res, next) => {
  try {
  
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Please login first",
      });
    }

   
    const token = authHeader.split(" ")[1];

 
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

   
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

   
    if (user.role !== "admin") {
      return res.status(403).json({
        message: "Access denied. Admin only",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        message: "Admin account is inactive",
      });
    }

   
    req.userId = user._id;
    req.user = user;

    next();
  } catch (error) {
    console.log("ADMIN MIDDLEWARE ERROR:", error);

    return res.status(401).json({
      message: "Invalid or expired token",
    });
  }
};

module.exports = adminMiddleware;
