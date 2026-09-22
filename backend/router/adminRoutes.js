const express = require("express");
const {
  getDashboard,
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  updateUserStatus,
  deleteUser,
  getOrderById,
   getUserById
} = require("../controller/adminController");
const adminMiddleware = require("../middleware/admin");
const router = express.Router();
router.use(adminMiddleware);
router.get("/dashboard", getDashboard);
router.get("/users", getAllUsers);
router.patch("/users/:id/status", updateUserStatus);
router.delete("/users/:id", deleteUser);
router.get("/orders", getAllOrders);
router.patch("/orders/:id/status", updateOrderStatus);
router.get("/orders/:id", adminMiddleware, getOrderById);
router.get("/users/:id", getUserById);
module.exports = router;
