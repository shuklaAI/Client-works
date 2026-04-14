'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, X, Truck,
  Package, CheckCircle, Clock, AlertCircle, XCircle, CreditCard,
  MapPin, User, Calendar, FileText, Download, IndianRupee
} from 'lucide-react';
import api from '@/lib/api';

const MOCK_ORDERS = Array.from({ length: 10 }, (_, i) => ({
  id: `mock-order-${i}`,
  order_number: `TB${(Date.now() - i * 86400000).toString(36).toUpperCase()}${1000 + i}`,
  total_price: [4299, 12599, 2149, 8799, 599, 15499, 3299, 749, 6199, 1899][i],
  items_price: [3640, 10677, 1821, 7457, 508, 13135, 2796, 635, 5253, 1609][i],
  tax_price: [655, 1922, 328, 1342, 91, 2364, 503, 114, 946, 290][i],
  shipping_price: [0, 0, 0, 0, 99, 0, 0, 99, 0, 0][i],
  status: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled', 'pending', 'shipped', 'delivered'][i],
  payment_method: ['razorpay', 'cod', 'razorpay', 'razorpay', 'cod', 'razorpay', 'razorpay', 'cod', 'razorpay', 'cod'][i],
  payment_result: i % 3 === 0 ? { razorpay_payment_id: `pay_${Math.random().toString(36).slice(2, 14)}` } : null,
  tracking_number: ['shipped', 'delivered'].includes(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled', 'pending', 'shipped', 'delivered'][i]) ? `TRK${100000 + i}` : null,
  created_at: new Date(Date.now() - i * 86400000 - Math.random() * 43200000).toISOString(),
  delivered_at: ['delivered'].includes(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'delivered', 'cancelled', 'pending', 'shipped', 'delivered'][i]) ? new Date(Date.now() - i * 43200000).toISOString() : null,
  user: { name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh', 'Meera Joshi', 'Arjun Nair', 'Kavya Reddy', 'Rohit Verma', 'Ananya Das'][i], email: `user${i}@email.com` },
  items: [
    { name: 'Arduino Uno R3', price: 599, quantity: 2, image: '' },
    { name: 'Jumper Wires Pack', price: 149, quantity: 1, image: '' },
  ],
  shipping_address: { full_name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar'][i % 3], phone: '9876543210', address_line1: '123 Tech Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' },
}));

const STATUS_OPTIONS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const STATUS_TABS = ['all', ...STATUS_OPTIONS];

const STATUS_ICONS = {
  pending: Clock,
  confirmed: CheckCircle,
  processing: Package,
  shipped: Truck,
  delivered: CheckCircle,
  cancelled: XCircle,
  refunded: AlertCircle,
};

function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Order Detail Modal ───
function OrderDetailModal({ order, onClose, onStatusUpdate }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
  const [updating, setUpdating] = useState(false);

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      await api.put(`/orders/${order.id}/status`, { status: newStatus, trackingNumber });
      onStatusUpdate();
    } catch {}
    setUpdating(false);
  };

  const addr = order.shipping_address || {};

  const timeline = [
    { status: 'pending', label: 'Order Placed', time: order.created_at },
    { status: 'confirmed', label: 'Order Confirmed', time: order.status !== 'pending' ? order.created_at : null },
    { status: 'processing', label: 'Processing', time: ['processing', 'shipped', 'delivered'].includes(order.status) ? order.created_at : null },
    { status: 'shipped', label: 'Shipped', time: ['shipped', 'delivered'].includes(order.status) ? order.created_at : null },
    { status: 'delivered', label: 'Delivered', time: order.delivered_at },
  ];

  const currentIdx = STATUS_OPTIONS.indexOf(order.status);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <div>
            <h3 className="admin-modal-title">Order #{order.order_number}</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
              {new Date(order.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="admin-modal-body">
          {/* Status + Update */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <label className="form-label">Current Status</label>
              <span className={`status-badge status-${order.status}`} style={{ fontSize: '0.82rem', padding: '6px 14px' }}>
                {order.status}
              </span>
            </div>
            <div style={{ flex: 2 }}>
              <label className="form-label">Update Status</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="form-input form-select" value={newStatus} onChange={e => setNewStatus(e.target.value)} style={{ flex: 1 }}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
                <input className="form-input" value={trackingNumber} onChange={e => setTrackingNumber(e.target.value)} placeholder="Tracking #" style={{ flex: 1 }} />
                <button className="btn-admin btn-admin-primary" onClick={handleUpdate} disabled={updating}>
                  {updating ? <span className="spinner" style={{ width: 14, height: 14 }} /> : 'Update'}
                </button>
              </div>
            </div>
          </div>

          {/* Order Timeline */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--white)', marginBottom: 12 }}>Order Timeline</h4>
            <div className="timeline">
              {timeline.filter(t => order.status !== 'cancelled' || t.status === 'pending').map((t, i) => {
                const done = t.time && STATUS_OPTIONS.indexOf(t.status) <= currentIdx;
                const active = t.status === order.status;
                return (
                  <div key={i} className="timeline-item">
                    <div className={`timeline-dot ${active ? 'active' : done ? 'done' : ''}`}>
                      {done || active ? <CheckCircle size={14} /> : null}
                    </div>
                    <div className="timeline-body">
                      <div className="timeline-title">{t.label}</div>
                      {t.time && <div className="timeline-time">{new Date(t.time).toLocaleString('en-IN')}</div>}
                    </div>
                  </div>
                );
              })}
              {order.status === 'cancelled' && (
                <div className="timeline-item">
                  <div className="timeline-dot" style={{ background: 'rgba(239,68,68,0.15)', borderColor: 'var(--error)', color: 'var(--error)' }}>
                    <XCircle size={14} />
                  </div>
                  <div className="timeline-body">
                    <div className="timeline-title" style={{ color: 'var(--error)' }}>Cancelled</div>
                    {order.cancelled_at && <div className="timeline-time">{new Date(order.cancelled_at).toLocaleString('en-IN')}</div>}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Customer & Shipping */}
          <div className="form-row" style={{ marginBottom: 20 }}>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--white)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={14} /> Customer
              </h4>
              <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, fontSize: '0.82rem' }}>
                <div style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{order.user?.name}</div>
                <div style={{ color: 'var(--text-muted)' }}>{order.user?.email}</div>
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--white)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> Shipping Address
              </h4>
              <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {addr.full_name && <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{addr.full_name}</div>}
                {addr.address_line1}<br />
                {addr.city}, {addr.state} — {addr.pincode}
                {addr.phone && <div>{addr.phone}</div>}
              </div>
            </div>
          </div>

          {/* Payment Details */}
          <div style={{ marginBottom: 20 }}>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--white)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={14} /> Payment Details
            </h4>
            <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: 'var(--text-muted)' }}>Method</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500, textTransform: 'uppercase' }}>{order.payment_method}</span>
              </div>
              {order.payment_result?.razorpay_payment_id && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ color: 'var(--text-muted)' }}>Payment ID</span>
                  <span style={{ color: 'var(--gold)', fontFamily: 'monospace', fontSize: '0.78rem' }}>{order.payment_result.razorpay_payment_id}</span>
                </div>
              )}
              {order.tracking_number && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tracking</span>
                  <span style={{ color: 'var(--info)', fontFamily: 'monospace' }}>{order.tracking_number}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Preview */}
          <div className="invoice-preview">
            <div className="invoice-header">
              <div>
                <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--white)' }}>Invoice</h4>
                <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>#{order.order_number}</p>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ color: 'var(--gold)', fontWeight: 600 }}>TechBharat Store</div>
                <div>{new Date(order.created_at).toLocaleDateString('en-IN')}</div>
              </div>
            </div>
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th style={{ textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {(order.items || []).map((item, i) => (
                  <tr key={i}>
                    <td className="cell-primary">{item.name}</td>
                    <td>{item.quantity}</td>
                    <td>₹{Number(item.price).toLocaleString('en-IN')}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500, color: 'var(--text-primary)' }}>
                      ₹{(item.quantity * Number(item.price)).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="invoice-total">
              <div className="invoice-total-row">
                <span>Subtotal</span>
                <span>₹{Number(order.items_price).toLocaleString('en-IN')}</span>
              </div>
              <div className="invoice-total-row">
                <span>Tax (18% GST)</span>
                <span>₹{Number(order.tax_price).toLocaleString('en-IN')}</span>
              </div>
              <div className="invoice-total-row">
                <span>Shipping</span>
                <span>{Number(order.shipping_price) === 0 ? 'FREE' : `₹${Number(order.shipping_price).toLocaleString('en-IN')}`}</span>
              </div>
              <div style={{ width: 200, height: 1, background: 'var(--navy-border)', margin: '8px 0' }} />
              <div className="invoice-total-row grand">
                <span>Total</span>
                <span>₹{Number(order.total_price).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [stats, setStats] = useState([]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15 });
      if (statusFilter !== 'all') params.set('status', statusFilter);
      const res = await api.get(`/orders/admin/all?${params}`);
      setOrders(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
      setStats(res.stats || []);
    } catch {
      setOrders(MOCK_ORDERS);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, statusFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const getStatusCount = (status) => {
    if (status === 'all') return orders.length;
    const s = stats.find(x => x._id === status);
    return s?.count || 0;
  };

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">Manage and track customer orders & payments</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tab-bar animate-in animate-in-1">
        {STATUS_TABS.map(s => (
          <button
            key={s}
            className={`tab-bar-item ${statusFilter === s ? 'active' : ''}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="toolbar animate-in animate-in-2">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input className="toolbar-search-input" placeholder="Search by order number..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {/* Table */}
      <div className="dash-card animate-in animate-in-3">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Status</th>
                <th style={{ width: 60 }}>View</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 7 }).map((_, j) => (<td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>))}</tr>
                ))
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Package size={28} /></div>
                      <h3 className="empty-state-title">No orders found</h3>
                      <p className="empty-state-text">Orders will appear here once customers start shopping.</p>
                    </div>
                  </td>
                </tr>
              ) : orders.filter(o => !searchQuery || o.order_number?.toLowerCase().includes(searchQuery.toLowerCase())).map(o => (
                <tr key={o.id}>
                  <td>
                    <span className="cell-bold" style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      #{o.order_number}
                    </span>
                  </td>
                  <td>
                    <div>
                      <div className="cell-primary" style={{ fontSize: '0.82rem' }}>{o.user?.name || '—'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.user?.email}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem', whiteSpace: 'nowrap' }}>
                    {new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{timeAgo(o.created_at)}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 500, textTransform: 'uppercase', color: o.payment_method === 'razorpay' ? 'var(--info)' : 'var(--text-secondary)' }}>
                      {o.payment_method}
                    </span>
                  </td>
                  <td>
                    <span className="cell-bold" style={{ fontSize: '0.88rem' }}>₹{Number(o.total_price).toLocaleString('en-IN')}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${o.status}`}>{o.status}</span>
                  </td>
                  <td>
                    <button className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm" onClick={() => setSelectedOrder(o)} title="View">
                      <Eye size={14} />
                    </button>
                  </td>
                </tr>
              ))}
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

      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={() => { setSelectedOrder(null); fetchOrders(); }}
        />
      )}
    </div>
  );
}
