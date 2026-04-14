'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Plus, Search, Edit2, Trash2, Star,
  Package, ChevronLeft, ChevronRight, X, Image as ImageIcon, Upload
} from 'lucide-react';
import api from '@/lib/api';

const MOCK_PRODUCTS = Array.from({ length: 12 }, (_, i) => ({
  id: `mock-${i}`,
  name: ['Arduino Uno R3', 'Raspberry Pi 5', 'ESP32 DevKit', 'Ultrasonic Sensor', 'Motor Driver L298N', 'Servo MG996R', 'OLED Display', 'LiPo Battery', 'MPU6050 Gyro', 'NodeMCU ESP8266', 'PIR Motion Sensor', 'Relay Module 4Ch'][i],
  sku: `TB-${1000 + i}`,
  price: [599, 6999, 449, 149, 299, 349, 399, 549, 249, 399, 129, 279][i],
  mrp: [799, 8499, 599, 199, 399, 449, 499, 699, 349, 499, 179, 349][i],
  stock: [45, 12, 78, 234, 5, 3, 2, 8, 67, 91, 156, 43][i],
  brand: ['Arduino', 'Raspberry Pi', 'Espressif', 'Generic', 'Generic', 'TowerPro', 'Generic', 'Generic', 'InvenSense', 'Espressif', 'Generic', 'Songle'][i],
  is_featured: i < 4,
  is_active: true,
  ratings_average: (3.5 + Math.random() * 1.5).toFixed(1),
  ratings_count: Math.floor(10 + Math.random() * 200),
  category: { id: String(i % 4 + 1), name: ['Boards', 'Boards', 'Boards', 'Sensors', 'Motors', 'Motors', 'Displays', 'Power', 'Sensors', 'Boards', 'Sensors', 'Modules'][i] },
  category_id: String(i % 4 + 1),
  images: [],
  created_at: new Date(Date.now() - Math.random() * 90 * 86400000).toISOString(),
}));

const MOCK_CATEGORIES = [
  { id: '1', name: 'Dev Boards', slug: 'dev-boards', level: 0, parent_id: null },
  { id: '2', name: 'Sensors', slug: 'sensors', level: 0, parent_id: null },
  { id: '3', name: 'Motors', slug: 'motors', level: 0, parent_id: null },
  { id: '4', name: 'Displays', slug: 'displays', level: 0, parent_id: null },
  { id: '5', name: 'Power', slug: 'power', level: 0, parent_id: null },
  { id: '6', name: 'Modules', slug: 'modules', level: 0, parent_id: null },
  { id: '7', name: 'Kits', slug: 'kits', level: 0, parent_id: null },
  { id: '8', name: 'Tools', slug: 'tools', level: 0, parent_id: null },
];

