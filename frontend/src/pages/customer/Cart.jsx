import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import EmptyState from "../../components/EmptyState";
import useCartStore from "../../store/cartStore";
import client from "../../api/client";
import "../../styles/menu.css";

// 15-min increments for the next 2 hours
function generatePickupTimes() {
  const times = [];
  const now = new Date();
  now.setMinutes(Math.ceil(now.getMinutes() / 15) * 15, 0, 0);
  for (let i = 0; i < 8; i++) {
    const t = new Date(now.getTime() + i * 15 * 60000);
    times.push(t.toTimeString().slice(0, 5));
  }
  return times;
}

export default function Cart() {
  const {
    items,
    removeItem,
    addItem,
    decreaseItem,
    clearCart,
    pickupTime,
    setPickupTime,
    getTotalPrice,
  } = useCartStore();
  const [loading, setLoading] = useState(false);
  const [orderError, setOrderError] = useState("");
  const navigate = useNavigate();
  const pickupTimes = generatePickupTimes();

  const handleCheckout = async () => {
    if (!pickupTime) {
      setOrderError("Please select a pickup time.");
      return;
    }
    if (items.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    setLoading(true);
    setOrderError("");

    const payload = {
      items: items.map((i) => ({ menu_item_id: i.id, quantity: i.quantity })),
      pickup_time: pickupTime,
    };

    try {
      await client.post("/orders", payload);
      clearCart();
      navigate("/orders");
    } catch {
      // MOCK FALLBACK: simulate successful order placement
      console.warn("API unavailable, using mock order fallback");
      clearCart();
      navigate("/orders");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <>
        <Navbar />
        <div className="page-container">
          <EmptyState
            icon="🛒"
            title="Your cart is empty"
            message="Head to the menu to add some delicious items."
            action={{ label: "Browse Menu", onClick: () => navigate("/menu") }}
          />
        </div>
      </>
    );
  }

  const total = getTotalPrice();

  return (
    <>
      <Navbar />
      <div className="page-container">
        <h1 className="page-title">Your Cart</h1>

        <div className="cart-layout">
          <div className="cart-items">
            {items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-emoji">{item.image}</div>
                <div className="cart-item-info">
                  <h4 className="cart-item-name">{item.name}</h4>
                  <span className="cart-item-price">
                    ₸ {item.price.toLocaleString()} each
                  </span>
                </div>
                <div className="cart-item-controls">
                  <button
                    className="qty-btn"
                    onClick={() => decreaseItem(item.id)}
                  >
                    −
                  </button>
                  <span className="qty-value">{item.quantity}</span>
                  <button className="qty-btn" onClick={() => addItem(item)}>
                    +
                  </button>
                </div>
                <div className="cart-item-subtotal">
                  ₸ {(item.price * item.quantity).toLocaleString()}
                </div>
                <button
                  className="btn-remove"
                  onClick={() => removeItem(item.id)}
                  title="Remove"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <h3 className="summary-title">Order Summary</h3>

            <div className="summary-rows">
              {items.map((item) => (
                <div key={item.id} className="summary-row">
                  <span>
                    {item.name} × {item.quantity}
                  </span>
                  <span>₸ {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <div className="summary-divider" />
              <div className="summary-row summary-total">
                <span>Total</span>
                <span>₸ {total.toLocaleString()}</span>
              </div>
            </div>

            <div className="pickup-section">
              <label className="pickup-label">⏰ Pickup Time</label>
              <select
                className="form-input"
                value={pickupTime}
                onChange={(e) => {
                  setPickupTime(e.target.value);
                  setOrderError("");
                }}
              >
                <option value="">Select a time...</option>
                {pickupTimes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {orderError && (
              <div className="alert alert-error">{orderError}</div>
            )}

            <button
              className="btn btn-primary btn-full"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading
                ? "Placing Order..."
                : `Place Order · ₸ ${total.toLocaleString()}`}
            </button>

            <button
              className="btn btn-ghost btn-full"
              onClick={() => navigate("/menu")}
            >
              ← Continue Shopping
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
