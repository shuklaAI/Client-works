'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useAuthStore from '@/store/authStore';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminTopbar from '@/components/admin/AdminTopbar';
import './admin.css';

export default function AdminLayout({ children }) {
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait for hydration
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ready && (!isAuthenticated || !user || user.role !== 'admin')) {
      router.push('/login?redirect=/admin');
    }
  }, [ready, isAuthenticated, user, router]);

  if (!ready || !isAuthenticated || !user || user.role !== 'admin') {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh', background: 'var(--navy)'
      }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="admin-content">
        <AdminTopbar user={user} />
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
