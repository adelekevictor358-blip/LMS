"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, LineChart, Building2, LogOut, Layers, Inbox, ClipboardList, HelpCircle, Library, Archive, MessageSquare, Star, Settings, Sun, Moon, Film } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';

export default function Sidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const { user, notifications, messages, liveSessions, getStudentCourseIds } = useStore();
  const enrolledCourseIds = getStudentCourseIds(user);
  const liveCount = liveSessions?.filter(s => enrolledCourseIds.includes(s.courseId)).length || 0;

  useEffect(() => setMounted(true), []);
  const unreadNotifs = notifications.filter(n => !n.read).length;
  const unreadMessages = messages?.filter(m => m.to === user?.id && !m.read).length || 0;

  const links = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Inbox', path: '/dashboard/inbox', icon: <Inbox size={18} />, badge: unreadNotifs },
    { label: 'Messages', path: '/dashboard/messages', icon: <MessageSquare size={18} />, badge: unreadMessages },
    { label: 'My Courses', path: '/dashboard/courses', icon: <BookOpen size={18} /> },
    { label: 'Assignments', path: '/dashboard/assignments', icon: <ClipboardList size={18} /> },
    { label: 'Quizzes', path: '/dashboard/quizzes', icon: <HelpCircle size={18} /> },
    { label: 'Library', path: '/dashboard/library', icon: <Library size={18} /> },
    { label: 'Past Questions', path: '/dashboard/past-questions', icon: <Archive size={18} /> },
    { label: 'Rate Lecturers', path: '/dashboard/rate', icon: <Star size={18} /> },
    { label: 'Online Class', path: '/dashboard/classroom', icon: <Layers size={18} />, badge: liveCount, isLive: liveCount > 0 },
    { label: 'Class Archives', path: '/dashboard/archives', icon: <Film size={18} /> },
    { label: 'Analytics', path: '/dashboard/ai', icon: <LineChart size={18} /> },
    { label: 'Uni Home', path: 'https://mtu.edu.ng', external: true, icon: <Building2 size={18} /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sticky top-0 h-screen w-64 flex-shrink-0 overflow-y-auto border-r border-border bg-card text-card-foreground">
      <div className="flex min-h-full flex-col p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-card p-1">
            <img src="/mtu-logo.png" alt="Mountain Top University" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-serif text-base font-semibold tracking-tight text-foreground">Mountain Top</span>
            <span className="text-xs text-muted-foreground">University</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Student menu
          </div>
          {links.map((link) => {
            const isActive = !link.external && pathname === link.path;
            const linkClass = `group flex items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-accent hover:text-foreground'
            }`;
            const inner = (
              <>
                <span className="flex flex-1 items-center gap-3">
                  <span className="flex items-center justify-center">{link.icon}</span>
                  <span>{link.label}</span>
                </span>
                {link.isLive && link.badge > 0 ? (
                  <span className="flex items-center gap-1.5 text-xs font-medium">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
                    Live
                  </span>
                ) : link.badge > 0 ? (
                  <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-xs font-semibold tabular-nums ${
                    isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {link.badge}
                  </span>
                ) : null}
              </>
            );

            return link.external ? (
              <a
                href={link.path}
                key={link.path}
                target="_blank"
                rel="noopener noreferrer"
                className={linkClass}
              >
                {inner}
              </a>
            ) : (
              <Link
                href={link.path}
                key={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={linkClass}
              >
                {inner}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            className="mb-2 flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
          >
            {mounted ? (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />) : <span className="h-[18px] w-[18px] rounded-md bg-muted animate-pulse" aria-hidden="true" />}
            <span>{mounted ? (theme === 'dark' ? 'Light mode' : 'Dark mode') : 'Theme'}</span>
          </button>
          <Link
            href="/login"
            className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span className="flex items-center justify-center"><LogOut size={18} /></span>
            Log out
          </Link>
        </div>
      </div>
    </aside>
  );
}
