import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import API from '../api';
import './Cart.css';

const PICKUP_TIMES = [
  "9:20 - 9:30", "10:20 - 10:30", "11:20 - 11:30",
  "12:20 - 12:30", "13:20 - 13:30", "14:20 - 14:30",
  "15:20 - 15:30", "16:20 - 16:30"
];

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pickupTime, setPickupTime] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!user) { navigate('/auth?redirect=/cart'); return null; }

  const handleOrder = async () => {
    if (!pickupTime) { setError('Please select a pickup time'); return; }
    if (cart.length === 0) { setError('Your cart is empty'); return; }
    setLoading(true);
    setError('');
    try {
      await API.post('/orders/', {
        pickup_time: pickupTime,
        items: cart.map(i => ({ menu_item_id: i.id, quantity: i.quantity }))
      });
      clearCart();
      setSuccess(true);
      setTimeout(() => navigate('/orders'), 2000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (success) return (
    <div className="cart-page">
      <div className="success-screen fade-up">
        <div className="success-icon">✅</div>
        <h2>Order Placed!</h2>
        <p>Your order has been placed. Redirecting to your orders...</p>
      </div>
    </div>
  );

  return (
    <div className="cart-page">
      <div className="cart-container fade-up">
        <h1>Your Basket</h1>

        {cart.length === 0 ? (
          <div className="empty-cart">
            <span>🛒</span>
            <p>Your cart is empty</p>
            <button onClick={() => navigate('/')}>Browse Menu</button>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="cart-items">
              {cart.map(item => (
                <div key={item.id} className="cart-item">
                  <div className="item-info">
                    <span className="item-category">{item.category_name}</span>
                    <h3>{item.name}</h3>
                    <p className="item-price">{item.price.toFixed(2)} ₸ each</p>
                  </div>
                  <div className="item-controls">
                    <div className="qty-control">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                    </div>
                    <span className="item-subtotal">{(item.price * item.quantity).toFixed(2)} ₸</span>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <h2>Order Summary</h2>
              <div className="summary-lines">
                {cart.map(item => (
                  <div key={item.id} className="summary-line">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} ₸</span>
                  </div>
                ))}
              </div>
              <div className="summary-total">
                <span>Total</span>
                <span>{total.toFixed(2)} ₸</span>
              </div>

              <div className="pickup-section">
                <label>Pickup Time</label>
                <div className="time-grid">
                  {PICKUP_TIMES.map(t => (
                    <button
                      key={t}
                      className={`time-slot ${pickupTime === t ? 'selected' : ''}`}
                      onClick={() => setPickupTime(t)}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {error && <div className="cart-error">{error}</div>}

              <button className="confirm-btn" onClick={handleOrder} disabled={loading}>
                {loading ? 'Placing Order...' : 'Confirm Order'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
