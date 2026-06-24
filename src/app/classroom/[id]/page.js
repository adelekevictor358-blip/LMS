"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Video, PhoneOff, MessageSquare, Send, X, Shield, Lock,
  Loader2, CalendarClock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const JITSI_DOMAIN = 'meet.jit.si';
const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js';

// Build a Jitsi-safe room slug from the session id: literal MTU- prefix
// plus the id stripped of every unsafe (non-alphanumeric) character.
function toRoomName(sessionId) {
  const safe = String(sessionId ?? '').replace(/[^a-zA-Z0-9]/g, '');
  return `MTU-${safe}`;
}

// SSR-safe loader for the Jitsi external API script.
function loadJitsiScript() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'));
  if (window.JitsiMeetExternalAPI) return Promise.resolve(window.JitsiMeetExternalAPI);
  if (window.__jitsiLoaderPromise) return window.__jitsiLoaderPromise;

  window.__jitsiLoaderPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${JITSI_SCRIPT_SRC}"]`);
    const onReady = () => {
      if (window.JitsiMeetExternalAPI) resolve(window.JitsiMeetExternalAPI);
      else reject(new Error('Jitsi API unavailable'));
    };
    if (existing) {
      existing.addEventListener('load', onReady);
      existing.addEventListener('error', reject);
      if (window.JitsiMeetExternalAPI) onReady();
      return;
    }
    const script = document.createElement('script');
    script.src = JITSI_SCRIPT_SRC;
    script.async = true;
    script.onload = onReady;
    script.onerror = reject;
    document.body.appendChild(script);
  });
  return window.__jitsiLoaderPromise;
}

