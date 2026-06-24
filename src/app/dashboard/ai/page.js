"use client";

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Send, Video, Users, MessageSquare, History,
  FileText, FileVideo, FileImage, File as FileIcon, Play,
  ArrowRight, FolderOpen
} from 'lucide-react';
import { useStore } from '@/store/useStore';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// ─── helpers ───
function initials(name) {
  if (!name) return '?';
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function formatTime(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function formatDate(timestamp) {
  if (!timestamp) return '';
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function materialIcon(type) {
  switch ((type || '').toLowerCase()) {
    case 'video':
      return FileVideo;
    case 'image':
      return FileImage;
    case 'pdf':
    case 'doc':
    case 'document':
      return FileText;
    default:
      return FileIcon;
  }
}

export default function LiveClassDashboard() {
  const router = useRouter();
  const {
    user,
    liveSessions,
    sessionMessages,
    materials,
    callHistory,
    courses,
    getStudentCourseIds,
    sendSessionMessage,
  } = useStore();

  const [draft, setDraft] = useState('');

  // ─── active session: first session in one of the student's courses, else first session, else null ───
  const activeSession = useMemo(() => {
    const myCourseIds = getStudentCourseIds(user);
    return (
      liveSessions.find((s) => myCourseIds.includes(s.courseId)) ||
      liveSessions[0] ||
      null
    );
  }, [liveSessions, user, getStudentCourseIds]);

  const course = activeSession
    ? courses.find((c) => c.id === activeSession.courseId)
    : null;

  const participants = activeSession?.participants || [];

  // ─── chat: messages for the active session, ordered by timestamp ───
  const messages = useMemo(() => {
    if (!activeSession) return [];
    return sessionMessages
      .filter((m) => m.sessionId === activeSession.id)
      .slice()
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }, [sessionMessages, activeSession]);

  // ─── class materials for the active session's course ───
  const classMaterials = useMemo(() => {
    if (!activeSession) return [];
    return materials.filter((m) => m.courseId === activeSession.courseId);
  }, [materials, activeSession]);

  // ─── previous records, most-recent-first ───
  const previousRecords = useMemo(() => {
    return callHistory
      .slice()
      .sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
  }, [callHistory]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text || !activeSession) return;
    sendSessionMessage(activeSession.id, text);
    setDraft('');
  };

  const courseLabel = course
    ? `${course.code} · ${course.title}`
    : activeSession?.title || 'Live session';

  return (
    <div className="animate-fade-in flex h-full flex-col gap-6">
      <header>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Live class
        </h1>
      </header>

      <div className="grid min-h-[400px] grid-cols-1 gap-6 lg:grid-cols-[2.2fr_1fr]">
        {/* Session area */}
        <section className="flex flex-col gap-4">
          {activeSession ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-transparent bg-success/10 px-2.5 py-1 text-xs font-medium text-success">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Live
                  </span>
                  <h2 className="text-lg font-semibold text-foreground">
                    {course ? course.code : activeSession.title}
                  </h2>
                  {course && (
                    <>
                      <span aria-hidden className="text-border">|</span>
                      <span className="text-sm text-muted-foreground">{course.title}</span>
                    </>
                  )}
                  <span aria-hidden className="text-border">|</span>
                  <span className="text-sm text-muted-foreground">by</span>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px]">
                        {initials(activeSession.lecturerName)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-foreground">
                      {activeSession.lecturerName}
                    </span>
                  </div>
                </div>

                {participants.length > 0 && (
                  <div className="flex items-center">
                    {participants.slice(0, 4).map((p) => (
                      <Avatar
                        key={p.id}
                        className="-ml-2 h-8 w-8 border-2 border-card first:ml-0"
                      >
                        <AvatarFallback className="text-xs">
                          {initials(p.name)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {participants.length > 4 && (
                      <span className="-ml-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-medium tabular-nums text-secondary-foreground">
                        +{participants.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Branded session panel (no external images) */}
              <div className="relative flex h-[380px] w-full flex-col items-center justify-center overflow-hidden rounded-xl border border-border bg-navy text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-card/10 text-primary-foreground">
                  <Video size={26} strokeWidth={1.5} />
                </span>
                <p className="mt-4 font-serif text-3xl font-semibold tracking-tight text-primary-foreground">
                  {course ? course.code : activeSession.title}
                </p>
                <p className="mt-1 max-w-prose px-6 text-sm text-primary-foreground/70">
                  {courseLabel}
                </p>
                <div className="absolute inset-x-6 bottom-6 flex items-center justify-between rounded-md border border-border bg-card/95 px-4 py-2.5 shadow-sm">
                  <span className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={16} />
                    {participants.length} in session
                  </span>
                  <Button
                    size="sm"
                    onClick={() => router.push(`/dashboard/classroom/${activeSession.id}`)}
                  >
                    Join live class
                    <ArrowRight size={16} className="ml-1.5" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full min-h-[380px] flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-8 text-center shadow-sm">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Video size={24} strokeWidth={1.5} />
              </span>
              <p className="max-w-prose text-sm text-muted-foreground">
                No live class is in session right now.
              </p>
              <Button variant="outline" onClick={() => router.push('/dashboard/classroom')}>
                Go to live classes
              </Button>
            </div>
          )}
        </section>

        {/* Group chat */}
        <section className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Group chat</h3>

          <ScrollArea className="-mr-2 min-h-[200px] flex-1 pr-2">
            {messages.length > 0 ? (
              <div className="flex flex-col gap-5">
                {messages.map((m) => {
                  const mine = m.fromId === user?.id;
                  return (
                    <div
                      key={m.id}
                      className={`flex items-start gap-3 ${mine ? 'justify-end' : ''}`}
                    >
                      {!mine && (
                        <Avatar className="mt-1 h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {initials(m.fromName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={`flex max-w-[80%] flex-col gap-1 ${mine ? 'items-end' : ''}`}
                      >
                        <span className="px-1 text-xs text-muted-foreground">
                          <span className="font-medium text-foreground">{m.fromName}</span>
                          <span className="tabular-nums"> · {formatTime(m.timestamp)}</span>
                        </span>
                        <div
                          className={
                            mine
                              ? 'rounded-md rounded-tr-sm bg-primary px-3 py-2 text-sm leading-relaxed text-primary-foreground'
                              : 'rounded-md rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed text-foreground'
                          }
                        >
                          {m.content}
                        </div>
                      </div>
                      {mine && (
                        <Avatar className="mt-1 h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {initials(m.fromName)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <MessageSquare size={20} strokeWidth={1.5} />
                </span>
                <p className="max-w-prose text-sm text-muted-foreground">
                  {activeSession
                    ? 'No messages yet. Start the conversation.'
                    : 'Chat opens when a live class is in session.'}
                </p>
              </div>
            )}
          </ScrollArea>

          <form onSubmit={handleSend} className="mt-4">
            <div className="flex items-center gap-1 rounded-md border border-input bg-background p-1.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring">
              <Input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                disabled={!activeSession}
                placeholder={
                  activeSession ? 'Type a message…' : 'No active session'
                }
                aria-label="Message"
                className="h-8 flex-1 border-none bg-transparent px-2 shadow-none focus-visible:ring-0"
              />
              <Button
                type="submit"
                size="icon"
                className="h-8 w-8"
                disabled={!activeSession || !draft.trim()}
                aria-label="Send message"
              >
                <Send size={18} />
              </Button>
            </div>
          </form>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Class materials */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Class materials</h3>
          {classMaterials.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {classMaterials.map((material) => {
                const Icon = materialIcon(material.type);
                return (
                  <li
                    key={material.id}
                    className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                      <Icon size={16} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {material.title}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {material.type}
                      </p>
                    </div>
                    {material.size && (
                      <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        {material.size}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <FolderOpen size={20} strokeWidth={1.5} />
              </span>
              <p className="text-sm text-muted-foreground">No materials for this class yet.</p>
            </div>
          )}
        </section>

        {/* Participants */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Participants</h3>
          {participants.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {participants.map((p) => (
                <li
                  key={p.id}
                  className="flex items-center gap-3 rounded-md border border-transparent p-2 transition-colors hover:border-border hover:bg-accent"
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs">{initials(p.name)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{p.name}</p>
                    {p.role && (
                      <p className="text-xs text-muted-foreground">{p.role}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Users size={20} strokeWidth={1.5} />
              </span>
              <p className="text-sm text-muted-foreground">
                {activeSession
                  ? 'No one has joined this session yet.'
                  : 'Participants appear when a class is live.'}
              </p>
            </div>
          )}
        </section>

        {/* Previous class records */}
        <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Previous class records</h3>
          {previousRecords.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {previousRecords.map((record, i) => (
                <li key={`${record.id || record.title}-${i}`} className="flex items-center gap-3">
                  <div className="relative flex h-[60px] w-[90px] shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-navy">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-card/90 text-foreground">
                      <Play size={12} fill="currentColor" />
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">{record.title}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs tabular-nums text-muted-foreground">
                      <span>{formatDate(record.endTime)}</span>
                      {record.duration && (
                        <>
                          <span aria-hidden className="text-border">·</span>
                          <span>{record.duration}</span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <History size={20} strokeWidth={1.5} />
              </span>
              <p className="text-sm text-muted-foreground">No past recordings yet.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
