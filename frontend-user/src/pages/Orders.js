import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Orders.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f39c12', bg: '#fef9ec', icon: '⏳' },
  in_process: { label: 'In Process', color: '#2980b9', bg: '#ebf5fb', icon: '👨‍🍳' },
  ready: { label: 'Ready for Pickup!', color: '#27ae60', bg: '#eafaf1', icon: '✅' },
  declined: { label: 'Declined', color: '#e74c3c', bg: '#fef0f0', icon: '✕' },
};

export default function Orders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { navigate('/auth?redirect=/orders'); return; }
    API.get('/orders/my').then(r => setOrders(r.data)).finally(() => setLoading(false));
  }, [user, navigate]);

  if (loading) return <div className="orders-page"><div className="loading-spinner" style={{margin:'4rem auto'}}></div></div>;

  return (
    <div className="orders-page">
      <div className="orders-container fade-up">
        <h1>My Orders</h1>
        {orders.length === 0 ? (
          <div className="no-orders">
            <span>📋</span>
            <p>No orders yet</p>
            <button onClick={() => navigate('/')}>Start Ordering</button>
          </div>
        ) : (
          <div className="orders-list">
            {orders.map(order => {
              const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
              return (
                <div key={order.id} className="order-card">
                  <div className="order-header">
                    <div>
                      <span className="order-id">Order #{order.id}</span>
                      <span className="order-date">{new Date(order.created_at).toLocaleDateString('en-US', {day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'})}</span>
                    </div>
                    <div className="order-status" style={{ color: sc.color, background: sc.bg }}>
                      {sc.icon} {sc.label}
                    </div>
                  </div>
                  <div className="order-items">
                    {order.items.map(item => (
                      <div key={item.id} className="order-item-row">
                        <span>{item.item_name}</span>
                        <span>× {item.quantity}</span>
                        <span>{(item.price_at_order * item.quantity).toFixed(2)} ₸</span>
                      </div>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span className="pickup-tag">🕐 {order.pickup_time}</span>
                    <span className="order-total">{order.total_price.toFixed(2)} ₸</span>
                  </div>
                  {order.status === 'ready' && (
                    <div className="ready-banner">🎉 Your order is ready! Please pick it up at the cafe.</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
