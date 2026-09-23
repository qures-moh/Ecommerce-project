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

        <Route
          path="/dashboard"
          element={<Navigate to="/admin/dashboard" replace />}
        />

        <Route
          path="/products"
          element={<Navigate to="/admin/products" replace />}
        />

        <Route
          path="/products/add"
          element={<Navigate to="/admin/products/add" replace />}
        />

        <Route
          path="/products/edit/:id"
          element={<Navigate to="/admin/products/edit/:id" replace />}
        />

        <Route
          path="/orders"
          element={<Navigate to="/admin/orders" replace />}
        />

        <Route
          path="/orders/edit/:id"
          element={<Navigate to="/admin/orders/edit/:id" replace />}
        />

        <Route
          path="/orders/:id"
          element={<Navigate to="/admin/orders/:id" replace />}
        />

        <Route
          path="/users"
          element={<Navigate to="/admin/users" replace />}
        />

        <Route
          path="/users/:id"
          element={<Navigate to="/admin/users/:id" replace />}
        />

        <Route
          path="/categories"
          element={<Navigate to="/admin/categories" replace />}
        />

        <Route
          path="/categories/add"
          element={<Navigate to="/admin/categories/add" replace />}
        />

        <Route
          path="/subcategories"
          element={<Navigate to="/admin/subcategories" replace />}
        />

        <Route
          path="/attributes"
          element={<Navigate to="/admin/attributes" replace />}
        />

        <Route
          path="/attribute-values"
          element={<Navigate to="/admin/attribute-values" replace />}
        />
      </Routes>

      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;