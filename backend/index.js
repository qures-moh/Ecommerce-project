const express = require("express");
const dotenv = require("dotenv");
const app = express();
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDb = require("./config/db");
const userRouter = require("./router/userRouter");
const productRouter = require("./router/ProductRouter");
const orderRoutes = require("./router/orderRoutes");
const adminRouter = require("./router/adminRoutes");
const categoryRoutes = require("./router/categoryRoutes");
const subcategoryRouter = require("./router/subcategoryRoutes");
const attributeRouter = require("./router/attributeRoutes");
const rateLimit = require("express-rate-limit");

const PORT = 3000;

dotenv.config();

app.set("trust proxy", 1);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://ecommerce-frontend-eg4r.onrender.com",
  "https://ecomerce-admin-9qwc.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many requests. Please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    message: "Too many authentication attempts. Please try again later.",
  },
});

app.use(cookieParser());

app.use("/uploads", express.static("uploads"));

app.use(express.json());

connectDb();

app.use("/api/user/login", authLimiter);

app.use("/api", apiLimiter);

app.use("/api/user", userRouter);

app.use("/api/", productRouter);

app.use("/api/orders", orderRoutes);

app.use("/api/admin", adminRouter);

app.use("/api/categories", categoryRoutes);

app.use("/api/subcategories", subcategoryRouter);

app.use("/api/attributes", attributeRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});