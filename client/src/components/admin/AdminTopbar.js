'use client';
import { useState } from 'react';
import { Search, Bell, Moon, Sun, LogOut } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import { useRouter } from 'next/navigation';

export default function AdminTopbar({ user }) {
  const { logout } = useAuthStore();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : 'AD';

  return (
    <header className="admin-topbar">
      {/* Search */}
      <div className="topbar-search">
        <Search className="topbar-search-icon" size={16} />
        <input
          type="text"
          className="topbar-search-input"
          placeholder="Search products, orders, customers..."
        />
      </div>

      {/* Actions */}
      <div className="topbar-actions">
        <button className="topbar-btn" title="Notifications">
          <Bell size={18} />
          <span className="topbar-btn-dot" />
        </button>

        <div className="topbar-divider" />

        {/* User */}
        <div
          className="topbar-user"
          onClick={() => setShowUserMenu(!showUserMenu)}
          style={{ position: 'relative' }}
        >
          <div className="topbar-avatar">{initials}</div>
          <div className="topbar-user-info">
            <span className="topbar-user-name">{user?.name || 'Admin'}</span>
            <span className="topbar-user-role">Administrator</span>
          </div>

          {showUserMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: 8,
              background: 'var(--navy-2)',
              border: '1px solid var(--navy-border)',
              borderRadius: 'var(--r-lg)',
              padding: '6px',
              minWidth: 180,
              boxShadow: 'var(--shadow-lg)',
              zIndex: 100,
              animation: 'slideInUp 0.2s ease',
            }}>
              <button
                onClick={handleLogout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  width: '100%',
                  padding: '8px 12px',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--error)',
                  fontSize: '0.82rem',
                  fontWeight: 500,
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => e.target.style.background = 'rgba(239,68,68,0.08)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
