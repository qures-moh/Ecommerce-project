const express = require("express");

const router = express.Router();

const { placeOrder, getMyOrders, getOrderById } = require("../controller/orderController");

const authMiddleware = require("../middleware/auth");

router.post("/place", authMiddleware, placeOrder);
router.get("/my-orders", authMiddleware, getMyOrders);
router.get("/:id", authMiddleware, getOrderById);
module.exports = router;
