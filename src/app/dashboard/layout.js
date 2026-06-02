"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import ToastNotifier from '@/components/ToastNotifier';
import adminImg from '@/ADMIN.jpg';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const user = useStore(state => state.user);
  const hasHydrated = useStore(state => state._hasHydrated);

  useEffect(() => {
    if (!hasHydrated) return;
    const userId = user?.id;
    const userRole = user?.role;
    
    if (!userId) {
      if (pathname !== '/login') router.push('/login');
    } else if (userRole === 'admin' && !useStore.getState().auditingUser) {
      if (pathname !== '/admin') router.push('/admin');
    } else if (userRole === 'lecturer' && !pathname.includes('/classroom/')) {
      if (!pathname.startsWith('/lecturer')) router.push('/lecturer');
    }
    setMounted(true);
  }, [user?.id, user?.role, hasHydrated, pathname]);

  // Single stable loading screen — no mounted/theme state so no blink
  if (!hasHydrated) {
    return (
      <div style={{ minHeight: '100vh', background: '#0f172a', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
        <div style={{ width: 48, height: 48, border: '4px solid #1e40af', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <p style={{ fontSize: '0.7rem', fontWeight: 900, letterSpacing: '0.15em', color: '#475569', textTransform: 'uppercase' }}>Loading Portal...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const isClassroom = pathname?.includes('/classroom/');
  if (!user || (user.role !== 'student' && !useStore.getState().auditingUser && !isClassroom)) {
    return null;
  }

  if (isClassroom) {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-slate-100 overflow-hidden relative">
        {children}
        <ToastNotifier />
      </div>
    );
  }

  const auditingUser = useStore.getState().auditingUser;

  return (
    <div
      className="dashboard-wrapper nerdy-bg"
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

      <div className="dashboard-layout-content">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content-card">
            <Header />
            <div className="dashboard-content-inner">
              {children}
            </div>
          </div>
        </main>
      </div>

      <ChatBot />
      <ToastNotifier />

      <style jsx global>{`
        .nerdy-bg {
          background: linear-gradient(135deg, #e6f0fc 0%, #f0e6fa 50%, #e6f0fc 100%);
        }
        [data-theme='dark'] .nerdy-bg {
          background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        }
        .dashboard-content-card {
          background: white;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 10px 40px rgba(0,0,0,0.03);
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        [data-theme='dark'] .dashboard-content-card {
          background: #1e293b;
          box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
