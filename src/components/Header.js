"use client";

import { useStore } from '@/store/useStore';
import { useTheme } from 'next-themes';
import { Search, Bell, Sun, Moon, LogOut, User, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, 
  DropdownMenuSeparator, DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { user, notifications, logout } = useStore();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="header">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <Input 
          type="search" 
          placeholder="Search resources..." 
          className="search-input" 
        />
      </div>

      <div className="header-actions">
        {mounted && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="action-btn"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </Button>
        )}

        <div className="notification-container">
          <Button variant="ghost" size="icon" className="action-btn" onClick={() => router.push('/dashboard/inbox')}>
            <Bell size={20} />
          </Button>
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>

        <div className="user-profile">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="profile-trigger">
                <Avatar className="profile-avatar">
                  <AvatarFallback>{user?.avatar || 'AU'}</AvatarFallback>
                </Avatar>
                <div className="profile-info">
                  <span className="profile-name">{user?.name}</span>
                  <span className="profile-role">{user?.role}</span>
                </div>
                <ChevronDown size={14} className="chevron" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="profile-dropdown">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <User className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem className="logout-item" onClick={() => { logout(); router.push('/login'); }}>
                <LogOut className="mr-2 h-4 w-4" /> Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: 0 0 1.5rem 0;
          background: transparent;
        }

        .search-container {
          position: relative;
          width: 100%;
          max-width: 300px;
          margin-right: auto;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--text-muted);
          pointer-events: none;
        }

        .search-input {
          padding-left: 40px;
          height: 44px;
          background: rgba(0,0,0,0.03);
          border: 1px solid var(--card-border);
          border-radius: 12px;
          font-size: 0.9rem;
        }
        [data-theme='dark'] .search-input { background: rgba(255,255,255,0.05); }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .action-btn {
          color: var(--text-muted);
          transition: color 0.2s;
        }
        .action-btn:hover { color: var(--primary); }

        .notification-container {
          position: relative;
        }

        .notification-badge {
          position: absolute;
          top: 5px;
          right: 5px;
          background: #ef4444;
          color: white;
          font-size: 0.65rem;
          font-weight: 700;
          min-width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          border: 2px solid var(--sidebar-bg);
        }

        .user-profile {
          padding-left: 1rem;
          border-left: 1px solid var(--card-border);
          margin-left: 0.5rem;
        }

        .profile-trigger {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          transition: background 0.2s;
        }
        .profile-trigger:hover { background: rgba(0,0,0,0.03); }
        [data-theme='dark'] .profile-trigger:hover { background: rgba(255,255,255,0.05); }

        .profile-avatar {
          width: 36px;
          height: 36px;
          border: 2px solid var(--primary);
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-main);
          line-height: 1.2;
        }

        .profile-role {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--primary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .chevron {
          color: var(--text-muted);
        }

        .logout-item {
          color: #ef4444;
        }
      `}</style>
    </header>
  );
}
