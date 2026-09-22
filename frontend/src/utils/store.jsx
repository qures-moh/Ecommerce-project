import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import productReducer from "./productSlice";
import userReducer from "./userSlice"
import cartReducer from "./cartSlice"
import whistlistReducer from "./wishlist"
const store = configureStore({
  reducer: {
    auth: authReducer,
      products: productReducer,
      user:userReducer,
      cart:cartReducer,
      whishlist:whistlistReducer
  },
});

export default store;