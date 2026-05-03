import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import client from "../../api/client";
import "../../styles/dashboard.css";

// MOCK FALLBACK
const MOCK_ORDERS = [
  {
    id: 201,
    customer_name: "Aibek D.",
    created_at: new Date(Date.now() - 3 * 60000).toISOString(),
    pickup_time: "12:30",
    status: "pending",
    total_price: 2150,
    items: [
      { name: "Pilaf with Chicken", quantity: 1 },
      { name: "Black Tea", quantity: 2 },
      { name: "Samsa (2 pcs)", quantity: 1 },
    ],
  },
  {
    id: 202,
    customer_name: "Dana K.",
    created_at: new Date(Date.now() - 10 * 60000).toISOString(),
    pickup_time: "12:45",
    status: "confirmed",
    total_price: 1950,
    items: [
      { name: "Caesar Salad", quantity: 1 },
      { name: "Fresh Orange Juice", quantity: 1 },
    ],
  },
  {
    id: 203,
    customer_name: "Ruslan M.",
    created_at: new Date(Date.now() - 20 * 60000).toISOString(),
    pickup_time: "12:15",
    status: "preparing",
    total_price: 2600,
    items: [
      { name: "Grilled Chicken Plate", quantity: 1 },
      { name: "Cheese Burger", quantity: 1 },
    ],
  },
  {
    id: 204,
    customer_name: "Zarina T.",
    created_at: new Date(Date.now() - 35 * 60000).toISOString(),
    pickup_time: "12:00",
    status: "ready",
    total_price: 1300,
    items: [
      { name: "Lagman Soup", quantity: 1 },
      { name: "French Fries", quantity: 1 },
    ],
  },
];

const STATUS_NEXT = {
  pending: { next: "confirmed", label: "Confirm Order", color: "btn-confirm" },
  confirmed: {
    next: "preparing",
    label: "Start Preparing",
    color: "btn-prepare",
  },
  preparing: { next: "ready", label: "Mark Ready", color: "btn-ready" },
  ready: null,
  delivered: null,
};

const STATUS_META = {
  pending: { label: "Pending", color: "status--pending" },
  confirmed: { label: "Confirmed", color: "status--confirmed" },
  preparing: { label: "Preparing", color: "status--preparing" },
  ready: { label: "Ready 🔔", color: "status--ready" },
  delivered: { label: "Done ✓", color: "status--delivered" },
};

export default function CafeDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null); // order id being updated

  const fetchOrders = async () => {
    try {
      const res = await client.get("/orders");
      setOrders(res.data);
    } catch {
      console.warn("Using mock cafe orders");
      setOrders(MOCK_ORDERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 20000);
    return () => clearInterval(interval);
  }, []);

  const advanceStatus = async (orderId, nextStatus) => {
    setUpdating(orderId);
    try {
      await client.patch(`/orders/${orderId}/status`, { status: nextStatus });
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
    } catch {
      // MOCK FALLBACK: update locally
      console.warn("API unavailable, updating status locally");
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o)),
      );
    } finally {
      setUpdating(null);
    }
  };

  const activeOrders = orders.filter((o) => o.status !== "delivered");
  const doneOrders = orders.filter((o) => o.status === "delivered");

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading orders..." />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Order Dashboard</h1>
            <p className="page-subtitle">Manage incoming orders in real-time</p>
          </div>
          <div className="header-stats">
            <div className="stat-chip stat-chip--active">
              {activeOrders.length} Active
            </div>
            <div className="stat-chip stat-chip--done">
              {doneOrders.length} Done
            </div>
            <button className="btn btn-outline" onClick={fetchOrders}>
              ↻ Refresh
            </button>
          </div>
        </div>

        {activeOrders.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="All caught up!"
            message="No active orders right now."
          />
        ) : (
          <div className="orders-grid">
            {activeOrders.map((order) => {
              const nextAction = STATUS_NEXT[order.status];
              return (
                <div
                  key={order.id}
                  className={`order-staff-card order-staff-card--${order.status}`}
                >
                  <div className="order-staff-header">
                    <div>
                      <span className="order-id">#{order.id}</span>
                      <span className="order-customer">
                        {order.customer_name}
                      </span>
                    </div>
                    <span
                      className={`status-badge ${STATUS_META[order.status]?.color}`}
                    >
                      {STATUS_META[order.status]?.label}
                    </span>
                  </div>

                  <div className="order-staff-items">
                    {order.items.map((item, i) => (
                      <div key={i} className="staff-item-row">
                        <span className="staff-item-dot">•</span>
                        <span>{item.name}</span>
                        <span className="staff-item-qty">
                          × {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="order-staff-footer">
                    <div className="order-meta">
                      <span>⏰ Pickup: {order.pickup_time}</span>
                      <span>₸ {order.total_price.toLocaleString()}</span>
                    </div>
                    {nextAction && (
                      <button
                        className={`btn ${nextAction.color}`}
                        onClick={() => advanceStatus(order.id, nextAction.next)}
                        disabled={updating === order.id}
                      >
                        {updating === order.id
                          ? "Updating..."
                          : nextAction.label}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {doneOrders.length > 0 && (
          <div className="done-section">
            <h3 className="section-title">Completed Today</h3>
            <div className="done-list">
              {doneOrders.map((order) => (
                <div key={order.id} className="done-row">
                  <span>
                    #{order.id} — {order.customer_name}
                  </span>
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
