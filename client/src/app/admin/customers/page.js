'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Search, ChevronLeft, ChevronRight, Eye, X, Users,
  ShoppingBag, IndianRupee, Calendar, Mail, Phone, MapPin,
  Shield, ShieldOff, ChevronDown
} from 'lucide-react';
import api from '@/lib/api';

const MOCK_CUSTOMERS = Array.from({ length: 10 }, (_, i) => ({
  id: `mock-user-${i}`,
  name: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh', 'Meera Joshi', 'Arjun Nair', 'Kavya Reddy', 'Rohit Verma', 'Ananya Das'][i],
  email: ['rahul@email.com', 'priya@email.com', 'amit@email.com', 'sneha@email.com', 'vikram@email.com', 'meera@email.com', 'arjun@email.com', 'kavya@email.com', 'rohit@email.com', 'ananya@email.com'][i],
  phone: `98765${43210 + i}`,
  role: i === 0 ? 'admin' : 'user',
  totalOrders: [23, 15, 8, 12, 3, 19, 7, 2, 31, 11][i],
  totalSpent: [45800, 28900, 12400, 24500, 4200, 38700, 9800, 2100, 62300, 18900][i],
  created_at: new Date(Date.now() - (i * 15 + Math.random() * 30) * 86400000).toISOString(),
}));