// ─── Product Form Modal ───────────────────────────────────────────────────────
function ProductFormModal({ product, categories, onClose, onSave }) {
  const isEdit = !!product;

  // ✅ FIX: Properly initialize category_id from product.category.id fallback
  const [form, setForm] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    mrp: product?.mrp || '',
    stock: product?.stock ?? '',
    sku: product?.sku || '',
    brand: product?.brand || '',
    category_id: product?.category_id || product?.category?.id || '',
    subcategory_id: product?.subcategory_id || '',
    is_featured: product?.is_featured ?? false,
    is_active: product?.is_active ?? true,
    tags: Array.isArray(product?.tags) ? product.tags : [],
    images: Array.isArray(product?.images) ? product.images : [],
  });

  const [tagInput, setTagInput] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const imageInputRef = useRef(null);

  // ✅ Keep form.name synced for image alt text without blocking re-renders
  const nameRef = useRef(form.name);
  useEffect(() => { nameRef.current = form.name; }, [form.name]);

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  // ─── Tag helpers ──────────────────────────────────────────────────────────
  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      updateField('tags', [...form.tags, tag]);
    }
    setTagInput('');
  };
  const removeTag = (t) => updateField('tags', form.tags.filter(x => x !== t));

  // ─── Image helpers ────────────────────────────────────────────────────────
  // ✅ FIX: addImage now reads imageUrl from state via closure and clears it
  const addImage = () => {
    const url = imageUrl.trim();
    if (!url) return;
    updateField('images', [...form.images, { url, alt: nameRef.current || url }]);
    setImageUrl('');
    if (imageInputRef.current) imageInputRef.current.value = '';
  };
  const removeImage = (idx) =>
    updateField('images', form.images.filter((_, i) => i !== idx));

  // ─── Validation ───────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Product name is required';
    if (!form.sku.trim()) errs.sku = 'SKU is required';
    if (!form.price || Number(form.price) <= 0) errs.price = 'Valid price is required';
    if (!isEdit && !form.description.trim()) errs.description = 'Description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      // ✅ FIX: Clean up empty FK strings → null to prevent Supabase FK errors
      const payload = {
        ...form,
        price: Number(form.price),
        mrp: form.mrp ? Number(form.mrp) : null,
        stock: Number(form.stock) || 0,
        category_id: form.category_id || null,
        subcategory_id: form.subcategory_id || null,
      };

      if (isEdit) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        if (!payload.description) payload.description = payload.name;
        await api.post('/products', payload);
      }
      onSave();
    } catch (err) {
      setErrors({ _general: err?.message || 'Something went wrong' });
    }
    setSaving(false);
  };

  const discountPct =
    form.price && form.mrp && Number(form.mrp) > Number(form.price)
      ? Math.round((1 - Number(form.price) / Number(form.mrp)) * 100)
      : 0;

  // ✅ FIX: parentCategories = top-level; subCategories = children of selected parent
  const parentCategories = categories.filter(c => !c.parent_id || c.level === 0);
  const subCategories = categories.filter(c => c.parent_id === form.category_id);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div
        className="admin-modal admin-modal-lg"
        onClick={e => e.stopPropagation()}
        style={{ maxHeight: '90vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            {isEdit ? 'Edit Product' : 'Add New Product'}
          </h3>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Body */}
        <div className="admin-modal-body">

          {/* General error */}
          {errors._general && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 8, padding: '10px 14px', marginBottom: 16,
              fontSize: '0.82rem', color: '#f87171'
            }}>
              ❌ {errors._general}
            </div>
          )}

          {/* Name */}
          <div className="form-group">
            <label className="form-label">Product Name *</label>
            <input
              className={`form-input ${errors.name ? 'error' : ''}`}
              value={form.name}
              onChange={e => updateField('name', e.target.value)}
              placeholder="e.g. Arduino Uno R3 Board"
            />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">Description {!isEdit && '*'}</label>
            <textarea
              className={`form-input form-textarea ${errors.description ? 'error' : ''}`}
              value={form.description}
              onChange={e => updateField('description', e.target.value)}
              placeholder="Product description..."
              rows={3}
            />
            {errors.description && <p className="form-error">{errors.description}</p>}
          </div>

          {/* Price / MRP / Discount */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Price (₹) *</label>
              <input
                className={`form-input ${errors.price ? 'error' : ''}`}
                type="number" min="0"
                value={form.price}
                onChange={e => updateField('price', e.target.value)}
                placeholder="599"
              />
              {errors.price && <p className="form-error">{errors.price}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">MRP (₹)</label>
              <input
                className="form-input" type="number" min="0"
                value={form.mrp}
                onChange={e => updateField('mrp', e.target.value)}
                placeholder="799"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Discount</label>
              <div style={{
                display: 'flex', alignItems: 'center', height: 42,
                fontWeight: 600, fontSize: '0.9rem',
                color: discountPct > 0 ? 'var(--success)' : 'var(--text-muted)'
              }}>
                {discountPct > 0 ? `${discountPct}% OFF` : '—'}
              </div>
            </div>
          </div>

          {/* Stock / SKU / Brand */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Stock</label>
              <input
                className="form-input" type="number" min="0"
                value={form.stock}
                onChange={e => updateField('stock', e.target.value)}
                placeholder="50"
              />
            </div>
            <div className="form-group">
              <label className="form-label">SKU *</label>
              <input
                className={`form-input ${errors.sku ? 'error' : ''}`}
                value={form.sku}
                onChange={e => updateField('sku', e.target.value)}
                placeholder="TB-1001"
              />
              {errors.sku && <p className="form-error">{errors.sku}</p>}
            </div>
            <div className="form-group">
              <label className="form-label">Brand</label>
              <input
                className="form-input"
                value={form.brand}
                onChange={e => updateField('brand', e.target.value)}
                placeholder="Arduino"
              />
            </div>
          </div>

          {/* Category / Subcategory */}
          {/* ✅ FIX: onChange properly calls updateField, value is controlled */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                value={form.category_id}
                onChange={e => {
                  updateField('category_id', e.target.value);
                  updateField('subcategory_id', ''); // reset sub when parent changes
                }}
              >
                <option value="">— Select category —</option>
                {parentCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory</label>
              <select
                className="form-input form-select"
                value={form.subcategory_id}
                onChange={e => updateField('subcategory_id', e.target.value)}
                disabled={subCategories.length === 0}
              >
                <option value="">— Select subcategory —</option>
                {subCategories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {subCategories.length === 0 && form.category_id && (
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>
                  No subcategories for this category
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="form-group">
            <label className="form-label">Tags</label>
            <div className="chip-container">
              {form.tags.map((t, i) => (
                <span key={i} className="chip">
                  {t}
                  <button className="chip-remove" type="button" onClick={() => removeTag(t)}>
                    <X size={12} />
                  </button>
                </span>
              ))}
              <input
                className="chip-input"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                placeholder="Type tag and press Enter"
              />
            </div>
          </div>

          {/* Images */}
          {/* ✅ FIX: imageUrl state is controlled, ref ensures input clears, button has type="button" */}
          <div className="form-group">
            <label className="form-label">Product Images</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                ref={imageInputRef}
                className="form-input"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addImage(); } }}
                placeholder="https://... or /images/products/filename.jpg"
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn-admin btn-admin-secondary"
                onClick={addImage}
                disabled={!imageUrl.trim()}
                style={{ whiteSpace: 'nowrap', opacity: imageUrl.trim() ? 1 : 0.5 }}
              >
                <Upload size={14} /> Add
              </button>
            </div>

            {form.images.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.images.map((img, i) => (
                  <div key={i} style={{
                    width: 76, height: 76, borderRadius: 8,
                    background: 'var(--navy-3)', border: '1px solid var(--navy-border)',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    {img.url ? (
                      <img
                        src={img.url} alt={img.alt || ''}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <ImageIcon size={20} style={{ color: 'var(--text-muted)' }} />
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(i)}
                      style={{
                        position: 'absolute', top: 3, right: 3,
                        width: 20, height: 20, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.9)', color: '#fff',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 10, fontWeight: 700
                      }}
                    >
                      <X size={10} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              Paste a full URL <code style={{ color: 'var(--gold)' }}>https://...</code> or a
              local path <code style={{ color: 'var(--gold)' }}>/images/products/name.jpg</code>
              then click <strong>Add</strong>.
            </p>
          </div>

          {/* Toggles */}
          <div style={{ display: 'flex', gap: 28, marginTop: 8, flexWrap: 'wrap' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div className="toggle">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={e => updateField('is_featured', e.target.checked)}
                />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Featured Product
              </span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <div className="toggle">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={e => updateField('is_active', e.target.checked)}
                />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </div>
              <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                Active (visible in store)
              </span>
            </label>
          </div>

        </div>{/* /body */}

        {/* Footer */}
        <div className="admin-modal-footer">
          <button className="btn-admin btn-admin-secondary" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-admin btn-admin-primary"
            type="button"
            onClick={handleSave}
            disabled={saving}
          >
            {saving && <span className="spinner" style={{ width: 15, height: 15, marginRight: 6 }} />}
            {isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>

      </div>
    </div>
  );
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────
function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="confirm-dialog">
          <div className="confirm-icon"><Trash2 size={24} /></div>
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-text">{message}</p>
          <div className="confirm-buttons">
            <button className="btn-admin btn-admin-secondary" type="button" onClick={onCancel}>
              Cancel
            </button>
            <button
              className="btn-admin btn-admin-danger"
              type="button"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <span className="spinner" style={{ width: 14, height: 14 }} />}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Products Page ───────────────────────────────────────────────────────
export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [selected, setSelected] = useState([]);

  // ✅ FIX: Fetch from /admin/products — returns ALL products (active + inactive)
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12 });
      if (searchQuery) params.set('search', searchQuery);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setTotalCount(res.pagination?.total || 0);
    } catch (err) {
      console.error('fetchProducts error:', err);
      setProducts(MOCK_PRODUCTS);
      setTotalPages(1);
      setTotalCount(MOCK_PRODUCTS.length);
    }
    setLoading(false);
  }, [page, searchQuery]);

  // ✅ FIX: /categories/admin/flat returns ALL categories including inactive, with parent_id for subcategory filtering
  const fetchCategories = useCallback(async () => {
    try {
      const res = await api.get('/categories/admin/flat');
      setCategories(res.data || []);
    } catch {
      setCategories(MOCK_CATEGORIES);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);
  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const closeForm = () => { setShowForm(false); setEditProduct(null); };
  const openEdit = (p) => { setEditProduct(p); setShowForm(true); };
  const openAdd = () => { setEditProduct(null); setShowForm(true); };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/products/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      console.error('Delete failed:', err);
    }
    setDeleting(false);
  };

  const handleBulkDelete = async () => {
    for (const id of selected) {
      try { await api.delete(`/products/${id}`); } catch { }
    }
    setSelected([]);
    fetchProducts();
  };

  const toggleSelect = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const toggleAll = () =>
    setSelected(selected.length === products.length ? [] : products.map(p => p.id));

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${totalCount} total products`}
          </p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={openAdd}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Toolbar */}
      <div className="toolbar animate-in animate-in-1">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input
            className="toolbar-search-input"
            placeholder="Search products by name…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setPage(1); }}
          />
        </div>
        {selected.length > 0 && (
          <button
            className="btn-admin btn-admin-danger btn-admin-sm"
            type="button"
            onClick={handleBulkDelete}
          >
            <Trash2 size={13} /> Delete {selected.length} selected
          </button>
        )}
      </div>

      {/* Table */}
      <div className="dash-card animate-in animate-in-2">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox" className="checkbox"
                    checked={selected.length === products.length && products.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th>Product</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Category</th>
                <th>Rating</th>
                <th>Status</th>
                <th style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <td key={j}>
                        <div className="skeleton" style={{ height: 14, width: '80%', borderRadius: 4 }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Package size={32} /></div>
                      <h3 className="empty-state-title">No products yet</h3>
                      <p className="empty-state-text">
                        Click <strong>Add Product</strong> above to create your first product.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.id}>
                    <td>
                      <input
                        type="checkbox" className="checkbox"
                        checked={selected.includes(p.id)}
                        onChange={() => toggleSelect(p.id)}
                      />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 38, height: 38, borderRadius: 8,
                          background: 'var(--navy-3)', flexShrink: 0,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          {p.images?.[0]?.url ? (
                            <img
                              src={p.images[0].url} alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Package size={16} style={{ color: 'var(--text-muted)' }} />
                          )}
                        </div>
                        <div>
                          <div className="cell-primary" style={{ fontSize: '0.82rem' }}>{p.name}</div>
                          {p.brand && (
                            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{p.brand}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><span className="cell-mono">{p.sku}</span></td>
                    <td>
                      <span className="cell-bold">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </span>
                      {p.mrp && Number(p.mrp) > Number(p.price) && (
                        <span style={{
                          fontSize: '0.7rem', color: 'var(--text-muted)',
                          textDecoration: 'line-through', marginLeft: 6
                        }}>
                          ₹{Number(p.mrp).toLocaleString('en-IN')}
                        </span>
                      )}
                    </td>
                    <td>
                      <span
                        className={`low-stock-count ${p.stock <= 3 ? 'critical' : p.stock <= 10 ? 'warning' : ''}`}
                        style={p.stock > 10 ? { background: 'rgba(34,197,94,0.1)', color: 'var(--success)' } : {}}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8rem' }}>{p.category?.name || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={13} style={{ color: 'var(--gold)', fill: 'var(--gold)' }} />
                        <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                          {p.ratings_average || '0'}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          ({p.ratings_count || 0})
                        </span>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {p.is_featured && (
                          <span className="status-badge status-confirmed" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            Featured
                          </span>
                        )}
                        {p.is_active !== false ? (
                          <span className="status-badge status-delivered" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            Active
                          </span>
                        ) : (
                          <span className="status-badge status-cancelled" style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                            Inactive
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm"
                          type="button"
                          onClick={() => openEdit(p)}
                          title="Edit product"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          className="btn-admin btn-admin-danger btn-admin-icon btn-admin-sm"
                          type="button"
                          onClick={() => setDeleteTarget(p)}
                          title="Delete product"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '14px 20px' }}>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <div className="pagination-buttons">
              <button
                className="pagination-btn" type="button"
                disabled={page <= 1} onClick={() => setPage(p => p - 1)}
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(n => (
                <button
                  key={n} type="button"
                  className={`pagination-btn ${page === n ? 'active' : ''}`}
                  onClick={() => setPage(n)}
                >
                  {n}
                </button>
              ))}
              <button
                className="pagination-btn" type="button"
                disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <ProductFormModal
          product={editProduct}
          categories={categories}
          onClose={closeForm}
          onSave={() => { closeForm(); fetchProducts(); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          title="Delete Product"
          message={`Delete "${deleteTarget.name}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}