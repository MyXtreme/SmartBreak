import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useCartStore from "../store/cartStore";
import "../styles/navbar.css";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) =>
    location.pathname === path ? "nav-link active" : "nav-link";

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🍱</span>
          <span className="brand-name">SmartBreak</span>
        </Link>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <span />
          <span />
          <span />
        </button>

        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {user.role === "customer" && (
            <>
              <Link
                to="/menu"
                className={isActive("/menu")}
                onClick={() => setMenuOpen(false)}
              >
                Menu
              </Link>
              <Link
                to="/cart"
                className={isActive("/cart")}
                onClick={() => setMenuOpen(false)}
              >
                Cart
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>
              <Link
                to="/orders"
                className={isActive("/orders")}
                onClick={() => setMenuOpen(false)}
              >
                My Orders
              </Link>
            </>
          )}

          {user.role === "cafe_staff" && (
            <>
              <Link
                to="/cafe/dashboard"
                className={isActive("/cafe/dashboard")}
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Link>
              <Link
                to="/cafe/menu"
                className={isActive("/cafe/menu")}
                onClick={() => setMenuOpen(false)}
              >
                Manage Menu
              </Link>
            </>
          )}

          {user.role === "delivery_staff" && (
            <Link
              to="/delivery/dashboard"
              className={isActive("/delivery/dashboard")}
              onClick={() => setMenuOpen(false)}
            >
              Deliveries
            </Link>
          )}
        </div>

        <div className={`navbar-user ${menuOpen ? "open" : ""}`}>
          <span className="user-greeting">Hi, {user.name?.split(" ")[0]}</span>
          <span className="role-badge role-badge--{user.role}">
            {user.role.replace("_", " ")}
          </span>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
