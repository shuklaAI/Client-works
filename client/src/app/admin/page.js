'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  IndianRupee, ShoppingCart, Package, Users, Clock, AlertTriangle,
  TrendingUp, TrendingDown, Star, ShoppingBag, UserPlus, ArrowUpRight
} from 'lucide-react';
import api from '@/lib/api';

// ─── Mock Data (fallback when API has no data) ───
const MOCK_STATS = {
  totalRevenue: 284750, ordersToday: 12, totalOrders: 347,
  totalProducts: 156, totalUsers: 892, pendingOrders: 23, lowStockCount: 8
};

const MOCK_CHART = Array.from({ length: 30 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (29 - i));
  return {
    date: d.toISOString().split('T')[0],
    revenue: Math.floor(3000 + Math.random() * 15000),
    orders: Math.floor(2 + Math.random() * 12)
  };
});

const MOCK_TOP_PRODUCTS = [
  { name: 'Arduino Uno R3 Board', totalQty: 142, totalRevenue: 71000 },
  { name: 'Raspberry Pi 5 (8GB)', totalQty: 89, totalRevenue: 62300 },
  { name: 'ESP32 Development Board', totalQty: 234, totalRevenue: 46800 },
  { name: 'Ultrasonic Sensor HC-SR04', totalQty: 312, totalRevenue: 31200 },
  { name: 'L298N Motor Driver Module', totalQty: 178, totalRevenue: 26700 },
];

const MOCK_LOW_STOCK = [
  { name: 'Servo Motor MG996R', sku: 'SM-MG996R', stock: 3, category: { name: 'Motors' } },
  { name: 'LiPo Battery 3.7V 2200mAh', sku: 'BAT-LP3722', stock: 5, category: { name: 'Power' } },
  { name: 'OLED Display 0.96"', sku: 'DIS-OLED96', stock: 2, category: { name: 'Displays' } },
  { name: 'MPU6050 Gyroscope', sku: 'SEN-MPU60', stock: 7, category: { name: 'Sensors' } },
];

const MOCK_ACTIVITY = [
  { type: 'order', message: 'New order #TB3F8K4521 — ₹4,299', detail: 'Rahul Sharma', timestamp: new Date(Date.now() - 300000).toISOString() },
  { type: 'user', message: 'Priya Patel joined TechBharat', detail: 'priya@email.com', timestamp: new Date(Date.now() - 1200000).toISOString() },
  { type: 'review', message: 'Amit Kumar reviewed "Arduino Uno R3"', detail: '5★ — Excellent quality!', timestamp: new Date(Date.now() - 3600000).toISOString() },
  { type: 'order', message: 'New order #TB3F8K4520 — ₹12,599', detail: 'Sneha Gupta', timestamp: new Date(Date.now() - 7200000).toISOString() },
  { type: 'order', message: 'New order #TB3F8K4519 — ₹2,149', detail: 'Vikram Singh', timestamp: new Date(Date.now() - 14400000).toISOString() },
];

