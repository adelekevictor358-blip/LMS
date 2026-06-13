"use client";

import { useStore } from '@/store/useStore';
import { Mail, CheckCircle2, ShieldAlert, Clock, Inbox as InboxIcon } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function Inbox() {
  const { notifications, markNotificationRead } = useStore();
  const [selectedMsg, setSelectedMsg] = useState(notifications[0] || null);

  const handleSelect = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) markNotificationRead(msg.id);
  };

  return (
    <div className="flex h-full flex-col animate-fade-in">
      <header className="mb-6">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
          <InboxIcon size={26} strokeWidth={1.75} className="text-muted-foreground" />
          University communications
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground text-pretty">
          Official announcements, academic alerts, and scheduled broadcasts.
        </p>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <nav className="w-[340px] shrink-0 overflow-y-auto border-r border-border bg-muted/30">
          {notifications.map(msg => {
            const isActive = selectedMsg?.id === msg.id;
            return (
              <button
                key={msg.id}
                type="button"
                onClick={() => handleSelect(msg)}
                aria-current={isActive ? 'true' : undefined}
                className={`group relative flex w-full items-start gap-3 border-b border-border px-4 py-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset ${
                  isActive
                    ? 'bg-accent border-l-2 border-l-primary'
                    : 'border-l-2 border-l-transparent hover:bg-accent/60'
                }`}
              >
                <span className={`mt-0.5 shrink-0 ${msg.isUrgent ? 'text-destructive' : !msg.read ? 'text-primary' : 'text-muted-foreground'}`}>
                  {msg.isUrgent ? <ShieldAlert size={16} /> : <Mail size={16} />}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="mb-1 flex items-start justify-between gap-2">
                    <span className={`truncate text-sm ${!msg.read ? 'font-semibold text-foreground' : 'font-medium text-foreground'}`}>
                      {msg.isUrgent ? 'Urgent notification' : 'Official notice'}
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground tabular-nums">{msg.time}</span>
                  </span>
                  <span className={`block truncate text-sm leading-relaxed ${!msg.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {msg.text.substring(0, 40)}{msg.text.length > 40 ? '...' : ''}
                  </span>
                </span>

                {!msg.read && (
                  <span className="absolute right-3.5 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-primary" aria-label="Unread" />
                )}
              </button>
            );
          })}

          {notifications.length === 0 && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <CheckCircle2 size={32} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You&apos;re all caught up.</p>
            </div>
          )}
        </nav>

        <section className="flex flex-1 flex-col bg-card">
          {selectedMsg ? (
            <article className="h-full overflow-y-auto p-8">
              <header className="mb-6 border-b border-border pb-5">
                <div className="mb-3 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {selectedMsg.isUrgent ? 'Urgent notification' : 'Official notice'}
                  </h2>
                  {selectedMsg.isUrgent && (
                    <Badge className="border-transparent bg-destructive/10 text-destructive">Urgent</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Clock size={14} /> Received {selectedMsg.time}
                  </span>
                  <span className="font-medium text-foreground">From IT administration</span>
                </div>
              </header>
              <div className="max-w-prose whitespace-pre-wrap text-sm leading-relaxed text-foreground text-pretty">
                {selectedMsg.text}
              </div>
            </article>
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
              <Mail size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Select a message to read.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
