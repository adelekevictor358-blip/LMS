"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Video, Mic, MicOff, VideoOff, MessageSquare, Users,
  Settings, Hand, Monitor, Send, UserRound,
  Check, Loader2, Link2, ArrowRight, Signal, Grid, Disc, X,
  ThumbsUp, Heart, Laugh, Smile, PartyPopper
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function CinematicNeuralClassroom() {
  const { id } = useParams();
  const router = useRouter();
  const {
    user, liveSessions, endLiveSession, sendSessionMessage,
    sessionMessages, joinWaitingRoom, admitParticipant, rejectParticipant,
    joinLiveSession
  } = useStore();

  // Media States
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [isRequestingMedia, setIsRequestingMedia] = useState(false);

  // Call States
  const [hasJoined, setHasJoined] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [micActive, setMicActive] = useState(true);
  const [videoActive, setVideoActive] = useState(true);
  const [isSharing, setIsSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [handRaised, setHandRaised] = useState(false);
  const [rightPanel, setRightPanel] = useState('none');
  const [viewMode, setViewMode] = useState('gallery');
  const [chatInput, setChatInput] = useState('');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showLinkTooltip, setShowLinkTooltip] = useState(false);
  const [reactions, setReactions] = useState([]);
  const [liveClock, setLiveClock] = useState('');

  const videoRef = useRef(null);
  const sessionVideoRef = useRef(null);
  const screenRef = useRef(null);
  const session = liveSessions.find(s => s.id === id);
  const currentSessionMessages = sessionMessages.filter(m => m.sessionId === id);
  const chatEndRef = useRef(null);

  const participantsList = session?.participants || [];

  // ─── MEDIA RECONSTRUCTION ───
  const requestMediaPermissions = async () => {
    setIsRequestingMedia(true);
    const constraints = [
      { video: { width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: { echoCancellation: true } },
      { video: true, audio: true }
    ];

    for (const constraint of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        setLocalStream(stream);
        setHasPermission(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
        break;
      } catch (err) {
        console.warn("Retrying media link...", err.name);
      }
    }
    setIsRequestingMedia(false);
  };

  // Auto-attempt media on mount — non-blocking
  useEffect(() => {
    requestMediaPermissions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);

  // Actually mute/unmute the audio track on the stream
  useEffect(() => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => { track.enabled = micActive; });
    }
  }, [micActive, localStream]);

  // Actually enable/disable the video track on the stream
  useEffect(() => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => { track.enabled = videoActive; });
    }
  }, [videoActive, localStream]);

  const startScreenShare = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      setScreenStream(stream);
      setIsSharing(true);
      if (screenRef.current) screenRef.current.srcObject = stream;
      stream.getVideoTracks()[0].onended = () => {
         setIsSharing(false);
         setScreenStream(null);
      };
    } catch (err) {
      console.error("Screen Share Failed", err);
    }
  };

  const stopScreenShare = () => {
     if (screenStream) {
        screenStream.getTracks().forEach(t => t.stop());
        setScreenStream(null);
        setIsSharing(false);
     }
  };

  // Recording Timer
  useEffect(() => {
    let interval;
    if (isRecording) {
      interval = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
    } else {
      setRecordingTime(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const addReaction = (Icon) => {
     const id = Date.now();
     setReactions(prev => [...prev, { id, Icon, x: Math.random() * 80 + 10 }]);
     setTimeout(() => setReactions(prev => prev.filter(r => r.id !== id)), 4000);
  };

  const handleJoinAttempt = () => {
    joinLiveSession(id, user.id, user.name);
    if (!hasPermission && !isRequestingMedia) requestMediaPermissions();
    setHasJoined(true);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/classroom/${id}`);
    setShowLinkTooltip(true);
    setTimeout(() => setShowLinkTooltip(false), 2500);
  };

  const handleEndCall = () => {
    if (localStream) localStream.getTracks().forEach(t => t.stop());
    if (screenStream) screenStream.getTracks().forEach(t => t.stop());
    if (user?.role === 'lecturer') {
      if (confirm('End session for all participants?')) {
        endLiveSession(id);
        router.push('/lecturer');
      }
    } else {
      router.push('/dashboard');
    }
  };

  // Bind local stream to in-session video element
  useEffect(() => {
    if (sessionVideoRef.current && localStream) {
      sessionVideoRef.current.srcObject = localStream;
    }
  }, [localStream, hasJoined]);

  useEffect(() => {
    if (chatEndRef.current) chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
  }, [currentSessionMessages, rightPanel]);

  // Neutral dark immersive surface tokens (this view is intentionally always dark)
  if (!session) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <Loader2 size={32} className="text-zinc-400 animate-spin mb-4" strokeWidth={1.5} />
        <p className="text-sm text-zinc-400">Reconnecting to session…</p>
      </div>
    );
  }

  // Pre-join screen
  if (!hasJoined) {
    return (
      <div className="h-screen w-full bg-zinc-950 text-zinc-100 flex items-center justify-center p-8 font-sans overflow-hidden">
        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Camera preview */}
          <div className="relative aspect-video bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
            {hasPermission ? (
              <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-10">
                <div className="h-14 w-14 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 mb-5">
                  <Video size={24} className="text-zinc-400" strokeWidth={1.5} />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100 mb-2">Camera and microphone</h2>
                <p className="text-sm leading-relaxed text-zinc-400 max-w-xs text-pretty">
                  Enable your camera and microphone to join the session.
                </p>
                <Button
                  className="mt-6"
                  onClick={requestMediaPermissions}
                  disabled={isRequestingMedia}
                >
                  Enable devices
                  {isRequestingMedia && <Loader2 size={16} className="ml-2 animate-spin" />}
                </Button>
              </div>
            )}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-zinc-900/90 p-2 rounded-full border border-zinc-800">
              <Button
                variant="ghost"
                size="icon"
                className={`h-11 w-11 rounded-full ${micActive ? 'text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}`}
                onClick={() => setMicActive(!micActive)}
              >
                {micActive ? <Mic size={18} /> : <MicOff size={18} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={`h-11 w-11 rounded-full ${videoActive ? 'text-zinc-100 hover:bg-zinc-800 hover:text-zinc-100' : 'bg-destructive text-destructive-foreground hover:bg-destructive/90'}`}
                onClick={() => setVideoActive(!videoActive)}
              >
                {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
              </Button>
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
              <p className="text-sm leading-relaxed text-zinc-400">{session.title}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="group" onClick={handleJoinAttempt}>
                Join session
                <ArrowRight size={16} className="ml-2 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button variant="ghost" className="text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100">
                Test devices
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-800">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Participants</span>
                <span className="text-sm font-semibold text-zinc-100 tabular-nums">{participantsList.length + 1}</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Quality</span>
                <span className="text-sm font-semibold text-zinc-100">HD</span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-zinc-500">Encryption</span>
                <span className="text-sm font-semibold text-zinc-100">AES-256</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // In-session interface
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
              {isRecording && (
                <Badge className="bg-destructive/15 text-destructive border-transparent rounded-full font-medium gap-1.5 tabular-nums">
                  <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                  Rec {formatTime(recordingTime)}
                </Badge>
              )}
            </div>
            <h1 className="font-serif text-lg font-semibold tracking-tight text-zinc-50">{session.title}</h1>
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
              className="h-10 bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}
            >
              {viewMode === 'gallery' ? <UserRound size={18} className="mr-2" /> : <Grid size={18} className="mr-2" />}
              Change view
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 bg-zinc-900/80 border border-zinc-800 text-zinc-200 hover:bg-zinc-800 hover:text-zinc-100"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings size={18} />
            </Button>
          </div>
        </header>

        {/* Stage area */}
        <div className="flex-1 overflow-hidden p-6 pt-28 pb-28 flex items-center justify-center relative">

          {/* Reaction layer */}
          <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
            {reactions.map(r => (
              <div key={r.id} className="absolute bottom-0 text-primary animate-float-reaction" style={{ left: `${r.x}%` }}>
                <r.Icon size={36} strokeWidth={1.5} />
              </div>
            ))}
          </div>

          {isSharing ? (
            <div className="w-full h-full">
              <div className="w-full h-full relative rounded-xl overflow-hidden border border-zinc-800 bg-black">
                <video ref={screenRef} autoPlay playsInline className="h-full w-full object-contain" />
                <div className="absolute top-4 left-4">
                  <Badge className="bg-success/15 text-success border-transparent rounded-full font-medium gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                    Sharing screen
                  </Badge>
                </div>
                <div className="absolute bottom-4 right-4">
                  <Button variant="destructive" onClick={stopScreenShare}>Stop sharing</Button>
                </div>
              </div>
            </div>
          ) : viewMode === 'gallery' ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full max-w-[1600px] h-full auto-rows-fr">
              {/* Host tile */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-colors hover:border-primary/40">
                <div className="absolute inset-0 flex items-center justify-center">
                  <Avatar className="h-24 w-24 border border-zinc-700">
                    <AvatarFallback className="bg-primary text-3xl font-semibold text-primary-foreground">{session.lecturerName[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-md border border-zinc-800">
                  <span className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs font-medium text-zinc-100">{session.lecturerName} (host)</span>
                </div>
              </div>

              {/* Local feed */}
              <div className="relative rounded-xl overflow-hidden bg-zinc-900 border border-primary/50">
                <div className="absolute inset-0 bg-black flex items-center justify-center">
                  {videoActive ? (
                    <video ref={sessionVideoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                  ) : (
                    <Avatar className="h-20 w-20 border border-zinc-700">
                      <AvatarFallback className="bg-zinc-800 text-2xl font-semibold text-zinc-400">{user?.name[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  {handRaised && (
                    <div className="absolute top-3 right-3 bg-gold/15 text-gold p-2 rounded-md border border-gold/30">
                      <Hand size={18} />
                    </div>
                  )}
                </div>
                <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-md border border-zinc-800">
                  {micActive ? <span className="h-2 w-2 rounded-full bg-success" /> : <MicOff size={14} className="text-destructive" />}
                  <span className="text-xs font-medium text-zinc-100">{user?.name} (you)</span>
                </div>
              </div>

              {/* Other participants */}
              {participantsList.filter(p => p.id !== user.id && p.id !== session.lecturerId).map(p => (
                <div key={p.id} className="relative rounded-xl overflow-hidden bg-zinc-900 border border-zinc-800 transition-colors hover:border-zinc-700">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Avatar className="h-20 w-20 border border-zinc-700">
                      <AvatarFallback className="bg-zinc-800 text-zinc-400 font-semibold">{p.name[0]}</AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-zinc-950/80 px-3 py-1.5 rounded-md border border-zinc-800">
                    <MicOff size={14} className="text-zinc-500" />
                    <span className="text-xs font-medium text-zinc-300">{p.name}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="w-full max-w-6xl aspect-video relative rounded-xl overflow-hidden border border-zinc-800 bg-black">
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                <Avatar className="h-44 w-44 border border-zinc-700">
                  <AvatarFallback className="bg-primary text-7xl font-semibold text-primary-foreground">{session.lecturerName[0]}</AvatarFallback>
                </Avatar>
              </div>
              <div className="absolute bottom-6 left-6 flex items-center gap-3 bg-zinc-950/80 px-4 py-3 rounded-md border border-zinc-800">
                <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-400">Speaking</span>
                  <span className="font-serif text-lg font-semibold text-zinc-50">{session.lecturerName}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Control bar */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 h-16 bg-zinc-900/90 border border-zinc-800 px-4 flex items-center gap-3 z-[100] rounded-xl shadow-lg">

          <div className="flex items-center gap-2 border-r border-zinc-800 pr-3">
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${!micActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={() => setMicActive(!micActive)}
              title={micActive ? 'Mute' : 'Unmute'}
            >
              {micActive ? <Mic size={18} /> : <MicOff size={18} />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${!videoActive ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={() => setVideoActive(!videoActive)}
              title={videoActive ? 'Stop video' : 'Start video'}
            >
              {videoActive ? <Video size={18} /> : <VideoOff size={18} />}
            </Button>
          </div>

          <span className="text-xs font-medium text-zinc-400 tabular-nums border-r border-zinc-800 pr-3">{liveClock}</span>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className={`h-11 w-11 rounded-md ${rightPanel === 'participants' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
                onClick={() => setRightPanel(rightPanel === 'participants' ? 'none' : 'participants')}
                title="Participants"
              >
                <Users size={18} />
              </Button>
              <Badge className="absolute -top-1 -right-1 h-5 min-w-5 justify-center px-1 bg-primary text-primary-foreground border-transparent text-[10px] font-medium tabular-nums">{participantsList.length + 1}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${rightPanel === 'chat' ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')}
              title="Chat"
            >
              <MessageSquare size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${isSharing ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={isSharing ? stopScreenShare : startScreenShare}
              title={isSharing ? 'Stop sharing' : 'Share screen'}
            >
              <Monitor size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${isRecording ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={() => setIsRecording(!isRecording)}
              title={isRecording ? 'Stop recording' : 'Record'}
            >
              <Disc size={18} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-11 w-11 rounded-md ${handRaised ? 'bg-gold/15 text-gold hover:bg-gold/25' : 'text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100'}`}
              onClick={() => setHandRaised(!handRaised)}
              title="Raise hand"
            >
              <Hand size={18} />
            </Button>

            {/* Reactions */}
            <div className="h-11 px-2 bg-zinc-800/60 rounded-md flex items-center gap-1 ml-1">
              {[
                { Icon: ThumbsUp, n: 'Thumbs up' }, { Icon: Heart, n: 'Heart' }, { Icon: Laugh, n: 'Laughter' }, { Icon: Smile, n: 'Smile' }, { Icon: PartyPopper, n: 'Celebrate' }
              ].map(reaction => (
                <button
                  key={reaction.n}
                  className="p-1.5 rounded-md text-zinc-300 transition-colors hover:bg-zinc-700 hover:text-zinc-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 active:translate-y-px"
                  onClick={() => addReaction(reaction.Icon)}
                  aria-label={`React with ${reaction.n}`}
                >
                  <reaction.Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          <div className="pl-3 border-l border-zinc-800 flex items-center gap-2">
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                className="h-11 w-11 rounded-md text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100"
                onClick={copyLink}
                title="Copy invite link"
              >
                <Link2 size={18} />
              </Button>
              {showLinkTooltip && (
                <Badge className="absolute -top-9 left-1/2 -translate-x-1/2 bg-zinc-800 text-zinc-100 border-transparent text-xs font-medium animate-fade-in whitespace-nowrap">Link copied</Badge>
              )}
            </div>
            <Button variant="destructive" className="font-medium" onClick={handleEndCall}>
              Leave
            </Button>
          </div>
        </div>
      </main>

      {/* Side panel */}
      {rightPanel !== 'none' && (
        <aside className="w-[380px] bg-zinc-900 border-l border-zinc-800 flex flex-col animate-fade-in z-[200]">
          <header className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-semibold tracking-tight text-zinc-50">
                {rightPanel === 'chat' ? 'Chat' : 'Participants'}
              </h2>
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

          {rightPanel === 'chat' ? (
            <>
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
                <form onSubmit={(e) => { e.preventDefault(); if(chatInput.trim()) { sendSessionMessage(id, chatInput.trim()); setChatInput(''); } }} className="relative">
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
            </>
          ) : (
            <ScrollArea className="flex-1 p-5">
              <div className="space-y-6">
                {user?.role === 'lecturer' && session.waitingParticipants?.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-400 flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin" />
                      Waiting room ({session.waitingParticipants.length})
                    </h3>
                    <div className="space-y-2">
                      {session.waitingParticipants.map(p => (
                        <div key={p.userId} className="p-3 bg-zinc-800/60 border border-zinc-800 rounded-md flex items-center justify-between animate-fade-in">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-9 w-9">
                              <AvatarFallback className="bg-zinc-700 text-xs font-medium text-zinc-300">{p.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-zinc-100">{p.name}</span>
                              <span className="text-xs text-zinc-500">Verified identity</span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/15 hover:text-destructive rounded-md" onClick={() => rejectParticipant(id, p.userId)} title="Reject">
                              <X size={18} />
                            </Button>
                            <Button variant="ghost" size="icon" className="h-9 w-9 text-success hover:bg-success/15 hover:text-success rounded-md" onClick={() => admitParticipant(id, p.userId)} title="Admit">
                              <Check size={18} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <Separator className="bg-zinc-800 my-2" />
                  </div>
                )}

                <div className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wide text-zinc-400">In session</h3>
                  <div className="p-3 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-primary/40">
                        <AvatarFallback className="bg-zinc-800 text-sm font-medium text-zinc-100">ME</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-zinc-100">{user?.name} (you)</span>
                        <span className="text-xs text-primary">{user?.role === 'lecturer' ? 'Host' : 'Participant'}</span>
                      </div>
                    </div>
                    {!micActive && <MicOff size={16} className="text-destructive" />}
                  </div>

                  {participantsList.filter(p => p.id !== user.id && p.id !== session.lecturerId).map(p => (
                    <div key={p.id} className="p-3 rounded-md border border-transparent transition-colors hover:bg-zinc-800/60 hover:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-zinc-800 text-sm font-medium text-zinc-400">{p.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-zinc-300">{p.name}</span>
                          <span className="text-xs text-zinc-500 capitalize">{p.role}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </ScrollArea>
          )}
        </aside>
      )}

      {/* Reaction float animation */}
      <style jsx global>{`
         @keyframes float-reaction {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { opacity: 1; transform: translateY(-20vh) scale(1.1); }
            80% { opacity: 1; transform: translateY(-80vh) scale(1); }
            100% { transform: translateY(-100vh) scale(0.9); opacity: 0; }
         }
         .animate-float-reaction {
            animation: float-reaction 4s ease-in forwards;
         }
      `}</style>
    </div>
  );
}
