"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import {
  Bell, HelpCircle, Library, ClipboardList, GraduationCap,
  BookOpen, ShieldAlert, Archive, MessageSquare, CheckCheck, Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Map a notification `type` to a lucide icon. Unknown types fall back to Bell.
const TYPE_ICON = {
  quiz: HelpCircle,
  material: Library,
  assignment: ClipboardList,
  result: GraduationCap,
  registration: BookOpen,
  security: ShieldAlert,
  pastq: Archive,
  message: MessageSquare,
  system: Bell,
};

// Relative time from an ISO string. Legacy notifications carry human strings
// ("1 hr ago") or non-ISO values — show those verbatim.
function timeAgo(value) {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return value || '';
  const diff = Date.now() - t;
  if (diff < 0) return 'Just now';
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return 'Just now';
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr${hr === 1 ? '' : 's'} ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day} day${day === 1 ? '' : 's'} ago`;
  return new Date(t).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function NotificationBell({ seeAllHref = '/dashboard/inbox' }) {
  const {
    user,
    notifications,
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useStore();

  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const triggerRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close on outside click.
  useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (e) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target) &&
        triggerRef.current && !triggerRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // `notifications` is read so the component re-renders when the array changes;
  // the actual ordered/filtered list comes from the store helper.
  void notifications;
  const myNotifications = mounted && user ? getMyNotifications() : [];
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  const handleRowClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.link) {
      setOpen(false);
      router.push(n.link);
    }
  };

  return (
    <div className="relative">
      <Button
        ref={triggerRef}
        variant="ghost"
        size="icon"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="relative text-muted-foreground hover:text-foreground"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[0.625rem] font-medium tabular-nums leading-none text-destructive-foreground">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </Button>

      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 top-full z-[1100] mt-2 flex max-h-[28rem] w-[360px] max-w-[calc(100vw-1.5rem)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg animate-fade-in"
        >
          <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">Notifications</span>
              {unreadCount > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium tabular-nums text-primary">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Mark all as read"
                title="Mark all as read"
                disabled={unreadCount === 0}
                onClick={() => markAllNotificationsRead()}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <CheckCheck size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Clear all notifications"
                title="Clear all"
                disabled={myNotifications.length === 0}
                onClick={() => clearAllNotifications()}
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={16} />
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            {myNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
                <Bell size={28} strokeWidth={1.5} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {myNotifications.map((n) => {
                  const Icon = TYPE_ICON[n.type] || Bell;
                  return (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => handleRowClick(n)}
                        className={`flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring ${
                          n.read ? '' : 'bg-accent/50'
                        }`}
                      >
                        <span
                          className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                            n.isUrgent
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <Icon size={16} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span
                            className={`block text-sm leading-snug text-foreground ${
                              n.read ? '' : 'font-medium'
                            }`}
                          >
                            {n.text}
                          </span>
                          <span className="mt-1 block text-xs text-muted-foreground">
                            {timeAgo(n.time)}
                          </span>
                        </span>
                        {!n.read && (
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary"
                          />
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <footer className="border-t border-border px-2 py-2">
            <Button
              variant="ghost"
              className="w-full justify-center text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setOpen(false);
                router.push(seeAllHref);
              }}
            >
              See all notifications
            </Button>
          </footer>
        </div>
      )}
    </div>
  );
}