// ─── SVG Revenue Chart ───
function RevenueChart({ data, height = 200 }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);
  if (!data || data.length === 0) return null;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const padding = { top: 20, right: 10, bottom: 30, left: 10 };
  const chartW = 100; // percentage-based
  const chartH = height - padding.top - padding.bottom;

  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 100;
    const y = padding.top + chartH - (d.revenue / maxRev) * chartH;
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
  const areaPath = `${linePath} L${points[points.length - 1].x},${padding.top + chartH} L${points[0].x},${padding.top + chartH} Z`;

  return (
    <div className="chart-container" style={{ height }}>
      <svg width="100%" height={height} viewBox={`0 0 100 ${height}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#areaGrad)" />
        <path d={linePath} fill="none" stroke="var(--gold)" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r={hoveredIdx === i ? 1.2 : 0.6}
            fill={hoveredIdx === i ? 'var(--gold-light)' : 'var(--gold)'}
            style={{ cursor: 'pointer', transition: 'r 0.15s' }}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          />
        ))}
      </svg>
      {hoveredIdx !== null && (
        <div className="chart-tooltip" style={{
          left: `${points[hoveredIdx].x}%`,
          top: points[hoveredIdx].y - 10,
          transform: 'translate(-50%, -100%)'
        }}>
          <div style={{ fontWeight: 600, color: 'var(--gold)' }}>
            ₹{points[hoveredIdx].revenue.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
            {new Date(points[hoveredIdx].date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Donut Chart ───
function DonutChart({ data, size = 160 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const radius = 60;
  const cx = 80, cy = 80;
  const strokeWidth = 18;

  let offset = 0;
  const segments = data.map(d => {
    const pct = d.value / total;
    const dash = pct * 2 * Math.PI * radius;
    const gap = 2 * Math.PI * radius - dash;
    const seg = { ...d, pct, dash, gap, offset: offset * 2 * Math.PI * radius };
    offset += pct;
    return seg;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <svg width={size} height={size} viewBox="0 0 160 160">
        {segments.map((seg, i) => (
          <circle
            key={i}
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke={seg.color}
            strokeWidth={strokeWidth}
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={-seg.offset}
            strokeLinecap="round"
            transform={`rotate(-90 ${cx} ${cy})`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
        ))}
        <text x={cx} y={cy - 6} textAnchor="middle" fill="var(--white)" fontSize="18" fontWeight="700" fontFamily="var(--font-body)">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="var(--text-muted)" fontSize="8" fontFamily="var(--font-body)">
          Total
        </text>
      </svg>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {segments.map((seg, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem' }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: seg.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-secondary)' }}>{seg.label}</span>
            <span style={{ color: 'var(--text-muted)', marginLeft: 'auto', fontWeight: 600 }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Time Ago ───
function timeAgo(ts) {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [chartRange, setChartRange] = useState(30);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, chartRes, topRes, lowRes, actRes] = await Promise.allSettled([
        api.get('/admin/stats'),
        api.get(`/admin/revenue-chart?days=${chartRange}`),
        api.get('/admin/top-products?limit=5'),
        api.get('/admin/low-stock?threshold=10'),
        api.get('/admin/activity?limit=8'),
      ]);

      setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : MOCK_STATS);
      setChartData(chartRes.status === 'fulfilled' && chartRes.value.data?.length ? chartRes.value.data : MOCK_CHART);
      setTopProducts(topRes.status === 'fulfilled' && topRes.value.data?.length ? topRes.value.data : MOCK_TOP_PRODUCTS);
      setLowStock(lowRes.status === 'fulfilled' && lowRes.value.data?.length ? lowRes.value.data : MOCK_LOW_STOCK);
      setActivity(actRes.status === 'fulfilled' && actRes.value.data?.length ? actRes.value.data : MOCK_ACTIVITY);
    } catch {
      setStats(MOCK_STATS);
      setChartData(MOCK_CHART);
      setTopProducts(MOCK_TOP_PRODUCTS);
      setLowStock(MOCK_LOW_STOCK);
      setActivity(MOCK_ACTIVITY);
    }
    setLoading(false);
  }, [chartRange]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const st = stats || MOCK_STATS;

  const kpis = [
    { label: 'Total Revenue', value: `₹${st.totalRevenue.toLocaleString('en-IN')}`, icon: IndianRupee, type: 'revenue', trend: '+12.5%', trendDir: 'up' },
    { label: 'Orders Today', value: st.ordersToday, icon: ShoppingCart, type: 'orders', trend: '+8.2%', trendDir: 'up' },
    { label: 'Active Products', value: st.totalProducts, icon: Package, type: 'products' },
    { label: 'Total Customers', value: st.totalUsers, icon: Users, type: 'users', trend: '+5.3%', trendDir: 'up' },
    { label: 'Pending Orders', value: st.pendingOrders, icon: Clock, type: 'pending' },
    { label: 'Low Stock Alerts', value: st.lowStockCount, icon: AlertTriangle, type: 'alert' },
  ];

  const orderStatusData = [
    { label: 'Delivered', value: Math.floor(st.totalOrders * 0.55), color: 'var(--success)' },
    { label: 'Shipped', value: Math.floor(st.totalOrders * 0.18), color: '#06B6D4' },
    { label: 'Processing', value: Math.floor(st.totalOrders * 0.12), color: '#A855F7' },
    { label: 'Pending', value: st.pendingOrders || Math.floor(st.totalOrders * 0.08), color: 'var(--warning)' },
    { label: 'Cancelled', value: Math.floor(st.totalOrders * 0.07), color: 'var(--error)' },
  ];

  return (
    <div>
      {/* Page Header */}
      <div className="page-header animate-in">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back! Here's what's happening with your store.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon;
          return (
            <div key={i} className={`kpi-card animate-in animate-in-${i + 1}`}>
              <div className={`kpi-icon ${kpi.type}`}>
                <Icon size={20} />
              </div>
              <div className="kpi-value">{loading ? '—' : kpi.value}</div>
              <div className="kpi-label">{kpi.label}</div>
              {kpi.trend && (
                <span className={`kpi-trend ${kpi.trendDir}`}>
                  {kpi.trendDir === 'up' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {kpi.trend}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="dash-grid">
        {/* Revenue Chart */}
        <div className="dash-card dash-grid-full animate-in animate-in-3">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Revenue Overview</h3>
            <div className="dash-card-tabs">
              {[7, 30, 90].map(d => (
                <button
                  key={d}
                  className={`dash-tab ${chartRange === d ? 'active' : ''}`}
                  onClick={() => setChartRange(d)}
                >
                  {d}D
                </button>
              ))}
            </div>
          </div>
          <div className="dash-card-body">
            <RevenueChart data={chartData} height={220} />
          </div>
        </div>

        {/* Order Status Donut */}
        <div className="dash-card animate-in animate-in-4">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Order Status</h3>
          </div>
          <div className="dash-card-body" style={{ display: 'flex', justifyContent: 'center' }}>
            <DonutChart data={orderStatusData} />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="dash-card animate-in animate-in-5">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Top Selling Products</h3>
          </div>
          <div className="dash-card-body">
            {topProducts.map((p, i) => (
              <div key={i} className="top-product-row">
                <span className="top-product-rank">{i + 1}</span>
                <span className="top-product-name">{p.name}</span>
                <span className="top-product-sales">{p.totalQty} sold</span>
                <span className="top-product-revenue">₹{p.totalRevenue.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="dash-card animate-in animate-in-4">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Low Stock Alerts</h3>
            <AlertTriangle size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <div className="dash-card-body">
            {lowStock.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <p className="empty-state-text">All products are well stocked!</p>
              </div>
            ) : lowStock.map((p, i) => (
              <div key={i} className="low-stock-row">
                <div style={{ flex: 1 }}>
                  <div className="low-stock-name">{p.name}</div>
                  <div className="low-stock-sku">{p.sku}</div>
                </div>
                <span className={`low-stock-count ${p.stock <= 3 ? 'critical' : 'warning'}`}>
                  {p.stock} left
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dash-card animate-in animate-in-5">
          <div className="dash-card-header">
            <h3 className="dash-card-title">Recent Activity</h3>
          </div>
          <div className="dash-card-body">
            {activity.map((item, i) => (
              <div key={i} className="activity-item">
                <div className={`activity-icon ${item.type}`}>
                  {item.type === 'order' && <ShoppingBag size={16} />}
                  {item.type === 'review' && <Star size={16} />}
                  {item.type === 'user' && <UserPlus size={16} />}
                </div>
                <div className="activity-content">
                  <div className="activity-message">{item.message}</div>
                  <div className="activity-detail">{item.detail}</div>
                </div>
                <span className="activity-time">{timeAgo(item.timestamp)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
