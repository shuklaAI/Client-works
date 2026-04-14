'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Search, AlertTriangle, Package, CheckCircle, Edit2,
  ChevronLeft, ChevronRight, Save, Warehouse
} from 'lucide-react';
import api from '@/lib/api';

const MOCK_INVENTORY = Array.from({ length: 15 }, (_, i) => ({
  id: `inv-${i}`,
  name: ['Arduino Uno R3', 'Raspberry Pi 5', 'ESP32 DevKit', 'HC-SR04 Ultrasonic', 'L298N Motor Driver', 'Servo MG996R', 'OLED 0.96"', 'LiPo 3.7V', 'MPU6050', 'NodeMCU', 'PIR Sensor', 'Relay 4Ch', 'Breadboard', 'LED Kit 100pcs', 'Resistor Kit'][i],
  sku: `TB-${1000 + i}`,
  stock: [45, 12, 78, 234, 5, 3, 2, 8, 67, 91, 156, 43, 200, 89, 312][i],
  price: [599, 6999, 449, 149, 299, 349, 399, 549, 249, 399, 129, 279, 89, 199, 149][i],
  brand: ['Arduino', 'Raspberry Pi', 'Espressif', 'Generic', 'Generic', 'TowerPro', 'Generic', 'Generic', 'InvenSense', 'Espressif', 'Generic', 'Songle', 'Generic', 'Generic', 'Generic'][i],
  category: { name: ['Boards', 'Boards', 'Boards', 'Sensors', 'Motors', 'Motors', 'Displays', 'Power', 'Sensors', 'Boards', 'Sensors', 'Modules', 'Tools', 'Components', 'Components'][i] },
  is_active: true,
}));

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); //  all, low, out
  const [editingId, setEditingId] = useState(null);
  const [editStock, setEditStock] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (searchQuery) params.set('search', searchQuery);
      const res = await api.get(`/admin/products?${params}`);
      setProducts(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch {
      setProducts(MOCK_INVENTORY);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, searchQuery]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleSaveStock = async (product) => {
    setSaving(true);
    try {
      await api.put(`/products/${product.id}`, { stock: Number(editStock) });
      setEditingId(null);
      fetchProducts();
    } catch {}
    setSaving(false);
  };

  const getStockLevel = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'critical', color: 'var(--error)' };
    if (stock <= 5) return { label: 'Critical', cls: 'critical', color: 'var(--error)' };
    if (stock <= 15) return { label: 'Low Stock', cls: 'warning', color: 'var(--warning)' };
    return { label: 'In Stock', cls: '', color: 'var(--success)' };
  };

  const filtered = products.filter(p => {
    if (filter === 'low') return p.stock > 0 && p.stock <= 15;
    if (filter === 'out') return p.stock === 0;
    return true;
  });

  const lowCount = products.filter(p => p.stock > 0 && p.stock <= 15).length;
  const outCount = products.filter(p => p.stock === 0).length;

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Inventory</h1>
          <p className="page-subtitle">Track and manage stock levels in real-time</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }} className="animate-in animate-in-1">
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon products"><Package size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--white)' }}>{products.length}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Products</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon pending"><AlertTriangle size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--warning)' }}>{lowCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Low Stock Items</div>
            </div>
          </div>
        </div>
        <div className="kpi-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="kpi-icon alert"><Package size={18} /></div>
            <div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--error)' }}>{outCount}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="toolbar animate-in animate-in-2">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input className="toolbar-search-input" placeholder="Search products..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>
        <div className="toolbar-filters">
          {[
            { key: 'all', label: 'All' },
            { key: 'low', label: `Low Stock (${lowCount})` },
            { key: 'out', label: `Out of Stock (${outCount})` },
          ].map(f => (
            <button key={f.key} className={`toolbar-filter ${filter === f.key ? 'active' : ''}`} onClick={() => setFilter(f.key)}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="dash-card animate-in animate-in-3">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>SKU</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th style={{ width: 100 }}>Update</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (<td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>))}</tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Warehouse size={28} /></div>
                      <h3 className="empty-state-title">No items found</h3>
                      <p className="empty-state-text">All inventory levels look good!</p>
                    </div>
                  </td>
                </tr>
              ) : filtered.map(p => {
                const level = getStockLevel(p.stock);
                const isEditing = editingId === p.id;
                return (
                  <tr key={p.id} style={p.stock <= 5 ? { background: 'rgba(239,68,68,0.03)' } : p.stock <= 15 ? { background: 'rgba(245,158,11,0.02)' } : {}}>
                    <td>
                      <div className="cell-primary" style={{ fontSize: '0.82rem' }}>{p.name}</div>
                      {p.brand && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.brand}</div>}
                    </td>
                    <td><span className="cell-mono">{p.sku}</span></td>
                    <td style={{ fontSize: '0.8rem' }}>{p.category?.name || '—'}</td>
                    <td className="cell-bold">₹{Number(p.price).toLocaleString('en-IN')}</td>
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-input"
                          style={{ width: 80, padding: '4px 8px', fontSize: '0.82rem' }}
                          value={editStock}
                          onChange={e => setEditStock(e.target.value)}
                          autoFocus
                        />
                      ) : (
                        <span style={{
                          fontSize: '0.88rem', fontWeight: 700, color: level.color,
                          display: 'flex', alignItems: 'center', gap: 6
                        }}>
                          {p.stock <= 5 && <AlertTriangle size={13} />}
                          {p.stock}
                        </span>
                      )}
                    </td>
                    <td>
                      <span className={`low-stock-count ${level.cls}`} style={!level.cls ? { background: 'rgba(34,197,94,0.1)', color: 'var(--success)' } : {}}>
                        {level.label}
                      </span>
                    </td>
                    <td>
                      {isEditing ? (
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn-admin btn-admin-primary btn-admin-sm" onClick={() => handleSaveStock(p)} disabled={saving}>
                            <Save size={12} /> Save
                          </button>
                          <button className="btn-admin btn-admin-secondary btn-admin-sm" onClick={() => setEditingId(null)}>
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button className="btn-admin btn-admin-secondary btn-admin-sm" onClick={() => { setEditingId(p.id); setEditStock(String(p.stock)); }}>
                          <Edit2 size={12} /> Edit
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="pagination" style={{ padding: '14px 20px' }}>
            <span className="pagination-info">Page {page} of {totalPages}</span>
            <div className="pagination-buttons">
              <button className="pagination-btn" disabled={page <= 1} onClick={() => setPage(p => p - 1)}><ChevronLeft size={16} /></button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(n => (
                <button key={n} className={`pagination-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
              ))}
              <button className="pagination-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
