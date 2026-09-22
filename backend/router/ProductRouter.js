const express = require("express");

const {
  addProduct,
  getProducts,
  deleteAllProducts,
  deleteProduct,
  updateProduct,
  getProductById,
} = require("../controller/ProductController");

const upload = require("../middleware/multer");
const adminMiddleware = require("../middleware/admin");

const productRouter = express.Router();

productRouter.post(
  "/products/add",
  adminMiddleware,
  upload.any(),
  addProduct
);

productRouter.get(
  "/products",
  getProducts
);

productRouter.get(
  "/products/:id",
  getProductById
);

productRouter.delete(
  "/deleteProduct",
  adminMiddleware,
  deleteAllProducts
);

productRouter.put(
  "/:id",
  adminMiddleware,
  upload.any(),
  updateProduct
);

productRouter.delete(
  "/:id",
  adminMiddleware,
  deleteProduct
);

module.exports = productRouter;