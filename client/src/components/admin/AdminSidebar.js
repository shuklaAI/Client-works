'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Warehouse,
  Settings, ChevronLeft, ChevronRight, Percent, FolderTree
} from 'lucide-react';

const navItems = [
  { label: 'MAIN', type: 'section' },
  { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/admin/products', icon: Package, label: 'Products' },
  { href: '/admin/categories', icon: FolderTree, label: 'Categories' },
  { href: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { label: 'MANAGEMENT', type: 'section' },
  { href: '/admin/customers', icon: Users, label: 'Customers' },
  { href: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
  { href: '/admin/discounts', icon: Percent, label: 'Discounts' },
  { label: 'SYSTEM', type: 'section' },
  { href: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function AdminSidebar({ collapsed, onToggle }) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon" style={{ background: 'none', padding: 0 }}>
          <img src="/logo.png" alt="TechBharat" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-name">TechBharat</span>
          <span className="sidebar-brand-sub">Admin Panel</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.type === 'section') {
            return (
              <div key={i} className="sidebar-section-label">
                {item.label}
              </div>
            );
          }

          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive(item.href) ? 'active' : ''}`}
            >
              <Icon className="sidebar-link-icon" size={20} />
              <span className="sidebar-link-text">{item.label}</span>
              {item.badge && (
                <span className="sidebar-link-badge">{item.badge}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Collapse Toggle */}
      <div className="sidebar-footer">
        <button className="sidebar-toggle" onClick={onToggle} title={collapsed ? 'Expand' : 'Collapse'}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
