const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  logout,
  changePassword,
  updateProfile,
} = require("../controller/userController");
const upload = require("../middleware/multer");
const authMiddleware = require("../middleware/auth");
router.post("/signup", upload.single("profileImage"), registerUser);
router.post("/login", loginUser);
router.post("/logout", logout);
// router.post("/changePassword", authMiddleware, changePassword);
// router.put("/change-password", authMiddleware, changePassword);
router.put("/update-profile",authMiddleware, upload.single("profileImage"),updateProfile);

module.exports = router;
