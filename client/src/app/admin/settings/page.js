'use client';
import { useState } from 'react';
import {
  Settings as SettingsIcon, Globe, CreditCard, Truck, Receipt,
  Save, Upload, Image as ImageIcon, Palette
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('website');
  const [saving, setSaving] = useState(false);

  // Website settings
  const [website, setWebsite] = useState({
    storeName: 'TechBharat Store',
    tagline: "India's Premier Robotics & Electronics Store",
    logoUrl: '',
    bannerUrl: '',
    contactEmail: 'support@techbharat.in',
    contactPhone: '+91 98765 43210',
  });

  // Payment settings
  const [payment, setPayment] = useState({
    razorpayEnabled: true,
    codEnabled: true,
    razorpayKeyId: 'rzp_test_*************',
    testMode: true,
  });

  // Shipping settings
  const [shipping, setShipping] = useState({
    freeShippingThreshold: 999,
    flatRate: 99,
    expressRate: 199,
    estimatedDays: '3-5 business days',
    expressDays: '1-2 business days',
  });

  // Tax settings
  const [tax, setTax] = useState({
    gstEnabled: true,
    gstRate: 18,
    gstNumber: '',
    inclusivePricing: false,
  });

  const handleSave = async () => {
    setSaving(true);
    // Simulate save
    await new Promise(r => setTimeout(r, 800));
    setSaving(false);
  };

  const tabs = [
    { key: 'website', label: 'Website', icon: Globe },
    { key: 'payment', label: 'Payment', icon: CreditCard },
    { key: 'shipping', label: 'Shipping', icon: Truck },
    { key: 'tax', label: 'Tax', icon: Receipt },
  ];

  return (
    <div>
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Configure your store preferences</p>
        </div>
        <button className="btn-admin btn-admin-primary" onClick={handleSave} disabled={saving}>
          {saving ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Save size={15} />}
          Save Changes
        </button>
      </div>

      {/* Tabs */}
      <div className="tab-bar animate-in animate-in-1">
        {tabs.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.key} className={`tab-bar-item ${activeTab === t.key ? 'active' : ''}`} onClick={() => setActiveTab(t.key)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon size={14} /> {t.label}
            </button>
          );
        })}
      </div>

      {/* Website Settings */}
      {activeTab === 'website' && (
        <div className="animate-in">
          <div className="settings-section">
            <h3 className="settings-section-title">General</h3>
            <p className="settings-section-desc">Basic store information and branding</p>

            <div className="form-row" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input className="form-input" value={website.storeName} onChange={e => setWebsite(w => ({ ...w, storeName: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input className="form-input" value={website.tagline} onChange={e => setWebsite(w => ({ ...w, tagline: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input className="form-input" type="email" value={website.contactEmail} onChange={e => setWebsite(w => ({ ...w, contactEmail: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Phone</label>
                <input className="form-input" value={website.contactPhone} onChange={e => setWebsite(w => ({ ...w, contactPhone: e.target.value }))} />
              </div>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title">Branding</h3>
            <p className="settings-section-desc">Logo, banners, and visual identity</p>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Logo URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={website.logoUrl} onChange={e => setWebsite(w => ({ ...w, logoUrl: e.target.value }))} placeholder="/images/logo.png" style={{ flex: 1 }} />
                  <button className="btn-admin btn-admin-secondary"><Upload size={14} /></button>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Banner Image URL</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input className="form-input" value={website.bannerUrl} onChange={e => setWebsite(w => ({ ...w, bannerUrl: e.target.value }))} placeholder="/images/banner.jpg" style={{ flex: 1 }} />
                  <button className="btn-admin btn-admin-secondary"><Upload size={14} /></button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="animate-in">
          <div className="settings-section">
            <h3 className="settings-section-title">Payment Methods</h3>
            <p className="settings-section-desc">Configure payment gateways and options</p>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Razorpay</div>
                <div className="settings-row-desc">Accept online payments via Razorpay</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={payment.razorpayEnabled} onChange={e => setPayment(p => ({ ...p, razorpayEnabled: e.target.checked }))} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Cash on Delivery</div>
                <div className="settings-row-desc">Allow customers to pay on delivery</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={payment.codEnabled} onChange={e => setPayment(p => ({ ...p, codEnabled: e.target.checked }))} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Test Mode</div>
                <div className="settings-row-desc">Use test keys for payment processing</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={payment.testMode} onChange={e => setPayment(p => ({ ...p, testMode: e.target.checked }))} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>
          </div>

          {payment.razorpayEnabled && (
            <div className="settings-section">
              <h3 className="settings-section-title">Razorpay Configuration</h3>
              <p className="settings-section-desc">API keys from your Razorpay dashboard</p>
              <div className="form-group">
                <label className="form-label">Key ID</label>
                <input className="form-input" value={payment.razorpayKeyId} onChange={e => setPayment(p => ({ ...p, razorpayKeyId: e.target.value }))} placeholder="rzp_test_..." />
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                ⚠️ Key Secret is stored in your server's <code style={{ color: 'var(--gold)' }}>.env</code> file for security.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && (
        <div className="animate-in">
          <div className="settings-section">
            <h3 className="settings-section-title">Shipping Rates</h3>
            <p className="settings-section-desc">Configure shipping costs and delivery estimates</p>

            <div className="form-row-3" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">Free Shipping Threshold (₹)</label>
                <input className="form-input" type="number" value={shipping.freeShippingThreshold} onChange={e => setShipping(s => ({ ...s, freeShippingThreshold: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Standard Rate (₹)</label>
                <input className="form-input" type="number" value={shipping.flatRate} onChange={e => setShipping(s => ({ ...s, flatRate: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Express Rate (₹)</label>
                <input className="form-input" type="number" value={shipping.expressRate} onChange={e => setShipping(s => ({ ...s, expressRate: e.target.value }))} />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Standard Delivery Time</label>
                <input className="form-input" value={shipping.estimatedDays} onChange={e => setShipping(s => ({ ...s, estimatedDays: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Express Delivery Time</label>
                <input className="form-input" value={shipping.expressDays} onChange={e => setShipping(s => ({ ...s, expressDays: e.target.value }))} />
              </div>
            </div>

            <div style={{ background: 'var(--navy-3)', borderRadius: 'var(--r-lg)', padding: 14, marginTop: 16, fontSize: '0.82rem' }}>
              <p style={{ color: 'var(--text-secondary)' }}>
                📦 Orders above <strong style={{ color: 'var(--gold)' }}>₹{shipping.freeShippingThreshold}</strong> get free shipping.
                Below that, standard rate of <strong>₹{shipping.flatRate}</strong> applies.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tax Settings */}
      {activeTab === 'tax' && (
        <div className="animate-in">
          <div className="settings-section">
            <h3 className="settings-section-title">Tax Configuration</h3>
            <p className="settings-section-desc">GST and tax calculation settings</p>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Enable GST</div>
                <div className="settings-row-desc">Apply GST on all orders</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={tax.gstEnabled} onChange={e => setTax(t => ({ ...t, gstEnabled: e.target.checked }))} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Tax-Inclusive Pricing</div>
                <div className="settings-row-desc">Product prices already include GST</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={tax.inclusivePricing} onChange={e => setTax(t => ({ ...t, inclusivePricing: e.target.checked }))} />
                <div className="toggle-track" />
                <div className="toggle-thumb" />
              </label>
            </div>

            {tax.gstEnabled && (
              <div style={{ marginTop: 16 }}>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">GST Rate (%)</label>
                    <input className="form-input" type="number" value={tax.gstRate} onChange={e => setTax(t => ({ ...t, gstRate: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">GSTIN Number</label>
                    <input className="form-input" value={tax.gstNumber} onChange={e => setTax(t => ({ ...t, gstNumber: e.target.value }))} placeholder="22AAAAA0000A1Z5" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
