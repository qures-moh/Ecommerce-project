import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import Login from "./component/Login";
import SignUp from "./component/Signup";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Layout } from "./component/Layout";

import Products from "./component/Product";
import ProductDetails from "./component/ProductDetails";
import Cart from "./component/Cart";
import Wishlist from "./component/Wishlist";
import Checkout from "./component/Checkout";
import Profile from "./component/Profile";
import Orders from "./component/Order";
import OrderDetails from "./component/OrderDetails";
import OrderSuccess from "./component/OrderSucess";
import UpdateProfile from "./component/UpdateProfile";

import Hero from "./component/Hero";
import Category from "./component/Category";
import SubcategoryPage from "./component/SubcategoryPage";
import SubcategoryProducts from "./component/SubcategoryProducts";

import Slider from "./component/Slider";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/signup" element={<SignUp />} />

        <Route element={<Layout />}>
          <Route
            index
            element={
              <>
                <Slider />
                <Hero />
                <Category />
              </>
            }
          />

          <Route path="products" element={<Products />} />

          <Route path="products/:id" element={<ProductDetails />} />

          <Route path="categories" element={<Category />} />

          <Route
            path="categories/:categoryId"
            element={<SubcategoryPage />}
          />

          <Route
            path="categories/:categoryId/subcategories/:subcategoryId"
            element={<SubcategoryProducts />}
          />

          <Route path="cart" element={<Cart />} />

          <Route path="wishlist" element={<Wishlist />} />

          <Route path="checkout" element={<Checkout />} />

          <Route path="profile" element={<Profile />} />

          <Route path="orders" element={<Orders />} />

          <Route path="orders/:id" element={<OrderDetails />} />

          <Route
            path="order-success"
            element={<OrderSuccess />}
          />

          <Route
            path="update-profile"
            element={<UpdateProfile />}
          />
        </Route>
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;