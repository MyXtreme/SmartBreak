import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Dashboard.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get('/admin/stats').then(r => setStats(r.data));
  }, []);

  const cards = stats ? [
    { label: 'Total Orders', value: stats.total_orders, icon: '📋', color: 'var(--blue)' },
    { label: 'Pending', value: stats.pending_orders, icon: '⏳', color: 'var(--orange)' },
    { label: 'In Process', value: stats.in_process_orders, icon: '👨‍🍳', color: 'var(--blue)' },
    { label: 'Menu Items', value: stats.menu_items, icon: '🍽️', color: 'var(--green)' },
    { label: 'Registered Users', value: stats.total_users, icon: '👥', color: '#9b59b6' },
    { label: 'Revenue (₸)', value: stats.total_revenue.toFixed(0), icon: '💰', color: 'var(--accent)' },
  ] : [];

  return (
    <div className="dashboard fade-up">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user?.name?.split(' ')[0]}. Here's what's happening today.</p>
      </div>
      {stats ? (
        <div className="stats-grid">
          {cards.map((card, i) => (
            <div key={card.label} className="stat-card" style={{ animationDelay: `${i * 0.07}s` }}>
              <div className="stat-icon" style={{ background: card.color + '22', color: card.color }}>{card.icon}</div>
              <div className="stat-value">{card.value}</div>
              <div className="stat-label">{card.label}</div>
            </div>
          ))}
        </div>
      ) : (
        <div className="fullscreen-center" style={{ height: '200px' }}><div className="spinner"></div></div>
      )}
      <div className="quick-links">
        <h2>Quick Actions</h2>
        <div className="quick-grid">
          <a href="/menu" className="quick-card">
            <span>🍽️</span>
            <h3>Manage Menu</h3>
            <p>Add, edit or remove menu items</p>
          </a>
          <a href="/orders" className="quick-card">
            <span>📋</span>
            <h3>Manage Orders</h3>
            <p>Accept, decline and track orders</p>
          </a>
        </div>
      </div>
    </div>
  );
}
