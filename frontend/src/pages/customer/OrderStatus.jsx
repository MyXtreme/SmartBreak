import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import "../../styles/dashboard.css";

// MOCK FALLBACK
const MOCK_ORDERS = [
  {
    id: 101,
    created_at: new Date(Date.now() - 5 * 60000).toISOString(),
    pickup_time: "12:30",
    status: "preparing",
    total_price: 2150,
    items: [
      { name: "Pilaf with Chicken", quantity: 1, price: 1200 },
      { name: "Black Tea", quantity: 2, price: 200 },
      { name: "Samsa (2 pcs)", quantity: 1, price: 500 },
    ],
  },
  {
    id: 100,
    created_at: new Date(Date.now() - 90 * 60000).toISOString(),
    pickup_time: "11:00",
    status: "delivered",
    total_price: 1950,
    items: [
      { name: "Caesar Salad", quantity: 1, price: 850 },
      { name: "Cheese Burger", quantity: 1, price: 1100 },
    ],
  },
];

const STATUS_FLOW = ["pending", "confirmed", "preparing", "ready", "delivered"];

const STATUS_META = {
  pending: { label: "Pending", icon: "🕐", color: "status--pending" },
  confirmed: { label: "Confirmed", icon: "✅", color: "status--confirmed" },
  preparing: { label: "Preparing", icon: "👨‍🍳", color: "status--preparing" },
  ready: { label: "Ready", icon: "🔔", color: "status--ready" },
  delivered: { label: "Delivered", icon: "✓", color: "status--delivered" },
};

function OrderCard({ order }) {
  const currentIndex = STATUS_FLOW.indexOf(order.status);

  return (
    <div className="order-card">
      <div className="order-card-header">
        <div>
          <span className="order-id">Order #{order.id}</span>
          <span className="order-time">
            {new Date(order.created_at).toLocaleString()}
          </span>
        </div>
        <div className="order-header-right">
          <span className={`status-badge ${STATUS_META[order.status]?.color}`}>
            {STATUS_META[order.status]?.icon} {STATUS_META[order.status]?.label}
          </span>
          <span className="order-pickup">⏰ Pickup: {order.pickup_time}</span>
        </div>
      </div>

      {/* Status timeline */}
      <div className="status-timeline">
        {STATUS_FLOW.map((step, idx) => {
          const done = idx <= currentIndex;
          const active = idx === currentIndex;
          return (
            <React.Fragment key={step}>
              <div
                className={`timeline-step ${done ? "done" : ""} ${active ? "active" : ""}`}
              >
                <div className="timeline-dot">{done ? "✓" : idx + 1}</div>
                <span className="timeline-label">
                  {STATUS_META[step]?.label}
                </span>
              </div>
              {idx < STATUS_FLOW.length - 1 && (
                <div
                  className={`timeline-line ${done && idx < currentIndex ? "done" : ""}`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Items */}
      <div className="order-items-list">
        {order.items.map((item, i) => (
          <div key={i} className="order-item-row">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₸ {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <div className="order-item-row order-item-total">
          <span>Total</span>
          <span>₸ {order.total_price.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await client.get("/orders/my");
      setOrders(res.data);
    } catch {
      // MOCK FALLBACK
      console.warn("Using mock orders data");
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading your orders..." />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">My Orders</h1>
            <p className="page-subtitle">
              Track your order status in real-time
            </p>
          </div>
          <button className="btn btn-outline" onClick={fetchOrders}>
            ↻ Refresh
          </button>
        </div>

        {orders.length === 0 ? (
          <EmptyState
            icon="📋"
            title="No orders yet"
            message="Place your first order from the menu!"
            action={{ label: "Browse Menu", onClick: () => navigate("/menu") }}
          />
        ) : (
          <div className="orders-list">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