export default function VirtualClassroom() {
  const router = useRouter();
  const { id } = useParams();
  const {
    user, liveSessions, endLiveSession, getSessionStatus,
    recordAttendanceJoin, recordAttendanceLeave,
    sendSessionMessage, sessionMessages
  } = useStore();

  const session = liveSessions.find(s => s.id === id);
  // Preserve the session locally so an in-call participant sees an "ended"
  // screen (not "not found") once a lecturer ends and removes it.
  const sessionRef = useRef(null);
  if (session) sessionRef.current = session;
  const localSession = session || sessionRef.current;
  // Invite-link / guest join: if THIS browser's local store doesn't have the
  // session (data is per-machine) but we have a room id, still let the user into
  // the real Jitsi room so live classes work across different systems/devices.
  const isGuestJoin = !localSession && !!id;
  const currentSession = localSession || (isGuestJoin ? { id, title: 'Live class', participants: [], isGuest: true } : null);

  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [liveClock, setLiveClock] = useState('');
  const [embedError, setEmbedError] = useState(false);
  const [endedInCall, setEndedInCall] = useState(false);

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const attendanceJoinedRef = useRef(false);
  const chatEndRef = useRef(null);

  const currentSessionMessages = sessionMessages.filter(m => m.sessionId === id);

  const status = localSession ? getSessionStatus(localSession) : (isGuestJoin ? 'live' : 'ended');
  const isEnded = (!currentSession && user?.role !== 'admin') || status === 'ended' || endedInCall;
  const canEmbed = !!currentSession && status === 'live' && !endedInCall;

  // ─── Live clock ───
  useEffect(() => {
    const tick = () => setLiveClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // ─── Record attendance leave + dispose on unmount ───
  useEffect(() => {
    return () => {
      if (attendanceJoinedRef.current && user?.id) {
        recordAttendanceLeave(id, user.id);
        attendanceJoinedRef.current = false;
      }
      if (apiRef.current) {
        try { apiRef.current.dispose(); } catch { /* noop */ }
        apiRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Hard end-lock watcher: disconnect when endAt passes mid-call ───
  useEffect(() => {
    if (!canEmbed || !currentSession?.endAt) return;
    const checkEnd = () => {
      if (Date.now() > Date.parse(currentSession.endAt)) {
        teardownCall();
        setEndedInCall(true);
      }
    };
    checkEnd();
    const t = setInterval(checkEnd, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEmbed, currentSession?.endAt]);

  // ─── Instantiate the real Jitsi meeting ───
  useEffect(() => {
    if (!canEmbed || !user) return;
    let disposed = false;

    loadJitsiScript()
      .then((JitsiMeetExternalAPI) => {
        if (disposed || !jitsiContainerRef.current || apiRef.current) return;

        // Mark attendance only once we actually enter the live room.
        if (!attendanceJoinedRef.current) {
          recordAttendanceJoin(id, { userId: user.id, name: user.name, role: user.role });
          attendanceJoinedRef.current = true;
        }

        const api = new JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: toRoomName(id),
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user.name },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: currentSession?.settings?.muteOnEntry ?? true,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#09090b',
          },
        });

        apiRef.current = api;
        api.addEventListener('readyToClose', () => {
          handleLeave();
        });
      })
      .catch(() => {
        if (!disposed) setEmbedError(true);
      });

    return () => {
      disposed = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEmbed, user]);

  // ─── Dispose when the session ends remotely ───
  useEffect(() => {
    if (isEnded) teardownCall();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded]);

  // Chat autoscroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionMessages, showChat]);

  const teardownCall = () => {
    if (apiRef.current) {
      try { apiRef.current.dispose(); } catch { /* noop */ }
      apiRef.current = null;
    }
    if (attendanceJoinedRef.current && user?.id) {
      recordAttendanceLeave(id, user.id);
      attendanceJoinedRef.current = false;
    }
  };

  const handleLeave = () => {
    teardownCall();
    if (user?.role === 'lecturer') {
      if (confirm("Ending the session will disconnect all students. Continue?")) {
        endLiveSession(id);
        router.push('/lecturer');
      } else {
        router.push('/lecturer');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    sendSessionMessage(id, message.trim());
    setMessage('');
  };

  // ─── Session not found ───
  if (!currentSession && user?.role !== 'admin') {
    return (
      <div className="dark fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
          <Video size={22} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance">Session not found</h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            This live class might have ended, or the link is no longer valid.
          </p>
        </div>
        <Button onClick={() => router.push('/')}>Return home</Button>
      </div>
    );
  }

  // ─── Hard end-lock screen ───
  if (isEnded) {
    return (
      <div className="dark fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
          {endedInCall
            ? <PhoneOff size={22} strokeWidth={1.5} className="text-muted-foreground" />
            : <Lock size={22} strokeWidth={1.5} className="text-muted-foreground" />}
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance">
            {endedInCall ? 'This session has ended' : 'This virtual class is closed'}
          </h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            {endedInCall
              ? 'This session has ended. You have been disconnected.'
              : 'This virtual class is closed. You can no longer join this session.'}
          </p>
        </div>
        <Button onClick={() => router.push(user?.role === 'lecturer' ? '/lecturer' : '/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  // ─── Upcoming screen ───
  if (status === 'upcoming') {
    return (
      <div className="dark fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 bg-background px-6 text-center text-foreground">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-card">
          <CalendarClock size={22} strokeWidth={1.5} className="text-muted-foreground" />
        </div>
        <div className="space-y-1.5">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-balance">Not started yet</h2>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            {currentSession.title} opens at{' '}
            {new Date(currentSession.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.
          </p>
        </div>
        <Button onClick={() => router.push(user?.role === 'lecturer' ? '/lecturer' : '/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="dark fixed inset-0 z-[9999] flex flex-col bg-background text-foreground animate-fade-in">
      {/* Top bar */}
      <header className="flex h-[70px] items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-foreground">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Live
          </span>
          <span className="h-7 w-px bg-border" />
          <div>
            <h3 className="font-sans text-sm font-semibold tracking-tight text-foreground">
              {currentSession?.title || "Virtual lecture session"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {currentSession?.lecturerName}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {currentSession?.recording && (
            <span className="mr-3 inline-flex items-center gap-2 text-xs font-medium tabular-nums text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
              Recording
            </span>
          )}
          <span className="mr-1 text-xs font-medium tabular-nums text-muted-foreground">{liveClock}</span>
          <Button variant="ghost" size="icon" aria-label="Security">
            <Shield size={18} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowChat(s => !s)} aria-label="Toggle chat">
            <MessageSquare size={18} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Real Jitsi embed in an immersive dark frame */}
        <div className="relative flex-1 overflow-hidden rounded-xl border border-border bg-card">
          {embedError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background">
                <Video size={22} strokeWidth={1.5} className="text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-sans text-lg font-semibold tracking-tight">Couldn&apos;t load the live room</h2>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
                  The meeting service could not be reached. Check your connection and try again.
                </p>
              </div>
              <Button onClick={() => { setEmbedError(false); if (typeof window !== 'undefined') window.location.reload(); }}>
                Retry
              </Button>
            </div>
          ) : (
            <>
              <div ref={jitsiContainerRef} className="absolute inset-0 h-full w-full" />
              {!apiRef.current && (
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-background">
                  <Loader2 size={26} className="animate-spin text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">Connecting you to the live room…</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Chat sidebar */}
        {showChat && (
          <aside className="flex w-[350px] flex-col overflow-hidden rounded-xl border border-border bg-card">
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-sans text-sm font-semibold text-foreground">In-call messages</h3>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowChat(false)} aria-label="Close chat">
                <X size={18} />
              </Button>
            </header>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
              {currentSessionMessages.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
                  <MessageSquare size={26} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">No messages yet. Start the conversation.</p>
                </div>
              ) : (
                currentSessionMessages.map((m, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <span className={`text-xs font-semibold ${m.fromId === user?.id ? 'text-primary' : 'text-foreground'}`}>{m.fromName}</span>
                      <span className="text-xs tabular-nums text-muted-foreground">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="rounded-md rounded-tl-none bg-muted px-3 py-2 text-sm leading-relaxed text-muted-foreground">{m.content}</p>
                  </div>
                ))
              )}
              <div ref={chatEndRef} />
            </div>
            <form className="flex gap-2 border-t border-border p-3" onSubmit={handleSend}>
              <Input
                type="text"
                placeholder="Send a message to everyone"
                value={message}
                onChange={e => setMessage(e.target.value)}
                className="h-10"
              />
              <Button type="submit" size="icon" className="h-10 w-10 shrink-0" aria-label="Send message">
                <Send size={16} />
              </Button>
            </form>
          </aside>
        )}
      </div>

      {/* Control bar */}
      <footer className="flex h-[88px] items-center justify-between border-t border-border px-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium tabular-nums text-muted-foreground">{liveClock}</span>
          <span className="h-7 w-px bg-border" />
          <span className="text-xs text-muted-foreground">
            Live controls (mute, camera, share) are in the meeting toolbar.
          </span>
        </div>

        <Button variant="destructive" className="h-11 px-6 font-medium" onClick={handleLeave}>
          <PhoneOff size={18} className="mr-2" />
          {user?.role === 'lecturer' ? 'End session' : 'Leave'}
        </Button>
      </footer>
    </div>
  );
}
