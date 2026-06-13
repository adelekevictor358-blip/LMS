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
    <header className="flex items-center justify-end gap-2 pb-6">
      <div className="relative mr-auto w-full max-w-xs">
        <Search
          size={18}
          strokeWidth={1.5}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
        />
        <Input
          type="search"
          placeholder="Search resources"
          aria-label="Search resources"
          className="h-11 rounded-md border-border bg-muted/50 pl-10 text-sm"
        />
      </div>

      <div className="flex items-center gap-1">
        {mounted && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            className="text-muted-foreground hover:text-foreground"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}

        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
            className="text-muted-foreground hover:text-foreground"
            onClick={() => router.push('/dashboard/inbox')}
          >
            <Bell size={18} />
          </Button>
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[0.625rem] font-medium tabular-nums leading-none text-destructive-foreground">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="ml-2 border-l border-border pl-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-1 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                <Avatar className="h-9 w-9 border border-border">
                  <AvatarFallback>{user?.avatar || 'AU'}</AvatarFallback>
                </Avatar>
                <div className="hidden flex-col text-left sm:flex">
                  <span className="text-sm font-semibold leading-tight text-foreground">{user?.name}</span>
                  <span className="text-xs leading-tight text-muted-foreground">{user?.role}</span>
                </div>
                <ChevronDown size={16} className="text-muted-foreground" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard/settings')}>
                <User className="mr-2 h-4 w-4" /> Settings
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => { logout(); router.push('/login'); }}
              >
                <LogOut className="mr-2 h-4 w-4" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
