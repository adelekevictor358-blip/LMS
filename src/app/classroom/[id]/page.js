"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare,
  MessageSquare, Users, Settings, Hand, Smile, Send, X,
  Maximize2, Volume2, Shield, MoreVertical
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function VirtualClassroom() {
  const router = useRouter();
  const { id } = useParams();
  const { user, liveSessions, endLiveSession } = useStore();
  const currentSession = liveSessions.find(s => s.id === id);

  const [isMuted, setIsMuted] = useState(false);
  const [isCamOff, setIsCamOff] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [message, setMessage] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const videoRef = useRef(null);

  const [liveClock, setLiveClock] = useState('');

  const [chatLog, setChatLog] = useState([
    { user: 'System', text: 'Connection secure. Recording enabled.' },
    { user: 'Prof. Marcus Chen', text: 'Welcome everyone! Please mute your mics as you join.' }
  ]);

  useEffect(() => {
    // Capture stream in a local variable so the cleanup closure
    // always has the real reference (avoids stale-state bug).
    let activeStream = null;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        activeStream = stream;
        setLocalStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    }
    startCamera();

    return () => {
      // Use the local variable — localStream state would always be null here
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop());
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tick = () => setLiveClock(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  const toggleMic = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOff(!videoTrack.enabled);
      }
    }
  };

  const handleLeave = () => {
    if (user?.role === 'lecturer') {
      if (confirm("Ending the session will disconnect all students. Continue?")) {
        endLiveSession(id);
        router.push('/lecturer');
      }
    } else {
      router.push('/dashboard');
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setChatLog([...chatLog, { user: user?.name, text: message }]);
    setMessage('');
  };

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
              {currentSession?.lecturerName} · PHY104 Fundamentals
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="mr-3 inline-flex items-center gap-2 text-xs font-medium tabular-nums text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            Rec 01:24:05
          </span>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings size={18} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Security">
            <Shield size={18} />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 gap-4 overflow-hidden p-4">
        {/* Video grid */}
        <div className="grid flex-1 gap-4 [grid-template-columns:1fr_200px]">
          {/* Main speaker (lecturer) */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-xl border-2 border-primary bg-card">
            <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/80 px-2.5 py-1 text-xs font-medium text-foreground">
              {user?.role === 'lecturer' ? `${user?.title} ${user?.name} (Host)` : (currentSession?.lecturerName || "Lecturer")}
            </div>

            {(user?.role === 'lecturer' && !isCamOff) ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted={true}
                className="h-full w-full -scale-x-100 object-cover"
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-6 bg-muted">
                <div className="flex h-28 w-28 items-center justify-center rounded-full bg-primary text-4xl font-semibold text-primary-foreground">
                  {(user?.role === 'lecturer' ? user.avatar : (currentSession?.lecturerName?.charAt(0) || 'L'))}
                </div>
                <p className="text-sm text-muted-foreground">{isCamOff ? 'Camera is off' : 'Host is presenting'}</p>
              </div>
            )}

            <div className="absolute right-3 top-3 z-10">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-background/80 text-foreground">
                {isMuted ? <MicOff size={14} /> : <Mic size={14} />}
              </span>
            </div>
          </div>

          {/* Participants column */}
          <div className="flex flex-col gap-3 overflow-y-auto">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="relative h-[140px] overflow-hidden rounded-xl border border-border bg-card">
                <div className="flex h-full items-center justify-center bg-muted">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">S{i}</span>
                </div>
                <div className="absolute bottom-2 left-2 text-xs text-muted-foreground">Student {i}</div>
              </div>
            ))}
            <div className="relative h-[140px] overflow-hidden rounded-xl border-2 border-primary bg-card">
              <div className="flex h-full items-center justify-center bg-muted">
                {isCamOff ? (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">{user?.avatar}</span>
                ) : (
                  user?.role === 'student' ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted={true}
                      className="h-full w-full rounded-xl object-cover"
                    />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-xs font-medium text-secondary-foreground">You</span>
                  )
                )}
              </div>
              <div className="absolute bottom-2 left-2 flex items-center gap-1 text-xs text-muted-foreground">
                You {isMuted && <MicOff size={10} className="text-destructive" />}
              </div>
            </div>
          </div>
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
              {chatLog.map((c, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <span className="text-xs font-semibold text-primary">{c.user}</span>
                  <p className="rounded-md rounded-tl-none bg-muted px-3 py-2 text-sm leading-relaxed text-muted-foreground">{c.text}</p>
                </div>
              ))}
            </div>
            <form className="flex gap-2 border-t border-border p-3" onSubmit={sendMessage}>
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
      <footer className="flex h-[100px] items-center justify-between border-t border-border px-6">
        <div className="flex w-[250px] items-center gap-4">
          <span className="text-sm font-medium tabular-nums text-muted-foreground" id="live-clock">{liveClock}</span>
          <span className="h-7 w-px bg-border" />
          <Button variant="ghost" size="icon" className="relative" onClick={() => setShowChat(!showChat)} aria-label="Toggle chat">
            <MessageSquare size={20} />
            {chatLog.length > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-primary" />}
          </Button>
          <Button variant="ghost" size="icon" aria-label="Participants">
            <Users size={20} />
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleMic}
            aria-label={isMuted ? 'Unmute microphone' : 'Mute microphone'}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px ${
              isMuted ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          <button
            onClick={toggleCam}
            aria-label={isCamOff ? 'Turn camera on' : 'Turn camera off'}
            className={`flex h-12 w-12 items-center justify-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px ${
              isCamOff ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'bg-secondary text-secondary-foreground hover:bg-accent'
            }`}
          >
            {isCamOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
          <button aria-label="Raise hand" className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px">
            <Hand size={22} />
          </button>
          <button aria-label="Share screen" className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px">
            <ScreenShare size={22} />
          </button>
          <button aria-label="Reactions" className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-accent-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px">
            <Smile size={22} />
          </button>
          <button
            onClick={handleLeave}
            aria-label="Leave call"
            className="ml-3 flex h-12 w-16 items-center justify-center rounded-xl bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px"
          >
            <PhoneOff size={22} />
          </button>
        </div>

        <div className="flex w-[250px] items-center justify-end gap-2">
          <Button variant="ghost" size="icon" aria-label="Audio settings">
            <Volume2 size={20} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Full screen">
            <Maximize2 size={20} />
          </Button>
          <Button variant="ghost" size="icon" aria-label="More options">
            <MoreVertical size={20} />
          </Button>
        </div>
      </footer>
    </div>
  );
}
