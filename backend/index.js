const express=require("express");
const dotenv=require("dotenv")
const app=express();
const cors=require("cors");
const cookieParser=require("cookie-parser");
const connectDb = require("./config/db");
const userRouter = require("./router/userRouter");
const productRouter = require("./router/ProductRouter");
const orderRoutes = require("./router/orderRoutes");
const adminRouter = require("./router/adminRoutes");
const categoryRoutes = require("./router/categoryRoutes");
const subcategoryRouter = require("./router/subcategoryRoutes");
const attributeRouter = require("./router/attributeRoutes");
const PORT=3000;
dotenv.config();

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "https://yourstore.com",
  "https://admin.yourstore.com",
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


app.use(cookieParser());
app.use("/uploads", express.static("uploads"));
app.use(express.json());
connectDb();



app.use("/api/user", userRouter);
app.use("/api/",productRouter);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRouter);
app.use("/api/categories", categoryRoutes);
app.use("/api/subcategories", subcategoryRouter);
app.use("/api/attributes", attributeRouter);


app.listen(PORT,()=>{
      console.log(`Server running on port ${PORT}`);

})

