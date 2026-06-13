"use client";

import LecturerSidebar from '@/components/LecturerSidebar';
import ToastNotifier from '@/components/ToastNotifier';
import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
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
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary"
          role="status"
          aria-label="Loading"
        />
        <p className="text-sm text-muted-foreground">Loading faculty portal…</p>
      </div>
    );
  }

  if (!user || (user.role !== 'lecturer' && !useStore.getState().auditingUser)) {
    return null;
  }

  const auditingUser = useStore.getState().auditingUser;

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground animate-fade-in">
      {user?.role === 'admin' && auditingUser && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warning/20 bg-warning/10 px-4 py-2.5">
          <div className="flex items-center gap-2 text-sm font-medium text-warning">
            <span className="h-2 w-2 animate-pulse rounded-full bg-warning" aria-hidden="true" />
            <span>
              Audit mode — viewing as <strong className="font-semibold">{auditingUser.name}</strong>
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => { useStore.getState().setAuditingUser(null); router.push('/admin'); }}
          >
            Return to admin panel
          </Button>
        </div>
      )}

      <div className="flex flex-1">
        <LecturerSidebar />
        <main className="flex flex-1 flex-col gap-6 p-5 md:p-6">
          <header className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3 text-card-foreground shadow-sm">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-green" aria-hidden="true" />
              <span className="text-sm font-semibold text-foreground">Faculty portal</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full"
              onClick={() => router.push('/lecturer/messages')}
              aria-label={unreadCount > 0 ? `Notifications, ${unreadCount} unread` : 'Notifications'}
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-card bg-destructive px-1 text-[0.625rem] font-semibold tabular-nums text-destructive-foreground">
                  {unreadCount}
                </span>
              )}
            </Button>
          </header>

          <div className="flex-1">
            {children}
          </div>
        </main>
      </div>

      <ToastNotifier />
    </div>
  );
}
