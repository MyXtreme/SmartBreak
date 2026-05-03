import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import LoadingSpinner from "../../components/LoadingSpinner";
import client from "../../api/client";
import "../../styles/dashboard.css";
import "../../styles/menu.css";

const EMPTY_FORM = {
  name: "",
  category: "",
  price: "",
  description: "",
  image: "🍽️",
  available: true,
};
const CATEGORIES = [
  "Mains",
  "Soups",
  "Salads",
  "Snacks",
  "Fast Food",
  "Drinks",
  "Desserts",
];
const EMOJIS = [
  "🍚",
  "🍜",
  "🥟",
  "🥗",
  "🍗",
  "🍲",
  "🍔",
  "🍟",
  "🍵",
  "🍊",
  "🧁",
  "🥘",
  "🍽️",
  "🥩",
  "🫕",
  "🧆",
];

// MOCK FALLBACK
const MOCK_MENU = [
  {
    id: 1,
    name: "Pilaf with Chicken",
    category: "Mains",
    price: 1200,
    description: "Classic Kazakh pilaf.",
    image: "🍚",
    available: true,
  },
  {
    id: 2,
    name: "Lagman Soup",
    category: "Soups",
    price: 900,
    description: "Hand-pulled noodle soup.",
    image: "🍜",
    available: true,
  },
  {
    id: 3,
    name: "Samsa (2 pcs)",
    category: "Snacks",
    price: 500,
    description: "Baked pastry.",
    image: "🥟",
    available: true,
  },
];

export default function ManageMenu() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchMenu = async () => {
    try {
      const res = await client.get("/menu");
      setItems(res.data);
    } catch {
      console.warn("Using mock menu data for manage page");
      setItems(MOCK_MENU);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const validateForm = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.category) e.category = "Select a category";
    if (!form.price || isNaN(form.price) || Number(form.price) <= 0)
      e.price = "Enter a valid price";
    if (!form.description.trim()) e.description = "Description is required";
    return e;
  };

  const handleChange = (e) => {
    const val =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm({ ...form, [e.target.name]: val });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setFormErrors({});
    setShowForm(true);
  };

  const openEdit = (item) => {
    setForm({ ...item, price: String(item.price) });
    setEditingId(item.id);
    setFormErrors({});
    setShowForm(true);
  };

  const handleSave = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSaving(true);
    const payload = { ...form, price: Number(form.price) };

    try {
      if (editingId) {
        await client.put(`/menu/${editingId}`, payload);
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingId ? { ...payload, id: editingId } : i,
          ),
        );
      } else {
        const res = await client.post("/menu", payload);
        setItems((prev) => [...prev, res.data]);
      }
    } catch {
      // MOCK FALLBACK: update locally
      console.warn("API unavailable, updating menu locally");
      if (editingId) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingId ? { ...payload, id: editingId } : i,
          ),
        );
      } else {
        setItems((prev) => [...prev, { ...payload, id: Date.now() }]);
      }
    } finally {
      setSaving(false);
      setShowForm(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await client.delete(`/menu/${id}`);
    } catch {
      console.warn("API unavailable, deleting locally");
    }
    setItems((prev) => prev.filter((i) => i.id !== id));
    setDeleteConfirm(null);
  };

  const toggleAvailable = async (item) => {
    const updated = { ...item, available: !item.available };
    try {
      await client.put(`/menu/${item.id}`, updated);
    } catch {
      console.warn("Toggling availability locally");
    }
    setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
  };

  if (loading)
    return (
      <>
        <Navbar />
        <LoadingSpinner message="Loading menu items..." />
      </>
    );

  return (
    <>
      <Navbar />
      <div className="page-container">
        <div className="page-header-row">
          <div>
            <h1 className="page-title">Manage Menu</h1>
            <p className="page-subtitle">{items.length} items in your menu</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            + Add Item
          </button>
        </div>

        {/* Modal form */}
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingId ? "Edit Item" : "New Menu Item"}</h2>
                <button
                  className="modal-close"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>

              <div className="form-group">
                <label>Name</label>
                <input
                  name="name"
                  className={`form-input ${formErrors.name ? "input-error" : ""}`}
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Dish name"
                />
                {formErrors.name && (
                  <span className="field-error">{formErrors.name}</span>
                )}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Category</label>
                  <select
                    name="category"
                    className={`form-input ${formErrors.category ? "input-error" : ""}`}
                    value={form.category}
                    onChange={handleChange}
                  >
                    <option value="">Select...</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <span className="field-error">{formErrors.category}</span>
                  )}
                </div>
                <div className="form-group">
                  <label>Price (₸)</label>
                  <input
                    name="price"
                    type="number"
                    className={`form-input ${formErrors.price ? "input-error" : ""}`}
                    value={form.price}
                    onChange={handleChange}
                    placeholder="1200"
                  />
                  {formErrors.price && (
                    <span className="field-error">{formErrors.price}</span>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className={`form-input textarea ${formErrors.description ? "input-error" : ""}`}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Short description..."
                  rows={2}
                />
                {formErrors.description && (
                  <span className="field-error">{formErrors.description}</span>
                )}
              </div>

              <div className="form-group">
                <label>Emoji Icon</label>
                <div className="emoji-picker">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      className={`emoji-btn ${form.image === e ? "emoji-btn--selected" : ""}`}
                      onClick={() => setForm({ ...form, image: e })}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group form-check">
                <label className="check-label">
                  <input
                    type="checkbox"
                    name="available"
                    checked={form.available}
                    onChange={handleChange}
                  />
                  Available for ordering
                </label>
              </div>

              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save Changes"
                      : "Add Item"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm */}
        {deleteConfirm && (
          <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div
              className="modal-box modal-box--sm"
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete this item?</h3>
              <p>This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="manage-menu-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className={`manage-item-card ${!item.available ? "manage-item-card--unavailable" : ""}`}
            >
              <div className="manage-item-emoji">{item.image}</div>
              <div className="manage-item-info">
                <h4>{item.name}</h4>
                <span className="manage-item-category">{item.category}</span>
                <p className="manage-item-desc">{item.description}</p>
                <span className="manage-item-price">
                  ₸ {item.price.toLocaleString()}
                </span>
              </div>
              <div className="manage-item-actions">
                <button
                  className={`toggle-btn ${item.available ? "toggle-btn--on" : "toggle-btn--off"}`}
                  onClick={() => toggleAvailable(item)}
                  title={item.available ? "Disable" : "Enable"}
                >
                  {item.available ? "Available" : "Hidden"}
                </button>
                <button
                  className="btn btn-sm btn-outline"
                  onClick={() => openEdit(item)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger-outline"
                  onClick={() => setDeleteConfirm(item.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
