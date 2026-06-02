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
  const { user, courses, notifications, messages, liveSessions } = useStore();
  const enrolledCourseIds = user?.enrolledCourseIds?.length 
    ? user.enrolledCourseIds 
    : courses.filter(c => c.program === user?.program && c.level === user?.level).map(c => c.id);
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
    { label: 'Uni Home', path: '/dashboard/school', icon: <Building2 size={18} /> },
    { label: 'Settings', path: '/dashboard/settings', icon: <Settings size={18} /> },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="logo mb-8 px-2 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl shadow-sm p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/mtu-logo.png" alt="Mountain Top University" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">Mountain Top</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">University</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section">Student Menu</div>
          {links.map((link) => (
            <Link
              href={link.path}
              key={link.path}
              className={`nav-link ${pathname === link.path ? 'active' : ''} ${link.isLive ? 'live-link' : ''}`}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
                <span className="nav-icon">{link.icon}</span>
                {link.label}
              </div>
              {link.badge > 0 && (
                <span className={`nav-badge ${link.isLive ? 'bg-red-500 animate-pulse' : ''}`}>
                  {link.isLive ? 'LIVE' : link.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="theme-toggle-container">
             <button 
               className="theme-toggle-btn" 
               onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
               aria-label="Toggle Atmosphere"
             >
                {mounted && (theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />)}
                <span className="ml-2 font-bold uppercase text-[10px] tracking-widest">{mounted ? (theme === 'dark' ? 'Light Mode' : 'Dark Mode') : 'Atmosphere'}</span>
             </button>
          </div>
          <Link href="/login" className="nav-link logout">
            <span className="nav-icon"><LogOut size={18} /></span>
            Log Out
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .sidebar {
          width: 250px;
          position: sticky;
          top: 0;
          height: 100vh;
          background: transparent;
          transition: background-color 0.3s ease, border-color 0.3s ease;
          overflow-y: auto;
          flex-shrink: 0;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          min-height: 100%;
          padding: 1.5rem 1rem;
        }

        .logo {
          margin-bottom: 2rem;
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
        }

        .logo-text {
          font-size: 0.9rem;
          color: var(--text-main);
          letter-spacing: 1px;
        }

        .logo-icon {
          color: var(--primary);
          display: flex;
        }

        .sidebar .nav-section {
          font-size: 0.65rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.75rem;
          padding: 0 0.75rem;
        }

        .sidebar .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.2rem;
        }

        .sidebar .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 0.85rem;
          border-radius: 12px;
          color: #475569;
          font-weight: 600;
          font-size: 0.85rem;
          transition: all 0.2s;
          text-decoration: none;
        }

        [data-theme='dark'] .sidebar .nav-link {
          color: #94a3b8;
        }

        .nav-badge {
          background: #ef4444;
          color: white;
          border-radius: 12px;
          padding: 0.1rem 0.4rem;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .sidebar .nav-link:hover {
          background: rgba(108, 92, 231, 0.1);
          color: #6c5ce7;
        }

        .sidebar .nav-link.active {
          background: #6c5ce7;
          color: white;
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(108, 92, 231, 0.3);
        }

        .sidebar .nav-icon {
          display: flex;
          align-items: center;
           justify-content: center;
          opacity: 0.8;
        }

        .sidebar-footer {
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
          margin-top: 1rem;
        }

        .sidebar .logout {
          color: var(--text-muted);
        }

        .theme-toggle-container {
          padding: 0 0.5rem;
          margin-bottom: 0.5rem;
        }

        .theme-toggle-btn {
          width: 100%;
          display: flex;
          align-items: center;
          padding: 0.75rem;
          border-radius: 12px;
          background: rgba(var(--primary-rgb), 0.1);
          color: var(--primary);
          border: 1px solid transparent;
          cursor: pointer;
          transition: all 0.2s;
        }

        .theme-toggle-btn:hover {
          background: rgba(var(--primary-rgb), 0.15);
        }

        .sidebar .logout:hover {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.05);
        }
      `}</style>
    </aside>
  );
}
