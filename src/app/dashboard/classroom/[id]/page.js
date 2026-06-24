"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Video, MessageSquare, Send, ArrowRight, Signal, X,
  Loader2, Link2, Lock, PhoneOff, CalendarClock
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

const JITSI_DOMAIN = 'meet.jit.si';
const JITSI_SCRIPT_SRC = 'https://meet.jit.si/external_api.js';

// Build a Jitsi-safe room slug from the session id.
// Prefixed with the literal text MTU- and the id stripped of unsafe characters.
function toRoomName(sessionId) {
  const safe = String(sessionId ?? '').replace(/[^a-zA-Z0-9]/g, '');
  return `MTU-${safe}`;
}

// SSR-safe loader for the Jitsi external API script. Resolves once
// window.JitsiMeetExternalAPI is available; reuses an in-flight load.
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

export default function CinematicNeuralClassroom() {
  const { id } = useParams();
  const router = useRouter();
  const {
    user, liveSessions, endLiveSession, sendSessionMessage,
    sessionMessages, joinLiveSession, getSessionStatus,
    recordAttendanceJoin, recordAttendanceLeave
  } = useStore();

  // Call States
  const [hasJoined, setHasJoined] = useState(false);
  const [rightPanel, setRightPanel] = useState('none');
  const [chatInput, setChatInput] = useState('');
  const [showLinkTooltip, setShowLinkTooltip] = useState(false);
  const [liveClock, setLiveClock] = useState('');
  const [embedError, setEmbedError] = useState(false);
  const [endedInCall, setEndedInCall] = useState(false);

  const jitsiContainerRef = useRef(null);
  const apiRef = useRef(null);
  const attendanceJoinedRef = useRef(false);
  const chatEndRef = useRef(null);

  const session = liveSessions.find(s => s.id === id);
  // Keep a stable record of the live session so that when a lecturer ends it
  // (which removes it from liveSessions) we still show the "ended" screen
  // rather than a "not found" screen for an in-call participant.
  const sessionRef = useRef(null);
  if (session) sessionRef.current = session;
  const localSession = session || sessionRef.current;
  // Invite-link / guest join (cross-device): render the real Jitsi room by id even
  // when this browser's per-machine store lacks the session.
  const isGuestJoin = !localSession && !!id;
  const activeSession = localSession || (isGuestJoin ? { id, title: 'Live class', participants: [], isGuest: true } : null);

  const currentSessionMessages = sessionMessages.filter(m => m.sessionId === id);
  const participantsList = activeSession?.participants || [];

  const status = localSession ? getSessionStatus(localSession) : (isGuestJoin ? 'live' : 'ended');
  const isEnded = !activeSession || status === 'ended' || endedInCall;

  // ─── Live clock ───
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // ─── Attendance leave on unmount (covers tab close / navigation) ───
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

  // ─── Hard end-lock watcher: if endAt passes while in-call, disconnect ───
  useEffect(() => {
    if (!hasJoined || !activeSession?.endAt) return;
    const checkEnd = () => {
      if (Date.now() > Date.parse(activeSession.endAt)) {
        teardownCall();
        setEndedInCall(true);
      }
    };
    checkEnd();
    const t = setInterval(checkEnd, 5000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasJoined, activeSession?.endAt]);

  // ─── Dispose the embed when the session is removed/ended remotely ───
  useEffect(() => {
    if (hasJoined && isEnded) {
      teardownCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEnded, hasJoined]);

  // ─── Instantiate the real Jitsi meeting once joined ───
  useEffect(() => {
    if (!hasJoined || isEnded || !user) return;
    let disposed = false;

    loadJitsiScript()
      .then((JitsiMeetExternalAPI) => {
        if (disposed || !jitsiContainerRef.current) return;
        if (apiRef.current) return;

        const api = new JitsiMeetExternalAPI(JITSI_DOMAIN, {
          roomName: toRoomName(id),
          parentNode: jitsiContainerRef.current,
          width: '100%',
          height: '100%',
          userInfo: { displayName: user.name },
          configOverwrite: {
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            startWithAudioMuted: activeSession?.settings?.muteOnEntry ?? true,
            startWithVideoMuted: false,
          },
          interfaceConfigOverwrite: {
            SHOW_JITSI_WATERMARK: false,
            SHOW_WATERMARK_FOR_GUESTS: false,
            DEFAULT_BACKGROUND: '#09090b',
          },
        });

        apiRef.current = api;

        // When the user hangs up inside the Jitsi UI, treat it as leaving.
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
  }, [hasJoined, isEnded, user]);

  // Chat autoscroll
  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionMessages, rightPanel]);

  // Dispose the embed and record the leave.
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

  const handleJoinAttempt = () => {
    if (isEnded) return;
    joinLiveSession(id, user.id, user.name);
    recordAttendanceJoin(id, { userId: user.id, name: user.name, role: user.role });
    attendanceJoinedRef.current = true;
    setHasJoined(true);
  };

  const copyLink = () => {
    if (typeof window === 'undefined') return;
    navigator.clipboard.writeText(`${window.location.origin}/classroom/${id}`);
    setShowLinkTooltip(true);
    setTimeout(() => setShowLinkTooltip(false), 2500);
  };

  const handleLeave = () => {
    teardownCall();
    if (user?.role === 'lecturer') {
      if (confirm('End session for all participants?')) {
        endLiveSession(id);
        router.push('/lecturer');
      } else {
        router.push('/lecturer');
      }
    } else {
      router.push('/dashboard');
    }
  };

  // ─── Loading (session not yet resolved) ───
  if (!activeSession) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <Loader2 size={32} className="text-zinc-400 animate-spin mb-4" strokeWidth={1.5} />
        <p className="text-sm text-zinc-400">Reconnecting to session…</p>
      </div>
    );
  }

  // ─── Hard end-lock: ended before joining, or disconnected mid-call ───
  if (isEnded) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
          {endedInCall ? <PhoneOff size={24} className="text-zinc-400" strokeWidth={1.5} /> : <Lock size={24} className="text-zinc-400" strokeWidth={1.5} />}
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-50 mb-2 text-balance">
          {endedInCall ? 'This session has ended' : 'This virtual class is closed'}
        </h1>
        <p className="text-sm leading-relaxed text-zinc-400 max-w-sm text-pretty">
          {endedInCall
            ? 'This session has ended. You have been disconnected.'
            : 'This virtual class is closed. You can no longer join this session.'}
        </p>
        <Button className="mt-6" onClick={() => router.push(user?.role === 'lecturer' ? '/lecturer' : '/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  // ─── Upcoming (scheduled but not yet started) ───
  if (status === 'upcoming') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100 p-8 text-center">
        <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
          <CalendarClock size={24} className="text-zinc-400" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-zinc-50 mb-2 text-balance">Not started yet</h1>
        <p className="text-sm leading-relaxed text-zinc-400 max-w-sm text-pretty">
          {activeSession.title} hasn&apos;t started. It opens at{' '}
          {new Date(activeSession.startAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}.
        </p>
        <Button className="mt-6" onClick={() => router.push(user?.role === 'lecturer' ? '/lecturer' : '/dashboard')}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  // ─── Pre-join screen ───
  if (!hasJoined) {
    return (
      <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-8 font-sans overflow-hidden">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Preview placeholder */}
          <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
              <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 mb-5">
                <Video size={24} className="text-zinc-400" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-zinc-100 mb-2">Camera and microphone</h2>
              <p className="text-sm leading-relaxed text-zinc-400 max-w-xs text-pretty">
                You&apos;ll set up your camera and microphone after joining the live room.
              </p>
            </div>
          </div>

          {/* Session details */}
          <div className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Live session</span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
                  <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                  Live
                </span>
              </div>
              <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-zinc-50 text-balance">
                Ready to join?
              </h1>
              <p className="text-sm leading-relaxed text-zinc-400">{activeSession.title}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="group" onClick={handleJoinAttempt}>
                Join session
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                variant="ghost"
                className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={() => router.push(user?.role === 'lecturer' ? '/lecturer' : '/dashboard')}
              >
                Cancel
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Participants</span>
                <span className="text-sm font-semibold text-zinc-100 tabular-nums">{participantsList.length + 1}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Ends</span>
                <span className="text-sm font-semibold text-zinc-100 tabular-nums">
                  {activeSession.endAt ? new Date(activeSession.endAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Encryption</span>
                <span className="text-sm font-semibold text-zinc-100">E2EE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── In-session interface (real Jitsi embed) ───
  return (
    <div className="h-screen w-full bg-zinc-950 flex overflow-hidden font-sans text-zinc-100">
      <main className="flex-1 flex flex-col relative">

        {/* Session header */}
        <header className="absolute top-0 left-0 right-0 z-50 p-5 flex justify-between items-start gap-4 pointer-events-none">
          <div className="flex flex-col gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <Badge className="bg-success/15 text-success border-transparent rounded-full font-medium gap-1.5">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                Live
              </Badge>
              {activeSession.recording && (
                <Badge className="bg-destructive/15 text-destructive border-transparent rounded-full font-medium gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Recording
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-lg font-semibold tracking-tight text-zinc-50">{activeSession.title}</h1>
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <span className="font-medium">{id}</span>
              <Separator orientation="vertical" className="h-3 bg-zinc-700" />
              <span className="flex items-center gap-1.5">
                <Signal size={14} className="text-success" />
                Connection stable
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100 ${rightPanel === 'chat' ? 'border-primary/60 text-primary' : ''}`}
              onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')}
              title="Chat"
            >
              <MessageSquare size={18} />
            </Button>
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={copyLink}
                title="Copy invite link"
              >
                <Link2 size={18} />
              </Button>
              {showLinkTooltip && (
                <Badge className="absolute top-12 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-100 border-transparent text-xs font-medium animate-fade-in whitespace-nowrap">Link copied</Badge>
              )}
            </div>
            <Button variant="destructive" className="h-10 font-medium" onClick={handleLeave}>
              <PhoneOff size={16} className="mr-2" />
              Leave
            </Button>
          </div>
        </header>

        {/* Real Jitsi stage — immersive dark frame around the live embed */}
        <div className="flex-1 overflow-hidden p-4 pt-24 pb-6 flex items-center justify-center relative">
          <div className="w-full h-full relative rounded-xl overflow-hidden border border-zinc-800 bg-black">
            {embedError ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                <div className="h-14 w-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-5">
                  <Video size={24} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">Couldn&apos;t load the live room</h2>
                <p className="text-sm leading-relaxed text-zinc-400 max-w-sm text-pretty">
                  The meeting service could not be reached. Check your connection and try again.
                </p>
                <Button className="mt-6" onClick={() => { setEmbedError(false); setHasJoined(false); }}>
                  Retry
                </Button>
              </div>
            ) : (
              <>
                <div ref={jitsiContainerRef} className="absolute inset-0 h-full w-full" />
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center" aria-hidden={apiRef.current ? 'true' : 'false'}>
                  {!apiRef.current && (
                    <div className="flex flex-col items-center">
                      <Loader2 size={28} className="text-zinc-500 animate-spin mb-3" strokeWidth={1.5} />
                      <p className="text-sm text-zinc-500">Connecting you to the live room…</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Status bar */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 h-11 bg-zinc-900/90 border border-zinc-800 px-4 flex items-center gap-3 z-[100] rounded-xl shadow-lg">
          <span className="text-xs font-medium text-zinc-400 tabular-nums">{liveClock}</span>
          <Separator orientation="vertical" className="h-4 bg-zinc-800" />
          <span className="text-xs text-zinc-400">
            {participantsList.length + 1} in room
          </span>
        </div>
      </main>

      {/* Chat side panel */}
      {rightPanel === 'chat' && (
        <aside className="w-[380px] bg-zinc-900 border-l border-zinc-800 flex flex-col animate-fade-in z-[200]">
          <header className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold tracking-tight text-zinc-50">Chat</h2>
              <p className="text-xs text-zinc-500 mt-1">
                Session <span className="text-zinc-300">{id}</span>
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 rounded-md"
              onClick={() => setRightPanel('none')}
              title="Close"
            >
              <X size={18} />
            </Button>
          </header>

          <ScrollArea className="flex-1 p-5">
            {currentSessionMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16">
                <MessageSquare size={28} className="text-zinc-600 mb-3" strokeWidth={1.5} />
                <p className="text-sm text-zinc-500">No messages yet. Start the conversation.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {currentSessionMessages.map((m, i) => (
                  <div key={i} className="flex flex-col gap-1.5 animate-fade-in">
                    <div className="flex justify-between items-baseline gap-3">
                      <span className={`text-xs font-medium ${m.fromId === user?.id ? 'text-primary' : 'text-zinc-300'}`}>{m.fromName}</span>
                      <span className="text-xs text-zinc-600 tabular-nums">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className={`p-3 rounded-md border ${m.fromId === user?.id ? 'bg-primary/10 border-primary/20 text-zinc-100' : 'bg-zinc-800/60 border-zinc-800 text-zinc-200'}`}>
                      <p className="text-sm leading-relaxed text-pretty">{m.content}</p>
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
            )}
          </ScrollArea>
          <div className="p-5 border-t border-zinc-800">
            <form onSubmit={(e) => { e.preventDefault(); if (chatInput.trim()) { sendSessionMessage(id, chatInput.trim()); setChatInput(''); } }} className="relative">
              <Input
                className="h-11 rounded-md bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 pr-12"
                placeholder="Type a message…"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <Button type="submit" size="icon" className="absolute right-1.5 top-1.5 h-8 w-8 rounded-md">
                <Send size={16} />
              </Button>
            </form>
          </div>
        </aside>
      )}
    </div>
  );
}
