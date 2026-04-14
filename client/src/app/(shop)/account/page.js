'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User, Package, MapPin, Lock, LogOut,
  Edit2, Plus, Trash2, ChevronRight, Check,
  Eye, EyeOff, AlertCircle
} from 'lucide-react';
import useAuthStore from '@/store/authStore';
import styles from './Account.module.css';

const TABS = [
  { id: 'orders',   label: 'My Orders',   icon: Package },
  { id: 'profile',  label: 'Profile',     icon: User },
  { id: 'addresses',label: 'Addresses',   icon: MapPin },
  { id: 'password', label: 'Password',    icon: Lock },
];

// Mock orders — replace with real API fetch
const MOCK_ORDERS = [
  { id: '1', orderNumber: 'TB1A2B3C4D0001', date: '2025-03-15', total: 7499, status: 'delivered',  items: [{ name: 'Raspberry Pi 5 8GB', qty: 1, price: 7499 }] },
  { id: '2', orderNumber: 'TB5E6F7G8H0002', date: '2025-04-02', total: 2848, status: 'shipped',    items: [{ name: 'Arduino Uno R3', qty: 2, price: 599 }, { name: 'ESP32 DevKit', qty: 1, price: 449 }] },
  { id: '3', orderNumber: 'TB9I0J1K2L0003', date: '2025-04-10', total: 1499, status: 'processing', items: [{ name: 'Arduino Mega 2560', qty: 1, price: 1499 }] },
];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    color: 'var(--warning)' },
  confirmed:  { label: 'Confirmed',  color: 'var(--info)' },
  processing: { label: 'Processing', color: '#A78BFA' },
  shipped:    { label: 'Shipped',    color: 'var(--gold)' },
  delivered:  { label: 'Delivered',  color: 'var(--success)' },
  cancelled:  { label: 'Cancelled',  color: 'var(--error)' },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');

  // Profile form
  const [profile, setProfile] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileErr, setProfileErr] = useState('');

  // Password form
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [passMsg, setPassMsg] = useState('');
  const [passErr, setPassErr] = useState('');

  // Address form
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: 'Karnataka', pincode: '', isDefault: false });

  useEffect(() => {
    if (!isAuthenticated) router.replace('/login?redirect=account');
  }, [isAuthenticated, router]);

  if (!isAuthenticated) return null;

  const saveProfile = async () => {
    setProfileErr('');
    if (!profile.name.trim()) { setProfileErr('Name is required'); return; }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const token = JSON.parse(localStorage.getItem('techbharat-auth') || '{}')?.state?.token;
      const res = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      const data = await res.json();
      if (data.success) {
        updateUser(profile);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 2500);
      } else setProfileErr(data.message);
    } catch { setProfileErr('Failed to update profile. Try again.'); }
  };

  const savePassword = async () => {
    setPassErr(''); setPassMsg('');
    if (!passwords.current || !passwords.newPass || !passwords.confirm) { setPassErr('All fields required'); return; }
    if (passwords.newPass.length < 6) { setPassErr('New password must be at least 6 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { setPassErr('Passwords do not match'); return; }
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const token = JSON.parse(localStorage.getItem('techbharat-auth') || '{}')?.state?.token;
      const res = await fetch(`${API_URL}/auth/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.newPass }),
      });
      const data = await res.json();
      if (data.success) { setPassMsg('Password updated successfully!'); setPasswords({ current: '', newPass: '', confirm: '' }); }
      else setPassErr(data.message || 'Failed to update password');
    } catch { setPassErr('Network error. Please try again.'); }
  };

  const addAddress = () => {
    if (!newAddress.fullName || !newAddress.phone || !newAddress.addressLine1 || !newAddress.city || !newAddress.pincode) return;
    const updated = newAddress.isDefault
      ? [...addresses.map(a => ({ ...a, isDefault: false })), { ...newAddress, _id: Date.now().toString() }]
      : [...addresses, { ...newAddress, _id: Date.now().toString() }];
    setAddresses(updated);
    setShowAddressForm(false);
    setNewAddress({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: 'Karnataka', pincode: '', isDefault: false });
  };

  const removeAddress = (id) => setAddresses(prev => prev.filter(a => a._id !== id));

  const handleLogout = () => { logout(); router.push('/'); };

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>{user?.name?.[0] || 'U'}</div>
            <div>
              <p className={styles.userName}>{user?.name}</p>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>

          <nav className={styles.nav}>
            {TABS.map(tab => (
              <button
                key={tab.id}
                className={`${styles.navItem} ${activeTab === tab.id ? styles.navActive : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={17} />
                {tab.label}
                <ChevronRight size={14} className={styles.navChevron} />
              </button>
            ))}
            <button className={`${styles.navItem} ${styles.navLogout}`} onClick={handleLogout}>
              <LogOut size={17} /> Sign Out
            </button>
          </nav>
        </aside>

        {/* Main content */}
        <div className={styles.content}>

          {/* ── ORDERS ── */}
          {activeTab === 'orders' && (
            <div>
              <h2 className={styles.sectionTitle}>My Orders</h2>
              {MOCK_ORDERS.length === 0 ? (
                <div className={styles.empty}>
                  <Package size={40} />
                  <p>No orders yet.</p>
                  <Link href="/" className="btn-primary">Start Shopping</Link>
                </div>
              ) : (
                <div className={styles.orderList}>
                  {MOCK_ORDERS.map(order => {
                    const sc = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
                    return (
                      <div key={order.id} className={styles.orderCard}>
                        <div className={styles.orderHeader}>
                          <div>
                            <span className={styles.orderNum}>#{order.orderNumber}</span>
                            <span className={styles.orderDate}>{new Date(order.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                          </div>
                          <span className={styles.orderStatus} style={{ color: sc.color, borderColor: sc.color, background: `${sc.color}15` }}>
                            {sc.label}
                          </span>
                        </div>
                        <div className={styles.orderItems}>
                          {order.items.map((item, i) => (
                            <div key={i} className={styles.orderItem}>
                              <span>{item.name}</span>
                              <span className={styles.orderItemMeta}>×{item.qty} · ₹{item.price.toLocaleString('en-IN')}</span>
                            </div>
                          ))}
                        </div>
                        <div className={styles.orderFooter}>
                          <span className={styles.orderTotal}>Total: <strong>₹{order.total.toLocaleString('en-IN')}</strong></span>
                          <div className={styles.orderActions}>
                            {order.status === 'delivered' && (
                              <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>Write Review</button>
                            )}
                            {['pending', 'confirmed'].includes(order.status) && (
                              <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', color: 'var(--error)' }}>Cancel</button>
                            )}
                            <button className="btn-ghost" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}>View Details</button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              <h2 className={styles.sectionTitle}>Profile Details</h2>
              <div className={styles.formCard}>
                <div className={styles.field}>
                  <label>Full Name</label>
                  <input className="input" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className={styles.field}>
                  <label>Email Address <span className={styles.readonly}>(cannot be changed)</span></label>
                  <input className="input" value={user?.email || ''} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                </div>
                <div className={styles.field}>
                  <label>Mobile Number</label>
                  <input className="input" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 XXXXX XXXXX" maxLength={10} />
                </div>
                {profileErr && <p className={styles.errMsg}><AlertCircle size={14} /> {profileErr}</p>}
                {profileSaved && <p className={styles.successMsg}><Check size={14} /> Profile updated successfully</p>}
                <button className="btn-primary" onClick={saveProfile} style={{ marginTop: 'var(--sp-2)' }}>
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {/* ── ADDRESSES ── */}
          {activeTab === 'addresses' && (
            <div>
              <div className={styles.sectionHeaderRow}>
                <h2 className={styles.sectionTitle}>Saved Addresses</h2>
                <button className="btn-outline" onClick={() => setShowAddressForm(!showAddressForm)} style={{ fontSize: '0.85rem' }}>
                  <Plus size={15} /> Add New
                </button>
              </div>

              {showAddressForm && (
                <div className={styles.addressForm}>
                  <h4 className={styles.addrFormTitle}>New Address</h4>
                  <div className={styles.addrFormGrid}>
                    {[['fullName','Full Name'], ['phone','Phone'], ['addressLine1','Address Line 1'], ['addressLine2','Address Line 2 (optional)'], ['city','City'], ['pincode','Pincode']].map(([key, label]) => (
                      <div key={key} className={`${styles.field} ${['addressLine1','addressLine2'].includes(key) ? styles.fieldFull : ''}`}>
                        <label>{label}</label>
                        <input className="input" value={newAddress[key]} onChange={e => setNewAddress(p => ({ ...p, [key]: e.target.value }))} />
                      </div>
                    ))}
                    <div className={styles.field}>
                      <label>State</label>
                      <select className="input" value={newAddress.state} onChange={e => setNewAddress(p => ({ ...p, state: e.target.value }))}>
                        {['Karnataka','Delhi','Maharashtra','Tamil Nadu','Telangana','West Bengal','Gujarat','Rajasthan','Uttar Pradesh','Kerala','Punjab','Haryana'].map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className={`${styles.field} ${styles.fieldFull}`}>
                      <label className={styles.checkLabel} style={{ cursor: 'pointer' }}>
                        <input type="checkbox" checked={newAddress.isDefault} onChange={e => setNewAddress(p => ({ ...p, isDefault: e.target.checked }))} style={{ accentColor: 'var(--gold)' }} />
                        Set as default address
                      </label>
                    </div>
                  </div>
                  <div className={styles.addrFormActions}>
                    <button className="btn-primary" onClick={addAddress}>Save Address</button>
                    <button className="btn-ghost" onClick={() => setShowAddressForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div className={styles.addressList}>
                {addresses.length === 0 ? (
                  <div className={styles.empty}><MapPin size={32} /><p>No saved addresses yet.</p></div>
                ) : (
                  addresses.map(addr => (
                    <div key={addr._id} className={`${styles.addressCard} ${addr.isDefault ? styles.addressDefault : ''}`}>
                      {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      <p className={styles.addrName}>{addr.fullName} · {addr.phone}</p>
                      <p className={styles.addrText}>
                        {addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}, {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <div className={styles.addrCardActions}>
                        {!addr.isDefault && (
                          <button className={styles.addrActionBtn} onClick={() => setAddresses(prev => prev.map(a => ({ ...a, isDefault: a._id === addr._id })))}>
                            Set Default
                          </button>
                        )}
                        <button className={`${styles.addrActionBtn} ${styles.addrDelete}`} onClick={() => removeAddress(addr._id)}>
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ── PASSWORD ── */}
          {activeTab === 'password' && (
            <div>
              <h2 className={styles.sectionTitle}>Change Password</h2>
              <div className={styles.formCard} style={{ maxWidth: 460 }}>
                {[['current', 'Current Password'], ['newPass', 'New Password'], ['confirm', 'Confirm New Password']].map(([key, label]) => (
                  <div key={key} className={styles.field}>
                    <label>{label}</label>
                    <div className={styles.passWrap}>
                      <input type={showPass ? 'text' : 'password'} className="input" value={passwords[key]} onChange={e => setPasswords(p => ({ ...p, [key]: e.target.value }))} />
                      {key === 'current' && (
                        <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(!showPass)}>
                          {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {passErr && <p className={styles.errMsg}><AlertCircle size={14} /> {passErr}</p>}
                {passMsg && <p className={styles.successMsg}><Check size={14} /> {passMsg}</p>}
                <button className="btn-primary" onClick={savePassword}>Update Password</button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
