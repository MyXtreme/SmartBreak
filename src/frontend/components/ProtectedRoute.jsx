import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function ProtectedRoute({ allowedRoles }) {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "cafe_staff")
      return <Navigate to="/cafe/dashboard" replace />;
    if (user.role === "delivery_staff")
      return <Navigate to="/delivery/dashboard" replace />;
    return <Navigate to="/menu" replace />;
  }

  return <Outlet />;
}
