import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import API from '../api';
import './Home.css';

const FOOD_EMOJI = { Coffee: '☕', Lemonade: '🍋', Sandwich: '🥪', Macaron: '🍬', Snack: '🍿' };

export default function Home() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [addedItems, setAddedItems] = useState({});
  const { user } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([API.get('/menu/items'), API.get('/menu/categories')]).then(([itemsR, catsR]) => {
      setItems(itemsR.data);
      const cats = ['All', ...catsR.data.map(c => c.name)];
      setCategories(cats);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = activeCategory === 'All' ? items : items.filter(i => i.category_name === activeCategory);

  const isUnavailable = (item) => item.is_countable && item.available_amount !== null && item.available_amount === 0;

  const handleAddToCart = (item) => {
    if (!user) {
      navigate('/auth?redirect=/');
      return;
    }
    if (isUnavailable(item)) return;
    const qty = quantities[item.id] || 1;
    addToCart(item, qty);
    setAddedItems(prev => ({ ...prev, [item.id]: true }));
    setTimeout(() => setAddedItems(prev => ({ ...prev, [item.id]: false })), 1500);
  };

  if (loading) return (
    <div className="loading-screen">
      <div className="loading-spinner"></div>
      <p>Loading menu...</p>
    </div>
  );

  return (
    <div className="home">
      <div className="hero">
        <div className="hero-content">
          <h1>Order Ahead,<br /><em>Skip the Queue</em></h1>
          <p>Pre-order your coffee and snacks. Pick up during your break — no waiting.</p>
        </div>
        <div className="hero-decoration">
          <div className="deco-circle c1"></div>
          <div className="deco-circle c2"></div>
          <span className="deco-emoji">☕</span>
        </div>
      </div>

      <div className="menu-section">
        <div className="category-tabs">
          {categories.map(cat => (
            <button
              key={cat}
              className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {FOOD_EMOJI[cat] || '🍽️'} {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid">
          {filtered.map((item, i) => {
            const unavail = isUnavailable(item);
            return (
              <div
                key={item.id}
                className={`menu-card ${unavail ? 'unavailable' : ''}`}
                style={{ animationDelay: `${i * 0.06}s` }}
              >
                <div className="card-image">
                  {item.photo_url ? (
                    <img
                      src={item.photo_url}
                      alt={item.name}
                      style={unavail ? { filter: 'grayscale(100%)' } : {}}
                    />
                  ) : (
                    <div className="card-emoji">{FOOD_EMOJI[item.category_name] || '🍽️'}</div>
                  )}
                  {unavail && <div className="unavail-badge">Sold Out</div>}
                  <div className="card-category">{item.category_name}</div>
                </div>
                <div className="card-body">
                  <h3 className="card-name">{item.name}</h3>
                  <p className="card-desc">{unavail ? <span className="no-avail-text">No available</span> : item.description}</p>
                  {item.is_countable && item.available_amount !== null && !unavail && (
                    <p className="stock-info">Left: {item.available_amount}</p>
                  )}
                  <div className="card-footer">
                    <span className="card-price">{item.price.toFixed(2)} ₸</span>
                    <div className="card-actions">
                      {!unavail && (
                        <div className="qty-selector">
                          <button onClick={() => setQuantities(prev => ({ ...prev, [item.id]: Math.max(1, (prev[item.id] || 1) - 1) }))}>−</button>
                          <span>{quantities[item.id] || 1}</span>
                          <button onClick={() => {
                            const max = item.is_countable && item.available_amount !== null ? item.available_amount : 99;
                            setQuantities(prev => ({ ...prev, [item.id]: Math.min(max, (prev[item.id] || 1) + 1) }));
                          }}>+</button>
                        </div>
                      )}
                      <button
                        className={`add-btn ${unavail ? 'disabled' : ''} ${addedItems[item.id] ? 'added' : ''}`}
                        onClick={() => handleAddToCart(item)}
                        disabled={unavail}
                      >
                        {addedItems[item.id] ? '✓ Added' : unavail ? 'Sold Out' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="empty-menu">
            <p>No items in this category yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
