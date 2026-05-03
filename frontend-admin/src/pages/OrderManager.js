import React, { useEffect, useState } from 'react';
import API from '../api';
import './OrderManager.css';

const STATUS_LABELS = {
  pending: { label: 'Pending', color: 'var(--orange)', bg: 'rgba(243,156,18,0.1)' },
  in_process: { label: 'In Process', color: 'var(--blue)', bg: 'rgba(52,152,219,0.1)' },
  ready: { label: 'Ready', color: 'var(--green)', bg: 'rgba(46,204,113,0.1)' },
  declined: { label: 'Declined', color: 'var(--red)', bg: 'rgba(231,76,60,0.1)' },
};

export default function OrderManager() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState({});

  const fetchOrders = () => {
    API.get('/orders/all').then(r => setOrders(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (orderId, status) => {
    setUpdating(p => ({ ...p, [orderId]: true }));
    try {
      await API.patch(`/orders/${orderId}/status`, { status });
      await fetchOrders();
    } finally {
      setUpdating(p => ({ ...p, [orderId]: false }));
    }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  const counts = orders.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {});

  return (
    <div className="order-manager fade-up">
      <div className="page-header">
        <h1>Order Manager</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Real-time order management · Auto-refreshes every 30s</p>
      </div>

      <div className="status-filters">
        <button className={`sf-btn ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All <span className="cnt">{orders.length}</span>
        </button>
        {Object.entries(STATUS_LABELS).map(([k, v]) => (
          <button key={k} className={`sf-btn ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)} style={filter === k ? { background: v.bg, color: v.color, borderColor: v.color } : {}}>
            {v.label} {counts[k] ? <span className="cnt">{counts[k]}</span> : ''}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <div className="orders-list">
          {filtered.length === 0 && <div className="empty-state">No orders found</div>}
          {filtered.map(order => {
            const sc = STATUS_LABELS[order.status];
            return (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-meta">
                    <span className="order-num">Order #{order.id}</span>
                    <span className="order-user">👤 {order.user_name} ({order.user_email})</span>
                    <span className="order-time">🕐 Pickup: <strong>{order.pickup_time}</strong></span>
                    <span className="order-date">{new Date(order.created_at).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="order-right">
                    <div className="order-total">{order.total_price.toFixed(2)} ₸</div>
                    <span className="status-badge" style={{ background: sc.bg, color: sc.color }}>
                      {sc.label}
                    </span>
                  </div>
                </div>

                <div className="order-items-list">
                  {order.items.map(item => (
                    <div key={item.id} className="order-item-row">
                      {item.photo_url && <img src={item.photo_url} alt="" />}
                      <span className="oi-name">{item.item_name}</span>
                      <span className="oi-qty">× {item.quantity}</span>
                      <span className="oi-price">{(item.price_at_order * item.quantity).toFixed(2)} ₸</span>
                    </div>
                  ))}
                </div>

                <div className="order-actions">
                  {order.status === 'pending' && (
                    <>
                      <button
                        className="action-btn accept"
                        disabled={updating[order.id]}
                        onClick={() => updateStatus(order.id, 'in_process')}
                      >
                        ✓ Accept Order
                      </button>
                      <button
                        className="action-btn decline"
                        disabled={updating[order.id]}
                        onClick={() => updateStatus(order.id, 'declined')}
                      >
                        ✕ Decline
                      </button>
                    </>
                  )}
                  {order.status === 'in_process' && (
                    <button
                      className="action-btn ready"
                      disabled={updating[order.id]}
                      onClick={() => updateStatus(order.id, 'ready')}
                    >
                      🎉 Mark as Ready
                    </button>
                  )}
                  {(order.status === 'ready' || order.status === 'declined') && (
                    <span className="final-status">
                      {order.status === 'ready' ? '✅ Customer can pick up' : '✕ Order declined'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
