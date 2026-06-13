"use client";

import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ChatBot from '@/components/ChatBot';
import ToastNotifier from '@/components/ToastNotifier';
import { Button } from '@/components/ui/button';
import { Loader2, UserCog, LogOut } from 'lucide-react';
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" strokeWidth={1.5} aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Loading portal</p>
      </div>
    );
  }

  const isClassroom = pathname?.includes('/classroom/');
  if (!user || (user.role !== 'student' && !useStore.getState().auditingUser && !isClassroom)) {
    return null;
  }

  if (isClassroom) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground">
        {children}
        <ToastNotifier />
      </div>
    );
  }

  const auditingUser = useStore.getState().auditingUser;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {user?.role === 'admin' && auditingUser && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-destructive/30 bg-destructive/10 px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2.5 text-sm text-destructive">
            <span className="relative flex h-2 w-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-destructive" />
            </span>
            <UserCog className="h-4 w-4" aria-hidden="true" />
            <span>
              Audit mode — viewing as <strong className="font-semibold">{auditingUser.name}</strong>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { useStore.getState().setAuditingUser(null); router.push('/admin'); }}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            Return to admin panel
          </Button>
        </div>
      )}

      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex flex-1 flex-col p-4 sm:p-6">
          <div className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
            <Header />
            <div className="flex-1 overflow-auto p-5 sm:p-6">
              {children}
            </div>
          </div>
        </main>
      </div>

      <ChatBot />
      <ToastNotifier />
    </div>
  );
}
