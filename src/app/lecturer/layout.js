"use client";

import LecturerSidebar from '@/components/LecturerSidebar';
import ToastNotifier from '@/components/ToastNotifier';
import adminImg from '@/ADMIN.jpg';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Bell } from 'lucide-react';

export default function LecturerLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const user = useStore(state => state.user);
  const hasHydrated = useStore(state => state._hasHydrated);
  const notifications = useStore(state => state.notifications);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    if (!hasHydrated) return;
    const userId = user?.id;
    const userRole = user?.role;

    if (!userId) {
      if (pathname !== '/login') router.push('/login');
    } else if (userRole === 'admin' && !useStore.getState().auditingUser) {
      if (pathname !== '/admin') router.push('/admin');
    } else if (userRole === 'student') {
      if (!pathname.startsWith('/dashboard')) router.push('/dashboard');
    }
  }, [user?.id, user?.role, hasHydrated, pathname]);

  // Single stable loading screen — no mounted/theme state so no blink
  if (!hasHydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #4f46e5', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.15em', color: '#475569', textTransform: 'uppercase' }}>Faculty Portal Loading...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user || (user.role !== 'lecturer' && !useStore.getState().auditingUser)) {
    return null;
  }

  const auditingUser = useStore.getState().auditingUser;

  return (
    <div
      className="dashboard-wrapper"
      style={{ backgroundImage: `url(${adminImg.src})` }}
    >
      {user?.role === 'admin' && auditingUser && (
        <div className="audit-banner">
          <div className="audit-info">
            <div className="pulse-icon" />
            <span>AUDIT MODE: Viewing as <strong>{auditingUser.name}</strong></span>
          </div>
          <button
            className="exit-audit-btn"
            onClick={() => { useStore.getState().setAuditingUser(null); router.push('/admin'); }}
          >
            Return to Admin Panel
          </button>
        </div>
      )}

      {/* Single overlay — CSS class on <html> handles light/dark, no JS flash */}
      <div className="global-overlay" />

      <div className="dashboard-layout-content">
        <LecturerSidebar />
        <main className="dashboard-main" style={{ gap: '1.5rem' }}>
          <div className="lecturer-topbar glass-panel">
            <div className="topbar-left">
              <span className="topbar-role-badge">🎓 Faculty Portal</span>
            </div>
            <div className="topbar-right" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => router.push('/lecturer/messages')}
                style={{ position: 'relative', padding: '0.5rem', borderRadius: '50%', background: 'transparent', border: 'none', cursor: 'pointer', color: 'inherit' }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    height: 16, minWidth: 16, borderRadius: '50%',
                    background: '#ef4444', color: 'white', fontSize: '0.6rem', fontWeight: 900,
                    border: '2px solid white'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="dashboard-content">
            {children}
          </div>
        </main>
      </div>

      <ToastNotifier />
    </div>
  );
}
