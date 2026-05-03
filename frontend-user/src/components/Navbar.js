import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const handleOrderClick = (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth?redirect=/cart');
    } else {
      navigate('/cart');
    }
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-brand">
        <span className="brand-icon">☕</span>
        <span className="brand-name">SmartBreak</span>
      </Link>

      <div className="navbar-links">
        <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Menu</Link>
        {user && (
          <Link to="/orders" className={`nav-link ${location.pathname === '/orders' ? 'active' : ''}`}>My Orders</Link>
        )}
      </div>

      <div className="navbar-right">
        <button className="cart-btn" onClick={handleOrderClick}>
          <span className="cart-icon">🛒</span>
          {count > 0 && <span className="cart-badge">{count}</span>}
          <span className="cart-label">Basket</span>
        </button>
        {user ? (
          <div className="user-menu">
            <span className="user-greeting">Hi, {user.name.split(' ')[0]}</span>
            <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>Logout</button>
          </div>
        ) : (
          <Link to="/auth" className="login-btn">Sign In</Link>
        )}
      </div>
    </nav>
  );
}
