"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, BookOpen, Layers, ClipboardList, HelpCircle, Users, MessageSquare, Megaphone, LogOut, Settings, Film } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function LecturerSidebar() {
  const pathname = usePathname();
  const { user, logout, messages, liveSessions } = useStore();
  const unreadMessages = messages?.filter(m => m.to === user?.id && !m.read).length || 0;
  const isClassLive = liveSessions?.some(s => s.lecturerId === user?.id);

  const links = [
    { label: 'Dashboard', path: '/lecturer', icon: <LayoutDashboard size={18} /> },
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
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="logo mb-8 px-2 flex items-center gap-3">
          <div className="h-10 w-10 bg-white rounded-xl shadow-sm p-1 flex items-center justify-center overflow-hidden flex-shrink-0">
            <img src="/mtu-logo.png" alt="Mountain Top University" className="w-full h-full object-contain" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-wider leading-tight">Mountain Top</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none mt-0.5">Faculty Portal</span>
          </div>
        </div>

        <nav className="nav-menu">
          <div className="nav-section">Faculty Menu</div>
          {links.map((link) => (
            <Link
              href={link.path}
              key={link.path}
              className={`nav-link ${pathname === link.path ? 'active' : ''} ${link.isLive ? 'live-auditorium' : ''}`}
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
          <div className="lecturer-profile">
            <div className="avatar">{user?.avatar || 'L'}</div>
            <div className="profile-info">
              <strong>{user?.name}</strong>
              <span>{user?.department}</span>
            </div>
          </div>
          <Link href="/login" className="nav-link logout" onClick={logout}>
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
          background: var(--sidebar-bg);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border-right: 1px solid var(--card-border);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .sidebar-content {
          display: flex;
          flex-direction: column;
          height: 100%;
          padding: 1.5rem 1rem;
        }

        .logo {
          margin-bottom: 2rem;
          padding: 0 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
        }

        .logo-text {
          font-size: 0.78rem;
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
          color: var(--text-muted);
          margin-bottom: 0.75rem;
          padding: 0 0.75rem;
        }

        .sidebar .nav-menu {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .sidebar .nav-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.7rem 0.85rem;
          border-radius: 8px;
          color: var(--text-muted);
          font-weight: 500;
          font-size: 0.85rem;
          transition: all 0.2s;
          text-decoration: none;
        }

        .nav-badge {
          background: var(--danger);
          color: white;
          border-radius: 12px;
          padding: 0.1rem 0.4rem;
          font-size: 0.65rem;
          font-weight: 700;
        }

        .sidebar .nav-link:hover {
          background: var(--nav-active);
          color: var(--text-main);
        }

        .sidebar .nav-link.active {
          background: var(--nav-active);
          color: var(--primary);
          font-weight: 600;
          border-left: 3px solid var(--primary);
          border-radius: 0 8px 8px 0;
        }

        .sidebar .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.9;
        }

        .sidebar-footer {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding-top: 1rem;
          border-top: 1px solid var(--card-border);
        }

        .lecturer-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem;
        }

        .lecturer-profile .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: var(--primary);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          flex-shrink: 0;
        }

        .lecturer-profile .profile-info {
          display: flex;
          flex-direction: column;
        }

        .lecturer-profile .profile-info strong {
          font-size: 0.82rem;
          color: var(--text-main);
          line-height: 1.3;
        }

        .lecturer-profile .profile-info span {
          font-size: 0.72rem;
          color: var(--primary);
          font-weight: 500;
        }

        .sidebar .logout {
          color: var(--text-muted);
        }

        .sidebar .logout:hover {
          color: var(--danger);
          background: rgba(211, 47, 47, 0.05);
        }
      `}</style>
    </aside>
  );
}
