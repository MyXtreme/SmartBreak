import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/authStore";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/ProtectedRoute";

import Menu from "./pages/customer/Menu";
import Cart from "./pages/customer/Cart";
import OrderStatus from "./pages/customer/OrderStatus";

import CafeDashboard from "./pages/cafe/Dashboard";
import ManageMenu from "./pages/cafe/ManageMenu";

import DeliveryDashboard from "./pages/delivery/Dashboard";

function RoleRedirect() {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "cafe_staff")
    return <Navigate to="/cafe/dashboard" replace />;
  if (user.role === "delivery_staff")
    return <Navigate to="/delivery/dashboard" replace />;
  return <Navigate to="/menu" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Root redirect */}
        <Route path="/" element={<RoleRedirect />} />

        {/* Customer */}
        <Route element={<ProtectedRoute allowedRoles={["customer"]} />}>
          <Route path="/menu" element={<Menu />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<OrderStatus />} />
        </Route>

        {/* Cafe Staff */}
        <Route element={<ProtectedRoute allowedRoles={["cafe_staff"]} />}>
          <Route path="/cafe/dashboard" element={<CafeDashboard />} />
          <Route path="/cafe/menu" element={<ManageMenu />} />
        </Route>

        {/* Delivery Staff */}
        <Route element={<ProtectedRoute allowedRoles={["delivery_staff"]} />}>
          <Route path="/delivery/dashboard" element={<DeliveryDashboard />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
