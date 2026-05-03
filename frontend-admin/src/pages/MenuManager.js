import React, { useEffect, useState } from 'react';
import API from '../api';
import './MenuManager.css';

const EMPTY_FORM = { category_id: '', name: '', description: '', price: '', photo_url: '', available_amount: '' };

export default function MenuManager() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('All');

  const fetchData = async () => {
    const [itemsR, catsR] = await Promise.all([API.get('/menu/items/all'), API.get('/menu/categories')]);
    setItems(itemsR.data);
    setCategories(catsR.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const selectedCat = categories.find(c => c.id === parseInt(form.category_id));
  const isCountable = selectedCat?.is_countable;

  const openCreate = () => { setForm(EMPTY_FORM); setEditItem(null); setShowForm(true); setError(''); };
  const openEdit = (item) => {
    setForm({
      category_id: item.category_id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price.toString(),
      photo_url: item.photo_url || '',
      available_amount: item.available_amount !== null ? item.available_amount.toString() : '',
    });
    setEditItem(item);
    setShowForm(true);
    setError('');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const cat = categories.find(c => c.id === parseInt(form.category_id));
    const payload = {
      category_id: parseInt(form.category_id),
      name: form.name,
      description: form.description || null,
      price: parseFloat(form.price),
      photo_url: form.photo_url || null,
      available_amount: cat?.is_countable && form.available_amount !== '' ? parseInt(form.available_amount) : null,
    };
    try {
      if (editItem) {
        await API.put(`/menu/items/${editItem.id}`, payload);
      } else {
        await API.post('/menu/items', payload);
      }
      await fetchData();
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this item?')) return;
    await API.delete(`/menu/items/${id}`);
    await fetchData();
  };

  const handleToggleActive = async (item) => {
    await API.put(`/menu/items/${item.id}`, { is_active: item.is_active ? 0 : 1 });
    await fetchData();
  };

  const filtered = filter === 'All' ? items : items.filter(i => i.category_name === filter);
  const catNames = ['All', ...categories.map(c => c.name)];

  return (
    <div className="menu-manager fade-up">
      <div className="page-header-row">
        <div>
          <h1>Menu Manager</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Add, edit, and manage your menu items
          </p>
        </div>
        <button className="add-btn" onClick={openCreate}>+ Add Item</button>
      </div>

      <div className="filter-tabs">
        {catNames.map(n => (
          <button key={n} className={`ftab ${filter === n ? 'active' : ''}`} onClick={() => setFilter(n)}>{n}</button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
      ) : (
        <div className="items-table">
          <div className="table-header">
            <span>Item</span>
            <span>Category</span>
            <span>Price</span>
            <span>Stock</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          {filtered.map(item => {
            const unavail = item.is_countable && item.available_amount === 0;
            return (
              <div key={item.id} className={`table-row ${!item.is_active ? 'inactive' : ''}`}>
                <div className="row-name">
                  {item.photo_url && <img src={item.photo_url} alt="" style={unavail ? { filter: 'grayscale(100%)' } : {}} />}
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.name}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                      {unavail ? <span style={{ color: 'var(--red)' }}>No available</span> : item.description}
                    </div>
                  </div>
                </div>
                <span className="cat-badge">{item.category_name}</span>
                <span>{item.price.toFixed(2)} ₸</span>
                <span>
                  {item.is_countable
                    ? (item.available_amount === null ? '∞' : <span style={{ color: item.available_amount === 0 ? 'var(--red)' : 'var(--green)' }}>{item.available_amount}</span>)
                    : <span style={{ color: 'var(--text-muted)' }}>Unlimited</span>
                  }
                </span>
                <span>
                  <span className={`status-pill ${item.is_active ? 'active' : 'hidden'}`}>
                    {item.is_active ? 'Active' : 'Hidden'}
                  </span>
                </span>
                <div className="row-actions">
                  <button className="act-btn edit" onClick={() => openEdit(item)}>Edit</button>
                  <button className="act-btn toggle" onClick={() => handleToggleActive(item)}>
                    {item.is_active ? 'Hide' : 'Show'}
                  </button>
                  <button className="act-btn delete" onClick={() => handleDelete(item.id)}>Delete</button>
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No items found</div>}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>{editItem ? 'Edit Item' : 'Add New Item'}</h2>
            <form onSubmit={handleSave} className="item-form">
              <div className="form-row">
                <div className="field">
                  <label>Category *</label>
                  <select value={form.category_id} onChange={e => setForm(p => ({ ...p, category_id: e.target.value }))} required>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required placeholder="Item name" />
                </div>
              </div>
              <div className="field">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description" rows={3} />
              </div>
              <div className="form-row">
                <div className="field">
                  <label>Price (₸) *</label>
                  <input type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} required placeholder="0.00" />
                </div>
                {isCountable && (
                  <div className="field">
                    <label>Available Amount</label>
                    <input type="number" min="0" value={form.available_amount} onChange={e => setForm(p => ({ ...p, available_amount: e.target.value }))} placeholder="e.g. 20" />
                  </div>
                )}
              </div>
              <div className="field">
                <label>Photo URL</label>
                <input type="url" value={form.photo_url} onChange={e => setForm(p => ({ ...p, photo_url: e.target.value }))} placeholder="https://..." />
              </div>
              {isCountable && <div className="field-hint">⚠️ This category tracks available amount. When it hits 0, the item shows as "No available" and photo turns grey.</div>}
              {!isCountable && form.category_id && <div className="field-hint">ℹ️ This category is unlimited (Coffee/Lemonade style) — stock tracking is disabled.</div>}
              {error && <div className="form-error">{error}</div>}
              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={saving}>{saving ? 'Saving...' : editItem ? 'Update Item' : 'Add Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
