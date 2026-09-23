import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminLogin from "./components/pages/AdminLogin";
import AdminLayout from "./components/pages/AdminLayout";
import AdminDashboard from "./components/pages/AdminDashboard";
import AdminProducts from "./components/pages/AdminProducts";
import AddProduct from "./components/pages/AddProduct";
import EditProduct from "./components/pages/EditProduct";
import AdminOrders from "./components/pages/AdminOrders";
import EditOrder from "./components/pages/EditOrder";
import AdminOrderDetails from "./components/pages/AdminOrderDetails";
import AdminUsers from "./components/pages/AdminUsers";
import AdminUserDetails from "./components/pages/AdminUserDetails";
import AdminCategories from "./components/pages/AdminCategories";
import AddCategory from "./components/pages/AddCategory";
import AdminSubcategories from "./components/pages/AdminSubcategories";
import AdminAttributes from "./components/pages/AdminAttributes";
import AdminAttributeValues from "./components/pages/AdminAttributeValues";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/admin/login"
          element={<AdminLogin />}
        />

        <Route path="/admin" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="/admin/dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="products"
            element={<AdminProducts />}
          />

          <Route
            path="products/add"
            element={<AddProduct />}
          />

          <Route
            path="products/edit/:id"
            element={<EditProduct />}
          />

          <Route
            path="orders"
            element={<AdminOrders />}
          />

          <Route
            path="orders/edit/:id"
            element={<EditOrder />}
          />

          <Route
            path="orders/:id"
            element={<AdminOrderDetails />}
          />

          <Route
            path="users"
            element={<AdminUsers />}
          />

          <Route
            path="users/:id"
            element={<AdminUserDetails />}
          />

          <Route
            path="categories"
            element={<AdminCategories />}
          />

          <Route
            path="categories/add"
            element={<AddCategory />}
          />

          <Route
            path="subcategories"
            element={<AdminSubcategories />}
          />

          <Route
            path="attributes"
            element={<AdminAttributes />}
          />

          <Route
            path="attribute-values"
            element={<AdminAttributeValues />}
          />
        </Route>
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;