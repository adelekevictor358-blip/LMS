"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import {
  Bell, HelpCircle, Library, ClipboardList, GraduationCap,
  BookOpen, ShieldAlert, Archive, MessageSquare, CheckCheck,
  Trash2, Inbox as InboxIcon, ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Map a notification `type` to a lucide icon — kept in sync with NotificationBell.
// Unknown types fall back to Bell.
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

// Human label per type, used by the filter chips.
const TYPE_LABEL = {
  quiz: 'Quizzes',
  material: 'Materials',
  assignment: 'Assignments',
  result: 'Results',
  registration: 'Registration',
  security: 'Security',
  pastq: 'Past questions',
  message: 'Messages',
  system: 'System',
};

const FILTERS = ['all', 'quiz', 'material', 'assignment', 'result', 'registration', 'security', 'pastq', 'message', 'system'];

// Hydration-safe "are we on the client yet" flag without setState-in-effect.
// Server snapshot is false; client snapshot is true, so persisted (localStorage)
// store reads only happen after hydration and never mismatch the server HTML.
const emptySubscribe = () => () => {};
const useHasMounted = () =>
  useSyncExternalStore(emptySubscribe, () => true, () => false);

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

export default function Inbox() {
  const {
    user,
    notifications,
    getMyNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    clearAllNotifications,
  } = useStore();

  const router = useRouter();
  const mounted = useHasMounted();
  const [filter, setFilter] = useState('all');

  // `notifications` is read so this component re-renders when the array changes;
  // the ordered/scoped list comes from the store helper.
  void notifications;
  const myNotifications = mounted && user ? getMyNotifications() : [];
  const unreadCount = myNotifications.filter((n) => !n.read).length;

  // Only show filter chips for types that actually have notifications.
  const presentSet = new Set(myNotifications.map((n) => n.type || 'system'));
  const presentTypes = FILTERS.filter((t) => t === 'all' || presentSet.has(t));

  // Derive the active filter so a stale selection (its type no longer present)
  // gracefully falls back to "all" during render — no setState-in-effect.
  const effectiveFilter = presentTypes.includes(filter) ? filter : 'all';

  const visible = effectiveFilter === 'all'
    ? myNotifications
    : myNotifications.filter((n) => (n.type || 'system') === effectiveFilter);

  const handleRowClick = (n) => {
    if (!n.read) markNotificationRead(n.id);
    if (n.link) router.push(n.link);
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <InboxIcon size={26} strokeWidth={1.75} className="text-muted-foreground" />
            Notifications
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
            {unreadCount > 0
              ? `${unreadCount} unread of ${myNotifications.length} total.`
              : `Your full notification history${myNotifications.length > 0 ? ` — ${myNotifications.length} total.` : '.'}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={unreadCount === 0}
            onClick={() => markAllNotificationsRead()}
          >
            <CheckCheck size={16} />
            Mark all read
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={myNotifications.length === 0}
            onClick={() => clearAllNotifications()}
            className="text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
            Clear all
          </Button>
        </div>
      </header>

      {presentTypes.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2" role="group" aria-label="Filter by type">
          {presentTypes.map((t) => {
            const active = effectiveFilter === t;
            return (
              <button
                key={t}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(t)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                {t === 'all' ? 'All' : (TYPE_LABEL[t] || t)}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        {visible.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            <InboxIcon size={40} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {myNotifications.length === 0
                ? "You're all caught up."
                : 'No notifications match this filter.'}
            </p>
            {effectiveFilter !== 'all' && myNotifications.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setFilter('all')}>
                Show all
              </Button>
            )}
          </div>
        ) : (
          <ul className="flex-1 divide-y divide-border overflow-y-auto">
            {visible.map((n) => {
              const Icon = TYPE_ICON[n.type] || Bell;
              return (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => handleRowClick(n)}
                    className={`group flex w-full items-start gap-3 px-4 py-4 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 ${
                      n.read ? '' : 'bg-accent/40'
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                        n.isUrgent
                          ? 'bg-destructive/10 text-destructive'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <Icon size={16} />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-3">
                        <span
                          className={`block text-sm leading-snug text-foreground ${
                            n.read ? '' : 'font-semibold'
                          }`}
                        >
                          {n.text}
                        </span>
                        <span className="shrink-0 whitespace-nowrap text-xs tabular-nums text-muted-foreground">
                          {timeAgo(n.time)}
                        </span>
                      </span>
                      <span className="mt-1.5 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {TYPE_LABEL[n.type] || 'System'}
                        </span>
                        {n.isUrgent && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[0.6875rem] font-medium text-destructive">
                            Urgent
                          </span>
                        )}
                        {n.link && (
                          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                            Open
                            <ChevronRight size={12} />
                          </span>
                        )}
                      </span>
                    </span>

                    {!n.read && (
                      <span
                        aria-label="Unread"
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
    </div>
  );
}