// ─── Role Change Confirmation ───
function RoleConfirmDialog({ customer, newRole, onConfirm, onCancel, loading }) {
  const isPromoting = newRole === 'admin';
  return (
    <div className="admin-modal-backdrop" onClick={onCancel}>
      <div className="admin-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 440 }}>
        <div className="confirm-dialog">
          <div className="confirm-icon" style={{
            background: isPromoting ? 'rgba(201,168,76,0.15)' : 'rgba(239,68,68,0.12)',
            borderColor: isPromoting ? 'var(--gold)' : 'var(--error)',
            color: isPromoting ? 'var(--gold)' : 'var(--error)',
          }}>
            {isPromoting ? <Shield size={24} /> : <ShieldOff size={24} />}
          </div>
          <h3 className="confirm-title">
            {isPromoting ? 'Promote to Admin' : 'Demote to User'}
          </h3>
          <p className="confirm-text">
            {isPromoting
              ? `Are you sure you want to make "${customer.name}" an admin? They will have full access to the admin panel.`
              : `Are you sure you want to demote "${customer.name}" to a regular user? They will lose all admin privileges.`
            }
          </p>
          <div className="confirm-buttons">
            <button className="btn-admin btn-admin-secondary" onClick={onCancel}>Cancel</button>
            <button
              className={`btn-admin ${isPromoting ? 'btn-admin-primary' : 'btn-admin-danger'}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : null}
              {isPromoting ? 'Promote' : 'Demote'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerDetailModal({ customer, onClose, onRoleChange }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const res = await api.get(`/admin/users/${customer.id}`);
        setDetails(res.data);
      } catch {
        setDetails({
          ...customer,
          orders: Array.from({ length: 3 }, (_, i) => ({
            id: `order-${i}`,
            order_number: `TB${Date.now().toString(36).toUpperCase()}${i}`,
            total_price: 1500 + Math.floor(Math.random() * 5000),
            status: ['delivered', 'shipped', 'pending'][i],
            created_at: new Date(Date.now() - i * 7 * 86400000).toISOString(),
            items: [{ name: 'Arduino Uno', price: 599, quantity: 1 }]
          })),
          addresses: [{ address_line1: '123 Tech Street', city: 'Mumbai', state: 'Maharashtra', pincode: '400001' }]
        });
      }
      setLoading(false);
    }
    fetch();
  }, [customer.id]);

  return (
    <div className="admin-modal-backdrop" onClick={onClose}>
      <div className="admin-modal admin-modal-lg" onClick={e => e.stopPropagation()}>
        <div className="admin-modal-header">
          <h3 className="admin-modal-title">Customer Details</h3>
          <button className="admin-modal-close" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="admin-modal-body">
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}>
              <div className="spinner" style={{ width: 28, height: 28 }} />
            </div>
          ) : details ? (
            <>
              {/* Customer Header */}
              <div style={{ display: 'flex', gap: 16, marginBottom: 24, alignItems: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 'var(--r-xl)',
                  background: 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--navy)', fontSize: '1.2rem', fontWeight: 700
                }}>
                  {details.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--white)' }}>{details.name}</h3>
                  <div style={{ display: 'flex', gap: 16, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12} /> {details.email}</span>
                    {details.phone && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12} /> {details.phone}</span>}
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className={`status-badge ${details.role === 'admin' ? 'status-confirmed' : 'status-delivered'}`}>
                    {details.role}
                  </span>
                  <button
                    className={`btn-admin ${details.role === 'admin' ? 'btn-admin-danger' : 'btn-admin-primary'} btn-admin-sm`}
                    onClick={() => onRoleChange(customer, details.role === 'admin' ? 'user' : 'admin')}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem' }}
                  >
                    {details.role === 'admin' ? <><ShieldOff size={12} /> Demote</> : <><Shield size={12} /> Promote</>}
                  </button>
                </div>
              </div>

              {/* Stats Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
                <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--white)' }}>{customer.totalOrders}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Orders</div>
                </div>
                <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--gold)' }}>₹{customer.totalSpent?.toLocaleString('en-IN')}</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Total Spent</div>
                </div>
                <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--white)' }}>
                    {new Date(customer.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Member Since</div>
                </div>
              </div>

              {/* Purchase History */}
              <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--white)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <ShoppingBag size={15} /> Purchase History
              </h4>
              {(details.orders || []).length === 0 ? (
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', padding: '16px 0' }}>No orders yet.</p>
              ) : (
                <div className="data-table-wrap" style={{ marginBottom: 20 }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Order</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(details.orders || []).map(o => (
                        <tr key={o.id}>
                          <td><span style={{ fontFamily: 'monospace', fontSize: '0.78rem' }}>#{o.order_number}</span></td>
                          <td style={{ fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                          <td className="cell-bold">₹{Number(o.total_price).toLocaleString('en-IN')}</td>
                          <td><span className={`status-badge status-${o.status}`}>{o.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Addresses */}
              {(details.addresses || []).length > 0 && (
                <>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--white)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <MapPin size={15} /> Saved Addresses
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    {details.addresses.map((a, i) => (
                      <div key={i} style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                        {a.full_name && <div style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>{a.full_name}</div>}
                        {a.address_line1}<br />
                        {a.city}, {a.state} — {a.pincode}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [roleChange, setRoleChange] = useState(null); // { customer, newRole }
  const [roleLoading, setRoleLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 20 });
      if (searchQuery) params.set('search', searchQuery);
      const res = await api.get(`/admin/users?${params}`);
      setCustomers(res.data || []);
      setTotalPages(res.pagination?.pages || 1);
    } catch {
      setCustomers(MOCK_CUSTOMERS);
      setTotalPages(1);
    }
    setLoading(false);
  }, [page, searchQuery]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleRoleChangeRequest = (customer, newRole) => {
    setSelectedCustomer(null); // close detail modal first
    setRoleChange({ customer, newRole });
  };

  const handleRoleChangeConfirm = async () => {
    if (!roleChange) return;
    setRoleLoading(true);
    try {
      await api.put(`/admin/users/${roleChange.customer.id}/role`, { role: roleChange.newRole });
      setRoleChange(null);
      fetchCustomers();
    } catch (err) {
      alert(err.message || 'Failed to update role');
    }
    setRoleLoading(false);
  };

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Customers</h1>
          <p className="page-subtitle">View and manage your customer base</p>
        </div>
      </div>

      <div className="toolbar animate-in animate-in-1">
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={15} />
          <input className="toolbar-search-input" placeholder="Search by name or email..." value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setPage(1); }} />
        </div>
      </div>

      <div className="dash-card animate-in animate-in-2">
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Orders</th>
                <th>Total Spent</th>
                <th>Joined</th>
                <th>Role</th>
                <th style={{ width: 100 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>{Array.from({ length: 8 }).map((_, j) => (<td key={j}><div className="skeleton" style={{ height: 16, width: '80%' }} /></td>))}</tr>
                ))
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="empty-state">
                      <div className="empty-state-icon"><Users size={28} /></div>
                      <h3 className="empty-state-title">No customers found</h3>
                      <p className="empty-state-text">Customers will appear here when they register.</p>
                    </div>
                  </td>
                </tr>
              ) : customers.map(c => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 'var(--r-md)',
                        background: c.role === 'admin'
                          ? 'linear-gradient(135deg, rgba(201,168,76,0.3), rgba(201,168,76,0.5))'
                          : 'linear-gradient(135deg, var(--gold-muted), rgba(201,168,76,0.25))',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--gold)', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                        border: c.role === 'admin' ? '1.5px solid var(--gold)' : 'none',
                      }}>
                        {c.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                      </div>
                      <span className="cell-primary">{c.name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{c.email}</td>
                  <td style={{ fontSize: '0.8rem' }}>{c.phone || '—'}</td>
                  <td><span className="cell-bold">{c.totalOrders}</span></td>
                  <td><span style={{ color: 'var(--gold)', fontWeight: 600 }}>₹{c.totalSpent?.toLocaleString('en-IN') || '0'}</span></td>
                  <td style={{ fontSize: '0.78rem', whiteSpace: 'nowrap' }}>
                    {new Date(c.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td>
                    <span className={`status-badge ${c.role === 'admin' ? 'status-confirmed' : 'status-delivered'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                      {c.role === 'admin' && <Shield size={10} style={{ marginRight: 2, verticalAlign: 'middle' }} />}
                      {c.role}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-admin btn-admin-secondary btn-admin-icon btn-admin-sm" onClick={() => setSelectedCustomer(c)} title="View">
                        <Eye size={14} />
                      </button>
                      <button
                        className={`btn-admin btn-admin-sm ${c.role === 'admin' ? 'btn-admin-danger' : 'btn-admin-secondary'}`}
                        onClick={() => handleRoleChangeRequest(c, c.role === 'admin' ? 'user' : 'admin')}
                        title={c.role === 'admin' ? 'Demote to user' : 'Promote to admin'}
                        style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: '0.68rem', padding: '4px 8px' }}
                      >
                        {c.role === 'admin' ? <ShieldOff size={12} /> : <Shield size={12} />}
                      </button>
                    </div>
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

      {selectedCustomer && (
        <CustomerDetailModal
          customer={selectedCustomer}
          onClose={() => setSelectedCustomer(null)}
          onRoleChange={handleRoleChangeRequest}
        />
      )}

      {roleChange && (
        <RoleConfirmDialog
          customer={roleChange.customer}
          newRole={roleChange.newRole}
          onConfirm={handleRoleChangeConfirm}
          onCancel={() => setRoleChange(null)}
          loading={roleLoading}
        />
      )}
    </div>
  );
}
