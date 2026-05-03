import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-icon">☕</span>
        <div>
          <div className="logo-title">SmartBreak</div>
          <div className="logo-sub">Admin Panel</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/" end className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>📊</span> Dashboard
        </NavLink>
        <NavLink to="/menu" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>🍽️</span> Menu Manager
        </NavLink>
        <NavLink to="/orders" className={({isActive}) => `nav-item ${isActive ? 'active' : ''}`}>
          <span>📋</span> Orders
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="admin-info">
          <div className="admin-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div>
            <div className="admin-name">{user?.name?.split(' ')[0]}</div>
            <div className="admin-role">Administrator</div>
          </div>
        </div>
        <button className="logout-btn" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
      </div>
    </aside>
  );
}
