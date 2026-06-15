"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Layers, ClipboardList, ClipboardCheck, HelpCircle, Users, MessageSquare, Megaphone, LogOut, Settings, Film } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LecturerSidebar() {
  const pathname = usePathname();
  const { user, logout, messages, liveSessions, lecturerCourseRegWindow, lecturerCourseRegistrations, isLecturerRegEditable } = useStore();
  const unreadMessages = messages?.filter(m => m.to === user?.id && !m.read).length || 0;
  const isClassLive = liveSessions?.some(s => s.lecturerId === user?.id);
  const regEditable = isLecturerRegEditable?.(user?.id);
  const hasSubmitted = !!lecturerCourseRegistrations?.[user?.id]?.submittedAt;
  const regBadge = regEditable && !hasSubmitted ? 1 : 0; // pulse badge when open & not yet submitted

  const links = [
    { label: 'Dashboard', path: '/lecturer', icon: <LayoutDashboard size={18} /> },
    { label: 'Course Registration', path: '/lecturer/course-registration', icon: <ClipboardCheck size={18} />, badge: regBadge, isReg: true },
    { label: 'My Courses', path: '/lecturer/courses', icon: <BookOpen size={18} /> },
    { label: 'Materials', path: '/lecturer/materials', icon: <Layers size={18} /> },
    { label: 'Assignments', path: '/lecturer/assignments', icon: <ClipboardList size={18} /> },
    { label: 'Quizzes', path: '/lecturer/quizzes', icon: <HelpCircle size={18} /> },
    { label: 'Students', path: '/lecturer/students', icon: <Users size={18} /> },
    { label: 'Messages', path: '/lecturer/messages', icon: <MessageSquare size={18} />, badge: unreadMessages },
    { label: 'Broadcast', path: '/lecturer/broadcast', icon: <Megaphone size={18} /> },
    { label: 'Online Class', path: '/lecturer/classroom', icon: <Layers size={18} />, badge: isClassLive ? 1 : 0, isLive: isClassLive },
    { label: 'Class Archives', path: '/dashboard/archives', icon: <Film size={18} /> },
    { label: 'Profile Settings', path: '/lecturer/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sticky top-0 h-screen w-[250px] flex-shrink-0 overflow-y-auto border-r border-border bg-card transition-colors">
      <div className="flex min-h-full flex-col p-4">
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-background p-1">
            <img src="/mtu-logo.png" alt="Mountain Top University" className="h-full w-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-sm font-semibold tracking-tight text-foreground">Mountain Top</span>
            <span className="text-xs text-muted-foreground">Faculty portal</span>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          <div className="mb-1 px-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Faculty menu
          </div>
          {links.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                href={link.path}
                key={link.path}
                aria-current={isActive ? 'page' : undefined}
                className={`group flex items-center justify-between rounded-md px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
                  isActive
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'font-medium text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <span className="flex flex-1 items-center gap-3">
                  <span className={`flex items-center ${isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>
                    {link.icon}
                  </span>
                  {link.label}
                </span>
                {link.isLive ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" aria-hidden="true" />
                    Live
                  </span>
                ) : link.isReg && link.badge > 0 ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/10 px-2 py-0.5 text-xs font-medium text-warning">
                    <span className="h-2 w-2 rounded-full bg-warning animate-pulse" aria-hidden="true" />
                    Open
                  </span>
                ) : (
                  link.badge > 0 && (
                    <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium tabular-nums text-destructive-foreground">
                      {link.badge}
                    </span>
                  )
                )}
              </Link>
            );
          })}
        </nav>

        <div className="mt-4 flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
              {user?.avatar || 'L'}
            </div>
            <div className="flex min-w-0 flex-col">
              <strong className="truncate text-sm font-semibold leading-tight text-foreground">{user?.name}</strong>
              <span className="truncate text-xs text-muted-foreground">{user?.department}</span>
            </div>
          </div>
          <Link
            href="/login"
            onClick={logout}
            className="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
          >
            <span className="flex items-center">
              <LogOut size={18} />
            </span>
            Log out
          </Link>
        </div>
      </div>
    </aside>
  );
}
