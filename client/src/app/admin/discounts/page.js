'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Search, Edit2, Trash2, X, Percent, Tag, ToggleLeft, ToggleRight,
  Calendar, Hash, DollarSign, ShoppingBag, Copy, Check, AlertCircle, Zap
} from 'lucide-react';
import api from '@/lib/api';

// ─── Mock coupons for demo ───
const MOCK_COUPONS = [
  { id: '1', code: 'TECHBHARAT10', description: '10% off for everyone', discount_type: 'percentage', discount_value: 10, min_order: 0, max_discount: 500, usage_limit: null, used_count: 142, is_active: true, starts_at: '2025-01-01', expires_at: '2026-12-31', created_at: new Date().toISOString() },
  { id: '2', code: 'STUDENT15', description: '15% off for students', discount_type: 'percentage', discount_value: 15, min_order: 499, max_discount: 1000, usage_limit: 500, used_count: 87, is_active: true, starts_at: '2025-01-01', expires_at: '2026-12-31', created_at: new Date().toISOString() },
  { id: '3', code: 'WELCOME5', description: '5% welcome discount', discount_type: 'percentage', discount_value: 5, min_order: 0, max_discount: 200, usage_limit: null, used_count: 312, is_active: true, starts_at: '2025-01-01', expires_at: null, created_at: new Date().toISOString() },
  { id: '4', code: 'FLAT200', description: 'Flat ₹200 off on orders above ₹1999', discount_type: 'fixed', discount_value: 200, min_order: 1999, max_discount: null, usage_limit: 100, used_count: 45, is_active: true, starts_at: '2025-06-01', expires_at: '2026-06-30', created_at: new Date().toISOString() },
  { id: '5', code: 'SUMMER25', description: 'Summer sale 25% off', discount_type: 'percentage', discount_value: 25, min_order: 999, max_discount: 2000, usage_limit: 200, used_count: 200, is_active: false, starts_at: '2025-03-01', expires_at: '2025-06-30', created_at: new Date().toISOString() },
];

const MOCK_PRODUCTS = Array.from({ length: 8 }, (_, i) => ({
  id: `prod-${i}`,
  name: ['Arduino Uno R3', 'Raspberry Pi 5', 'ESP32 DevKit', 'HC-SR04 Ultrasonic', 'Servo MG996R', 'OLED Display 0.96"', 'NodeMCU', 'LiPo 3.7V'][i],
  price: [599, 6999, 449, 149, 349, 399, 399, 549][i],
  mrp: [899, 8499, 599, 199, 449, 499, 499, 699][i],
  sku: `TB-${1000 + i}`,
}));

function generateCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'TB';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─── Coupon Form Modal ───
function CouponFormModal({ coupon, onClose, onSave }) {
  const isEdit = !!coupon;
  const [form, setForm] = useState({
    code: coupon?.code || generateCode(),
    description: coupon?.description || '',
    discount_type: coupon?.discount_type || 'percentage',
    discount_value: coupon?.discount_value || '',
    min_order: coupon?.min_order || '',
    max_discount: coupon?.max_discount || '',
    usage_limit: coupon?.usage_limit || '',
    is_active: coupon?.is_active ?? true,
    starts_at: coupon?.starts_at ? coupon.starts_at.split('T')[0] : new Date().toISOString().split('T')[0],
    expires_at: coupon?.expires_at ? coupon.expires_at.split('T')[0] : '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const updateField = (key, value) => setForm(f => ({ ...f, [key]: value }));

  const handleSave = async () => {
    if (!form.code.trim()) return setError('Coupon code is required');
    if (!form.discount_value || Number(form.discount_value) <= 0) return setError('Discount value is required');
    if (form.discount_type === 'percentage' && Number(form.discount_value) > 100) return setError('Percentage cannot exceed 100%');

    setSaving(true);
    setError('');
    try {
      const payload = {
        ...form,
        discount_value: Number(form.discount_value),
        min_order: Number(form.min_order) || 0,
        max_discount: form.max_discount ? Number(form.max_discount) : null,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      };

      if (isEdit) {
        await api.put(`/admin/coupons/${coupon.id}`, payload);
      } else {
        await api.post('/admin/coupons', payload);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save');
    }
    setSaving(false);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">{isEdit ? 'Edit Coupon' : 'Create New Coupon'}</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--r-md)', padding: '10px 14px', marginBottom: 16, fontSize: '0.82rem', color: 'var(--error)', display: 'flex', alignItems: 'center', gap: 6 }}>
              <AlertCircle size={14} /> {error}
            </div>
          )}

          {/* Code + Description */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" value={form.code} onChange={e => updateField('code', e.target.value.toUpperCase())} placeholder="TECHBHARAT10" style={{ flex: 1, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', fontSize: '1rem' }} />
                {!isEdit && (
                  <button className="btn-admin btn-admin-secondary" onClick={() => updateField('code', generateCode())} type="button" title="Generate random code">
                    <Hash size={14} />
                  </button>
                )}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} onChange={e => updateField('description', e.target.value)} placeholder="e.g. 10% off for everyone" />
            </div>
          </div>

          {/* Discount Type + Value */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select className="form-input form-select" value={form.discount_type} onChange={e => updateField('discount_type', e.target.value)}>
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <div style={{ position: 'relative' }}>
                <input className="form-input" type="number" value={form.discount_value} onChange={e => updateField('discount_value', e.target.value)} placeholder={form.discount_type === 'percentage' ? '10' : '200'} style={{ paddingRight: 40 }} />
                <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {form.discount_type === 'percentage' ? '%' : '₹'}
                </span>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Max Discount (₹)</label>
              <input className="form-input" type="number" value={form.max_discount} onChange={e => updateField('max_discount', e.target.value)} placeholder="No limit" />
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>Leave empty for no cap</p>
            </div>
          </div>

          {/* Min order + Usage limit */}
          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Minimum Order (₹)</label>
              <input className="form-input" type="number" value={form.min_order} onChange={e => updateField('min_order', e.target.value)} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Usage Limit</label>
              <input className="form-input" type="number" value={form.usage_limit} onChange={e => updateField('usage_limit', e.target.value)} placeholder="Unlimited" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <div style={{ display: 'flex', alignItems: 'center', height: 42, gap: 10 }}>
                <label className="toggle">
                  <input type="checkbox" checked={form.is_active} onChange={e => updateField('is_active', e.target.checked)} />
                  <div className="toggle-track" />
                  <div className="toggle-thumb" />
                </label>
                <span style={{ fontSize: '0.82rem', color: form.is_active ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {form.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Start Date</label>
              <input className="form-input" type="date" value={form.starts_at} onChange={e => updateField('starts_at', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date</label>
              <input className="form-input" type="date" value={form.expires_at} onChange={e => updateField('expires_at', e.target.value)} />
              <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>Leave empty for no expiry</p>
            </div>
          </div>

          {/* Preview */}
          <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 16, marginTop: 8, border: '1px dashed var(--navy-border)' }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Preview</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg, var(--gold-muted), rgba(201,168,76,0.12))',
                border: '1px dashed var(--gold)',
                borderRadius: 'var(--r-lg)',
                padding: '12px 20px',
                fontFamily: 'monospace',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--gold)',
                letterSpacing: '0.15em'
              }}>
                {form.code || '———'}
              </div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--white)' }}>
                  {form.discount_type === 'percentage' ? `${form.discount_value || '—'}% OFF` : `₹${form.discount_value || '—'} OFF`}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {form.description || 'No description'}
                  {form.min_order > 0 ? ` · Min order ₹${form.min_order}` : ''}
                  {form.max_discount ? ` · Max ₹${form.max_discount} off` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-modal-footer">
          <button className="btn-admin btn-admin-secondary" onClick={onClose}>Cancel</button>
          <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
            {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
            {isEdit ? 'Update Coupon' : 'Create Coupon'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sale Pricing Modal ───
function SalePricingModal({ products, onClose, onSave }) {
  const [saleProducts, setSaleProducts] = useState(
    products.map(p => ({ ...p, salePrice: p.price, selected: false }))
  );
  const [globalDiscount, setGlobalDiscount] = useState('');
  const [saving, setSaving] = useState(false);

  const applyGlobalDiscount = () => {
    const pct = Number(globalDiscount);
    if (!pct || pct <= 0 || pct > 90) return;
    setSaleProducts(prev =>
      prev.map(p => ({
        ...p,
        salePrice: Math.round(p.mrp * (1 - pct / 100)),
        selected: true,
      }))
    );
  };

  const handleSave = async () => {
    const toUpdate = saleProducts.filter(p => p.selected && p.salePrice !== p.price);
    if (toUpdate.length === 0) return;
    setSaving(true);
    try {
      await api.put('/admin/products/sale', {
        products: toUpdate.map(p => ({ id: p.id, price: p.salePrice }))
      });
      onSave();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">
            <Zap size={18} style={{ color: 'var(--gold)' }} /> Sale Pricing
          </h3>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {/* Global discount */}
          <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 16, marginBottom: 20, display: 'flex', gap: 10, alignItems: 'flex-end' }}>
            <div className="form-group" style={{ flex: 1, margin: 0 }}>
              <label className="form-label">Apply Global Discount (%)</label>
              <input className="form-input" type="number" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} placeholder="e.g. 20" />
            </div>
            <button className="btn-admin btn-admin-primary" onClick={applyGlobalDiscount} style={{ height: 42 }}>
              <Percent size={14} /> Apply to All
            </button>
          </div>

          {/* Product list */}
          <div className="data-table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>
                    <input type="checkbox" className="checkbox"
                      checked={saleProducts.every(p => p.selected)}
                      onChange={e => setSaleProducts(prev => prev.map(p => ({ ...p, selected: e.target.checked })))}
                    />
                  </th>
                  <th>Product</th>
                  <th>MRP</th>
                  <th>Current Price</th>
                  <th>Sale Price</th>
                  <th>Discount</th>
                </tr>
              </thead>
              <tbody>
                {saleProducts.map((p, i) => {
                  const disc = p.mrp > 0 ? Math.round((1 - p.salePrice / p.mrp) * 100) : 0;
                  return (
                    <tr key={p.id}>
                      <td>
                        <input type="checkbox" className="checkbox" checked={p.selected}
                          onChange={e => {
                            const next = [...saleProducts];
                            next[i] = { ...next[i], selected: e.target.checked };
                            setSaleProducts(next);
                          }}
                        />
                      </td>
                      <td>
                        <div className="cell-primary" style={{ fontSize: '0.82rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.sku}</div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>₹{p.mrp?.toLocaleString('en-IN')}</td>
                      <td className="cell-bold">₹{p.price?.toLocaleString('en-IN')}</td>
                      <td>
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 100, padding: '4px 8px', fontSize: '0.85rem', fontWeight: 700, color: p.salePrice < p.price ? 'var(--success)' : 'var(--text-primary)' }}
                          value={p.salePrice}
                          onChange={e => {
                            const next = [...saleProducts];
                            next[i] = { ...next[i], salePrice: Number(e.target.value), selected: true };
                            setSaleProducts(next);
                          }}
                        />
                      </td>
                      <td>
                        <span style={{
                          fontSize: '0.82rem', fontWeight: 700,
                          color: disc > 0 ? 'var(--success)' : 'var(--text-muted)',
                          background: disc > 0 ? 'rgba(34,197,94,0.1)' : 'transparent',
                          padding: disc > 0 ? '2px 8px' : 0,
                          borderRadius: 'var(--r-md)',
                        }}>
                          {disc > 0 ? `${disc}% OFF` : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        <div className="admin-modal-footer">
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {saleProducts.filter(p => p.selected && p.salePrice !== p.price).length} products will be updated
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-admin btn-admin-secondary" onClick={onClose}>Cancel</button>
            <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              Update Sale Prices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Dialog ───
function ConfirmDialog({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
        <div className="confirm-dialog">
          <div className="confirm-icon"><Trash2 size={24} /></div>
          <h3 className="confirm-title">{title}</h3>
          <p className="confirm-text">{message}</p>
          <div className="confirm-buttons">
            <button className="btn-admin btn-admin-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-admin btn-admin-danger" onClick={onConfirm} disabled={loading}>
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DiscountsPage() {
  const [activeTab, setActiveTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const fetchCoupons = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/coupons');
      setCoupons(res.data?.length ? res.data : MOCK_COUPONS);
    } catch {
      setCoupons(MOCK_COUPONS);
    }
    setLoading(false);
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/admin/products?limit=50');
      setProducts(res.data?.length ? res.data : MOCK_PRODUCTS);
    } catch {
      setProducts(MOCK_PRODUCTS);
    }
  }, []);

  useEffect(() => { fetchCoupons(); fetchProducts(); }, [fetchCoupons, fetchProducts]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/coupons/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchCoupons();
    } catch {}
    setDeleting(false);
  };

  const handleToggle = async (coupon) => {
    try {
      await api.patch(`/admin/coupons/${coupon.id}/toggle`);
      fetchCoupons();
    } catch {}
  };

  const copyCode = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredCoupons = coupons.filter(c =>
    !searchQuery || c.code.toLowerCase().includes(searchQuery.toLowerCase()) || c.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCoupons = coupons.filter(c => c.is_active).length;
  const totalUsed = coupons.reduce((s, c) => s + (c.used_count || 0), 0);

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Discounts & Coupons</h1>
          <p className="page-subtitle">Manage sale pricing and coupon codes</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-admin btn-admin-secondary" onClick={() => setShowSaleModal(true)}>
            <Zap size={15} /> Sale Pricing
          </button>
          <button className="btn-admin btn-admin-primary" onClick={() => { setEditCoupon(null); setShowForm(true); }}>
            <Plus size={15} /> New Coupon
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="animate-in animate-in-1">
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon revenue"><Tag size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)' }}>{coupons.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Coupons</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon products"><Percent size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--success)' }}>{activeCoupons}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Active Coupons</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon orders"><ShoppingBag size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold)' }}>{totalUsed}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Times Used</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="toolbar animate-in animate-in-2">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input className="toolbar-search-input" placeholder="Search coupons..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Coupons Grid */}
      <div className="animate-in animate-in-3" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: 14 }}>
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="dash-card" style={{ padding: 20 }}>
              <div className="skeleton" style={{ height: 20, width: '60%', marginBottom: 12 }} />
              <div className="skeleton" style={{ height: 14, width: '80%', marginBottom: 8 }} />
              <div className="skeleton" style={{ height: 14, width: '40%' }} />
            </div>
          ))
        ) : filteredCoupons.length === 0 ? (
          <div className="dash-card" style={{ gridColumn: '1 / -1', padding: 40, textAlign: 'center' }}>
            <div className="empty-state">
              <div className="empty-state-icon"><Tag size={28} /></div>
              <h3 className="empty-state-title">No coupons found</h3>
              <p className="empty-state-text">Create your first coupon to get started.</p>
            </div>
          </div>
        ) : filteredCoupons.map(coupon => {
          const isExpired = coupon.expires_at && new Date(coupon.expires_at) < new Date();
          const isLimitReached = coupon.usage_limit && coupon.used_count >= coupon.usage_limit;
          const statusColor = !coupon.is_active ? 'var(--text-muted)' : isExpired || isLimitReached ? 'var(--error)' : 'var(--success)';
          const statusLabel = !coupon.is_active ? 'Inactive' : isExpired ? 'Expired' : isLimitReached ? 'Limit Reached' : 'Active';

          return (
            <div key={coupon.id} className="dash-card" style={{ padding: 0, overflow: 'hidden', opacity: coupon.is_active ? 1 : 0.6

 }}>
              {/* Coupon Header */}
              <div style={{
                padding: '16px 20px',
                background: coupon.is_active ? 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.02))' : 'var(--navy-3)',
                borderBottom: '1px dashed var(--navy-border)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    fontFamily: 'monospace', fontWeight: 800, fontSize: '1.05rem',
                    color: coupon.is_active ? 'var(--gold)' : 'var(--text-muted)',
                    letterSpacing: '0.1em',
                    background: 'var(--navy-3)',
                    padding: '6px 14px',
                    borderRadius: 'var(--r-md)',
                    border: `1px dashed ${coupon.is_active ? 'var(--gold)' : 'var(--navy-border)'}`,
                  }}>
                    {coupon.code}
                  </div>
                  <button
                    className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm"
                    onClick={() => copyCode(coupon.code, coupon.id)}
                    title="Copy code"
                    style={{ width: 28, height: 28 }}
                  >
                    {copiedId === coupon.id ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
                  </button>
                </div>
                <span style={{
                  fontSize: '0.72rem', fontWeight: 700,
                  padding: '3px 10px', borderRadius: 'var(--r-full)',
                  background: statusColor === 'var(--success)' ? 'rgba(34,197,94,0.1)' : statusColor === 'var(--error)' ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.1)',
                  color: statusColor
                }}>
                  {statusLabel}
                </span>
              </div>

              {/* Body */}
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                  <span style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--white)', fontFamily: 'var(--font-display)' }}>
                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `₹${coupon.discount_value}`}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>OFF</span>
                </div>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.4 }}>
                  {coupon.description || 'No description'}
                </p>

                {/* Details chips */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {coupon.min_order > 0 && (
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: 'var(--navy-3)', color: 'var(--text-muted)', border: '1px solid var(--navy-border)' }}>
                      Min ₹{coupon.min_order}
                    </span>
                  )}
                  {coupon.max_discount && (
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: 'var(--navy-3)', color: 'var(--text-muted)', border: '1px solid var(--navy-border)' }}>
                      Max ₹{coupon.max_discount} off
                    </span>
                  )}
                  {coupon.usage_limit && (
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: 'var(--navy-3)', color: 'var(--text-muted)', border: '1px solid var(--navy-border)' }}>
                      {coupon.used_count}/{coupon.usage_limit} used
                    </span>
                  )}
                  {coupon.expires_at && (
                    <span style={{ fontSize: '0.7rem', padding: '3px 8px', borderRadius: 'var(--r-full)', background: isExpired ? 'rgba(239,68,68,0.08)' : 'var(--navy-3)', color: isExpired ? 'var(--error)' : 'var(--text-muted)', border: `1px solid ${isExpired ? 'rgba(239,68,68,0.2)' : 'var(--navy-border)'}` }}>
                      <Calendar size={10} style={{ marginRight: 3 }} /> {isExpired ? 'Expired' : `Expires ${new Date(coupon.expires_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                    </span>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                  <button
                    className="btn-admin btn-admin-secondary btn-admin-sm"
                    onClick={() => handleToggle(coupon)}
                    title={coupon.is_active ? 'Deactivate' : 'Activate'}
                    style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    {coupon.is_active ? <ToggleRight size={14} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={14} />}
                    {coupon.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm" onClick={() => { setEditCoupon(coupon); setShowForm(true); }} title="Edit">
                    <Edit2 size={13} />
                  </button>
                  <button className="btn-admin btn-admin-danger btn-admin-icon btn-admin-sm" onClick={() => setDeleteTarget(coupon)} title="Delete">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modals */}
      {showForm && <CouponFormModal coupon={editCoupon} onClose={() => { setShowForm(false); setEditCoupon(null); }} onSave={() => { setShowForm(false); setEditCoupon(null); fetchCoupons(); }} />}
      {deleteTarget && <ConfirmDialog title="Delete Coupon" message={`Delete coupon "${deleteTarget.code}"? This cannot be undone.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} loading={deleting} />}
      {showSaleModal && <SalePricingModal products={products} onClose={() => setShowSaleModal(false)} onSave={() => { setShowSaleModal(false); fetchProducts(); }} />}
    </div>
  );
}
