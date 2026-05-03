import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import EmptyState from "../../components/EmptyState";
import useCartStore from "../../store/cartStore";
import client from "../../api/client";
import "../../styles/menu.css";

// MOCK FALLBACK
const MOCK_MENU = [
  {
    id: 1,
    name: "Pilaf with Chicken",
    category: "Mains",
    price: 1200,
    description:
      "Classic Kazakh pilaf with tender chicken, carrots, and spices.",
    image: "🍚",
    available: true,
  },
  {
    id: 2,
    name: "Lagman Soup",
    category: "Soups",
    price: 900,
    description:
      "Hand-pulled noodles in a rich meat broth with fresh vegetables.",
    image: "🍜",
    available: true,
  },
  {
    id: 3,
    name: "Samsa (2 pcs)",
    category: "Snacks",
    price: 500,
    description: "Baked pastry filled with minced meat and onions.",
    image: "🥟",
    available: true,
  },
  {
    id: 4,
    name: "Caesar Salad",
    category: "Salads",
    price: 850,
    description: "Crisp romaine, parmesan, croutons, and Caesar dressing.",
    image: "🥗",
    available: true,
  },
  {
    id: 5,
    name: "Grilled Chicken Plate",
    category: "Mains",
    price: 1500,
    description: "Juicy grilled chicken breast with side salad and rice.",
    image: "🍗",
    available: true,
  },
  {
    id: 6,
    name: "Borsch",
    category: "Soups",
    price: 750,
    description: "Traditional beet soup with sour cream and fresh herbs.",
    image: "🍲",
    available: true,
  },
  {
    id: 7,
    name: "Cheese Burger",
    category: "Fast Food",
    price: 1100,
    description: "Beef patty, cheddar, lettuce, tomato in a toasted bun.",
    image: "🍔",
    available: true,
  },
  {
    id: 8,
    name: "French Fries",
    category: "Snacks",
    price: 450,
    description: "Golden crispy fries with ketchup and mayo.",
    image: "🍟",
    available: true,
  },
  {
    id: 9,
    name: "Black Tea",
    category: "Drinks",
    price: 200,
    description: "Hot Kazakh black tea, served with sugar.",
    image: "🍵",
    available: true,
  },
  {
    id: 10,
    name: "Fresh Orange Juice",
    category: "Drinks",
    price: 600,
    description: "Freshly squeezed orange juice, no added sugar.",
    image: "🍊",
    available: true,
  },
  {
    id: 11,
    name: "Chocolate Muffin",
    category: "Desserts",
    price: 380,
    description: "Warm chocolate muffin baked fresh daily.",
    image: "🧁",
    available: true,
  },
  {
    id: 12,
    name: "Manty (4 pcs)",
    category: "Mains",
    price: 950,
    description: "Steamed dumplings filled with seasoned lamb and onion.",
    image: "🥘",
    available: true,
  },
];

const ALL_CATEGORIES = ["All", ...new Set(MOCK_MENU.map((i) => i.category))];

export default function Menu() {
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [addedIds, setAddedIds] = useState(new Set());

  const { addItem, items } = useCartStore();

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await client.get("/menu");
        setMenuItems(res.data);
      } catch {
        // MOCK FALLBACK
        console.warn("Using mock menu data");
        setMenuItems(MOCK_MENU);
      } finally {
        setLoading(false);
      }
    };
    fetchMenu();
  }, []);

  const categories = ["All", ...new Set(menuItems.map((i) => i.category))];

  const filtered = menuItems.filter((item) => {
    const matchCategory =
      activeCategory === "All" || item.category === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch && item.available;
  });

  const getCartQty = (id) => {
    const cartItem = items.find((i) => i.id === id);
    return cartItem ? cartItem.quantity : 0;
  };

  const handleAdd = (item) => {
    addItem(item);
    setAddedIds((prev) => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.delete(item.id);
        return next;
      });
    }, 1200);
  };

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading today's menu..." />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="menu-header">
          <div>
            <h1 className="page-title">Today's Menu</h1>
            <p className="page-subtitle">SDU Canteen — fresh meals every day</p>
          </div>
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`category-tab ${activeCategory === cat ? "active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon="🍽️"
            title="No items found"
            message="Try a different category or search term."
            action={{
              label: "Clear filters",
              onClick: () => {
                setActiveCategory("All");
                setSearch("");
              },
            }}
          />
        ) : (
          <div className="menu-grid">
            {filtered.map((item) => {
              const qty = getCartQty(item.id);
              const justAdded = addedIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className={`menu-card ${justAdded ? "menu-card--pulse" : ""}`}
                >
                  <div className="menu-card-image">{item.image}</div>
                  <div className="menu-card-body">
                    <span className="menu-card-category">{item.category}</span>
                    <h3 className="menu-card-name">{item.name}</h3>
                    <p className="menu-card-desc">{item.description}</p>
                    <div className="menu-card-footer">
                      <span className="menu-card-price">
                        ₸ {item.price.toLocaleString()}
                      </span>
                      {qty > 0 ? (
                        <span className="cart-qty-badge">✓ {qty} in cart</span>
                      ) : null}
                      <button
                        className={`btn btn-add ${justAdded ? "btn-add--success" : ""}`}
                        onClick={() => handleAdd(item)}
                      >
                        {justAdded ? "✓ Added" : "+ Add"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
