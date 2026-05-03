import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import client from "../../api/client";
import "../../styles/dashboard.css";

// MOCK FALLBACK v
const MOCK_READY = [
  {
    id: 301,
    customer_name: "Aibek D.",
    customer_room: "Room 214, Building A",
    pickup_time: "12:30",
    created_at: new Date(Date.now() - 25 * 60000).toISOString(),
    total_price: 2150,
    status: "ready",
    items: [
      { name: "Pilaf with Chicken", quantity: 1 },
      { name: "Black Tea", quantity: 2 },
    ],
  },
  {
    id: 302,
    customer_name: "Zarina T.",
    customer_room: "Room 105, Library",
    pickup_time: "12:45",
    created_at: new Date(Date.now() - 8 * 60000).toISOString(),
    total_price: 1350,
    status: "ready",
    items: [
      { name: "Lagman Soup", quantity: 1 },
      { name: "Chocolate Muffin", quantity: 1 },
    ],
  },
];

export default function DeliveryDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [delivering, setDelivering] = useState(null);
  const [delivered, setDelivered] = useState([]);

  const fetchReady = async () => {
    try {
      const res = await client.get("/deliveries/ready");
      setOrders(res.data);
    } catch {
      console.warn("Using mock delivery data");
      setOrders(MOCK_READY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReady();
    const interval = setInterval(fetchReady, 25000);
    return () => clearInterval(interval);
  }, []);

  const markDelivered = async (orderId) => {
    setDelivering(orderId);
    try {
      await client.patch(`/deliveries/${orderId}/deliver`);
    } catch {
      console.warn("API unavailable, marking delivered locally");
    }
    setOrders((prev) => prev.filter((o) => o.id !== orderId));
    setDelivered((prev) => [...prev, orderId]);
    setDelivering(null);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading deliveries..." />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Delivery Dashboard</h1>
            <p className="page-subtitle">
              Orders ready to be picked up and delivered
            </p>
          </div>
          <div className="header-stats">
            <div className="stat-chip stat-chip--active">
              {orders.length} Pending
            </div>
            <div className="stat-chip stat-chip--done">
              {delivered.length} Delivered
            </div>
            <button className="btn btn-outline" onClick={fetchReady}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="🛵"
            title="No deliveries right now"
            message="Ready orders will appear here. Check back soon!"
          />
        ) : (
          <div className="delivery-grid">
            {orders.map((order) => (
              <div key={order.id} className="delivery-card">
                <div className="delivery-card-header">
                  <div>
                    <span className="order-id">Order #{order.id}</span>
                    <span className="status-badge status--ready">🔔 Ready</span>
                  </div>
                  <span className="order-time">
                    {new Date(order.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>

                <div className="delivery-customer">
                  <div className="delivery-row">
                    <span className="delivery-icon">👤</span>
                    <span>{order.customer_name}</span>
                  </div>
                  <div className="delivery-row">
                    <span className="delivery-icon">📍</span>
                    <span>{order.customer_room}</span>
                  </div>
                  <div className="delivery-row">
                    <span className="delivery-icon">⏰</span>
                    <span>Requested by {order.pickup_time}</span>
                  </div>
                </div>

                <div className="delivery-items">
                  {order.items.map((item, i) => (
                    <span key={i} className="delivery-item-tag">
                      {item.name} × {item.quantity}
                    </span>
                  ))}
                </div>

                <div className="delivery-footer">
                  <span className="delivery-total">
                    ₸ {order.total_price.toLocaleString()}
                  </span>
                  <button
                    className="btn btn-deliver"
                    onClick={() => markDelivered(order.id)}
                    disabled={delivering === order.id}
                  >
                    {delivering === order.id
                      ? "Marking..."
                      : "✓ Mark Delivered"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {delivered.length > 0 && (
          <div className="done-section">
            <h3 className="section-title">Delivered this session</h3>
            <div className="done-list">
              {delivered.map((id) => (
                <div key={id} className="done-row">
                  <span>Order #{id}</span>
                  <span className="status-badge status--delivered">
                    Delivered ✓
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
