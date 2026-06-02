"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Video, Mic, MicOff, VideoOff, PhoneOff, MessageSquare, Users, 
  Settings, Share2, Hand, Monitor, Layout, Maximize2, 
  MoreVertical, Send, User, X, Shield, Grid, UserRound,
  Check, Volume2, HardDrive, Info, Headphones, Loader2, AlertCircle,
  Copy, Link2, ArrowRight, Signal, Radio, Crown, Heart, ThumbsUp, Laugh, 
  HandMetal, Smile, Zap, Circle, Disc
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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

  const addReaction = (emoji) => {
     const id = Date.now();
     setReactions(prev => [...prev, { id, emoji, x: Math.random() * 80 + 10 }]);
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

  if (!session) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-[#050505] text-white">
        <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-6" />
        <h1 className="text-sm font-black tracking-[0.5em] text-slate-700 uppercase italic">Reconnecting Hub Sync...</h1>
      </div>
    );
  }

  // Pre-Join Experience
  if (!hasJoined) {
    return (
      <div className="h-screen w-full bg-[#050505] flex items-center justify-center p-8 font-sans overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 blur-[120px] rounded-full animate-pulse delay-1000" />
        
        <div className="max-w-7xl w-full grid grid-cols-1 xl:grid-cols-2 gap-24 items-center relative z-10">
           <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[64px] blur opacity-25 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative aspect-video bg-[#0a0a0a] rounded-[60px] overflow-hidden border border-white/10 shadow-3xl">
                 {hasPermission ? (
                    <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1]" />
                 ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                       <div className="h-24 w-24 bg-blue-600/10 rounded-full flex items-center justify-center border border-blue-600/20 mb-8 animate-bounce">
                          <Crown size={40} className="text-blue-500" />
                       </div>
                       <h2 className="text-3xl font-black text-white italic tracking-tighter mb-4">Identity Link Required</h2>
                       <p className="text-slate-500 font-bold max-w-sm">Enable your camera and audio to establish a secure frequency with the institution.</p>
                       <Button 
                         className="mt-10 h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-2xl shadow-blue-600/30 active:scale-95 transition-all text-lg"
                         onClick={requestMediaPermissions}
                         disabled={isRequestingMedia}
                       >
                          Establish Link {isRequestingMedia && <Loader2 className="ml-3 animate-spin" />}
                       </Button>
                    </div>
                 )}
                 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-4 bg-black/60 backdrop-blur-3xl p-4 rounded-3xl border border-white/10">
                    <Button variant="ghost" size="icon" className={`h-14 w-16 rounded-2xl ${micActive ? 'text-white hover:bg-white/10' : 'bg-red-600 text-white'}`} onClick={() => setMicActive(!micActive)}>{micActive ? <Mic /> : <MicOff />}</Button>
                    <Button variant="ghost" size="icon" className={`h-14 w-16 rounded-2xl ${videoActive ? 'text-white hover:bg-white/10' : 'bg-red-600 text-white'}`} onClick={() => setVideoActive(!videoActive)}>{videoActive ? <Video /> : <VideoOff />}</Button>
                 </div>
              </div>
           </div>

           <div className="space-y-12">
              <div className="space-y-6">
                 <div className="flex items-center gap-4">
                    <Badge className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-black text-[10px] tracking-[0.3em] uppercase border-none">Institutional V-LINK</Badge>
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Protocol 4.0 Active</span>
                 </div>
                 <h1 className="text-7xl font-black text-white italic tracking-tighter leading-[0.9]">Ready to <br/><span className="text-blue-600">Sync?</span></h1>
                 <p className="text-2xl font-bold text-slate-400 italic">"{session.title}"</p>
              </div>

              <div className="flex flex-col sm:flex-row gap-6">
                 <Button 
                   className="h-20 px-16 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-[40px] text-3xl shadow-[0_30px_70px_rgba(37,99,235,0.4)] active:scale-95 transition-all group"
                   onClick={handleJoinAttempt}
                 >
                    Join Hub <ArrowRight className="ml-4 group-hover:translate-x-3 transition-transform" />
                 </Button>
                 <Button variant="ghost" className="h-20 px-12 text-slate-500 hover:text-white font-black text-xl italic uppercase tracking-widest hover:bg-white/5 rounded-[40px]">Test Link</Button>
              </div>

              <div className="grid grid-cols-3 gap-6 pt-12 border-t border-white/5">
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Participants</span>
                    <span className="text-xl font-black text-white italic">{participantsList.length + 1} Logged</span>
                 </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Quality</span>
                    <span className="text-xl font-black text-blue-500 italic">4K / Lossless</span>
                 </div>
                 <div className="flex flex-col gap-2">
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Encryption</span>
                    <span className="text-xl font-black text-teal-500 italic">AES-256</span>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // Standard Main Interactive Interface
  return (
    <div className="h-screen w-full bg-[#030303] flex overflow-hidden font-sans text-slate-100">
      <div className="flex-1 flex flex-col relative group">
         
         {/* Live Status HUD */}
         <div className="absolute top-0 left-0 right-0 z-50 p-10 bg-gradient-to-b from-black to-transparent flex justify-between items-start pointer-events-none">
            <div className="flex gap-8 pointer-events-auto">
               <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                     <Badge className="bg-red-600 text-white font-black text-[10px] px-3 py-1 animate-pulse border-none rounded-sm">LIVE</Badge>
                     {isRecording && (
                        <Badge className="bg-white/10 text-white font-black text-[10px] px-3 py-1 flex items-center gap-2 border-none">
                           <div className="h-2 w-2 bg-red-600 rounded-full animate-pulse" /> REC {formatTime(recordingTime)}
                        </Badge>
                     )}
                  </div>
                  <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase drop-shadow-2xl">{session.title}</h2>
                  <div className="flex items-center gap-3">
                     <span className="text-[11px] font-black text-blue-600 uppercase tracking-widest">{id}</span>
                     <Separator orientation="vertical" className="h-3 bg-white/20" />
                     <div className="flex items-center gap-2">
                        <Signal size={12} className="text-green-500" />
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Stable Link Optimized</span>
                     </div>
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-3 pointer-events-auto">
               <Button variant="ghost" className="bg-white/5 hover:bg-white/15 text-white h-12 px-8 rounded-2xl border border-white/5 font-black text-sm italic tracking-widest backdrop-blur-xl transition-all" onClick={() => setViewMode(viewMode === 'gallery' ? 'speaker' : 'gallery')}>
                  {viewMode === 'gallery' ? <UserRound className="mr-3" /> : <Grid className="mr-3" />} Adjust View
               </Button>
               <Button variant="ghost" size="icon" className="h-12 w-12 bg-white/5 hover:bg-white/15 rounded-2xl border border-white/5 backdrop-blur-xl" onClick={() => setIsSettingsOpen(true)}>
                  <Settings size={20} />
               </Button>
            </div>
         </div>

         {/* Cinematic Stage Area */}
         <div className="flex-1 overflow-hidden p-10 pb-44 flex items-center justify-center relative">
            
            {/* Reaction Layer */}
            <div className="absolute inset-0 pointer-events-none z-40 overflow-hidden">
               {reactions.map(r => (
                  <div key={r.id} className="absolute bottom-0 text-5xl animate-float-emoji" style={{ left: `${r.x}%` }}>
                     {r.emoji}
                  </div>
               ))}
            </div>

            {/* Content Logic */}
            {isSharing ? (
               <div className="w-full h-full p-8">
                  <div className="w-full h-full relative rounded-[64px] overflow-hidden shadow-4xl border-[12px] border-blue-600/50 bg-black">
                     <video ref={screenRef} autoPlay playsInline className="h-full w-full object-contain" />
                     <div className="absolute top-10 left-10 bg-blue-600 text-white font-black px-8 py-3 rounded-2xl text-lg italic tracking-tighter shadow-2xl animate-pulse">
                        PROJECTING SCREEN TRANSMISSION
                     </div>
                     <div className="absolute bottom-10 right-10">
                        <Button className="bg-red-600 hover:bg-red-700 text-white font-black h-16 px-10 rounded-2xl shadow-3xl text-sm italic" onClick={stopScreenShare}>STOP PROJECTION</Button>
                     </div>
                  </div>
               </div>
            ) : viewMode === 'gallery' ? (
               <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 w-full max-w-[1600px] h-full automotive-grid auto-rows-fr">
                  {/* Host Tile */}
                  <div className="relative rounded-[56px] overflow-hidden bg-gradient-to-br from-[#111] to-black border-4 border-white/5 shadow-2xl transition-all duration-700 hover:scale-[1.02] hover:border-blue-600 group">
                      <div className="absolute inset-0 flex items-center justify-center">
                         <Avatar className="h-44 w-44 border-[12px] border-slate-900 group-hover:scale-110 transition-transform duration-700 shadow-4xl shadow-blue-600/20">
                            <AvatarFallback className="bg-blue-600 text-6xl font-black text-white italic">{session.lecturerName[0]}</AvatarFallback>
                         </Avatar>
                      </div>
                      <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-6 py-3 rounded-[24px] border border-white/10">
                         <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse shadow-lg shadow-blue-600/50" />
                         <span className="text-sm font-black italic uppercase text-white shadow-sm">{session.lecturerName} (Lead)</span>
                      </div>
                  </div>

                  {/* Local Identity Feed */}
                  <div className="relative rounded-[56px] overflow-hidden bg-[#111] border-4 border-blue-600/60 shadow-3xl shadow-blue-600/20 transition-all duration-700 hover:scale-[1.02]">
                     <div className="absolute inset-0 bg-black flex items-center justify-center">
                        {videoActive ? (
                           <video ref={sessionVideoRef} autoPlay playsInline muted className="h-full w-full object-cover scale-x-[-1] brightness-125 contrast-125" />
                        ) : (
                           <Avatar className="h-36 w-36 border-[8px] border-slate-900 grayscale">
                              <AvatarFallback className="bg-slate-800 text-5xl font-black text-slate-500">{user?.name[0]}</AvatarFallback>
                           </Avatar>
                        )}
                        {handRaised && (
                           <div className="absolute top-10 right-10 bg-yellow-400 p-4 rounded-3xl shadow-2xl animate-bounce border-4 border-black">
                              <Hand size={32} className="text-black" />
                           </div>
                        )}
                     </div>
                     <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-6 py-3 rounded-[24px] border border-white/10">
                        {micActive ? <div className="h-2 w-2 rounded-full bg-green-500 animate-bounce" /> : <MicOff size={16} className="text-red-500" />}
                        <span className="text-sm font-black italic uppercase text-white">{user?.name} (You)</span>
                     </div>
                  </div>

                  {/* Other Syncs */}
                  {participantsList.filter(p => p.id !== user.id).map(p => (
                     <div key={p.id} className="relative rounded-[56px] overflow-hidden bg-[#0a0a0a] border-4 border-white/5 opacity-80 hover:opacity-100 transition-all duration-500">
                        <div className="absolute inset-0 flex items-center justify-center">
                           <Avatar className="h-32 w-32 border-8 border-slate-900 grayscale opacity-40">
                              <AvatarFallback className="bg-slate-900 text-white font-black italic">{p.name[0]}</AvatarFallback>
                           </Avatar>
                        </div>
                        <div className="absolute bottom-10 left-10 flex items-center gap-4 bg-black/80 backdrop-blur-3xl px-6 py-3 rounded-[24px] border border-white/10">
                           <MicOff size={14} className="text-slate-600" />
                           <span className="text-[11px] font-black uppercase text-slate-500">{p.name}</span>
                        </div>
                     </div>
                  ))}
               </div>
            ) : (
               <div className="w-full max-w-7xl aspect-video relative rounded-[100px] overflow-hidden shadow-4xl border-[10px] border-blue-600 bg-black group">
                  <div className="absolute inset-0 flex items-center justify-center bg-[#070707]">
                      <div className="relative">
                         <div className="absolute -inset-10 bg-blue-600/20 blur-[100px] rounded-full animate-pulse" />
                         <Avatar className="h-80 w-80 border-[20px] border-black shadow-[0_0_100px_rgba(37,99,235,0.4)] animate-in zoom-in-75 duration-700 relative z-10">
                            <AvatarFallback className="bg-blue-600 text-[140px] font-black text-white italic drop-shadow-2xl">{session.lecturerName[0]}</AvatarFallback>
                         </Avatar>
                      </div>
                  </div>
                  <div className="absolute bottom-16 left-16 flex items-center gap-10 bg-black/80 backdrop-blur-[40px] p-12 rounded-[56px] border border-white/10 shadow-4xl group-hover:scale-105 transition-transform duration-700">
                     <div className="h-8 w-8 rounded-full bg-blue-600 animate-pulse shadow-4xl shadow-blue-600/60" />
                     <div className="flex flex-col">
                        <span className="text-[14px] font-black uppercase text-blue-500 tracking-[0.6em] mb-4 italic">Lead Transmissions Active</span>
                        <span className="font-black text-7xl italic text-white tracking-tighter leading-none shadow-sm">{session.lecturerName}</span>
                     </div>
                  </div>
               </div>
            )}
         </div>

         {/* Master Control Dashboard (Zoom / Standard Style) */}
         <div className="absolute bottom-12 left-1/2 -translate-x-1/2 h-[120px] bg-[#111]/90 backdrop-blur-3xl border border-white/10 px-14 flex items-center gap-10 z-[100] rounded-[60px] shadow-[0_50px_150px_rgba(0,0,0,0.8)] ring-1 ring-white/5 animation-pop">
            
            <div className="flex items-center gap-5 border-r border-white/10 pr-10">
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${!micActive ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={() => setMicActive(!micActive)}>
                     {micActive ? <Mic size={28} /> : <MicOff size={28} />}
                  </Button>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{micActive ? 'Mute' : 'Unmute'}</span>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${!videoActive ? 'bg-red-600 text-white shadow-xl shadow-red-600/40 hover:bg-red-700' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`} onClick={() => setVideoActive(!videoActive)}>
                     {videoActive ? <Video size={28} /> : <VideoOff size={28} />}
                  </Button>
                  <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest">{videoActive ? 'Stop' : 'Start'} Video</span>
               </div>
            </div>
            <div className="text-[11px] font-black text-slate-500 tabular-nums tracking-widest border-r border-white/10 pr-10">{liveClock}</div>

            <div className="flex items-center gap-4">
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${rightPanel === 'participants' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10'}`} onClick={() => setRightPanel(rightPanel === 'participants' ? 'none' : 'participants')}>
                     <Users size={28} />
                  </Button>
                  <Badge className="absolute -top-1 -right-1 bg-blue-600 text-[10px] font-bold border-none">{participantsList.length + 1}</Badge>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${rightPanel === 'chat' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-white/10'}`} onClick={() => setRightPanel(rightPanel === 'chat' ? 'none' : 'chat')}>
                     <MessageSquare size={28} />
                  </Button>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={`h-18 w-20 rounded-[28px] transition-all ${isSharing ? 'bg-green-600 text-white animate-pulse' : 'text-blue-500 hover:bg-blue-600/10'}`} 
                    onClick={isSharing ? stopScreenShare : startScreenShare}
                  >
                     <Monitor size={28} />
                  </Button>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${isRecording ? 'bg-red-600 text-white animate-pulse' : 'text-slate-400 hover:bg-white/10'}`} onClick={() => setIsRecording(!isRecording)}>
                     <Disc size={28} />
                  </Button>
               </div>
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className={`h-18 w-20 rounded-[28px] ${handRaised ? 'bg-yellow-400 text-black' : 'text-slate-400 hover:bg-yellow-400/10'}`} onClick={() => setHandRaised(!handRaised)}>
                     <Hand size={28} />
                  </Button>
               </div>
               
               {/* Reaction Toolbar */}
               <div className="h-16 px-4 bg-white/5 rounded-full flex items-center gap-2 mx-4 group-hover:scale-105 transition-all">
                  {[ 
                    { e: '👍', n: 'Thumb' }, { e: '❤️', n: 'Heart' }, { e: '😂', n: 'Laughter' }, { e: '😮', n: 'Surprise' }, { e: '🎉', n: 'Celebrate' } 
                  ].map(emo => (
                     <button key={emo.n} className="text-2xl hover:scale-150 active:scale-95 transition-all p-2 rounded-xl hover:bg-white/10" onClick={() => addReaction(emo.e)}>{emo.e}</button>
                  ))}
               </div>
            </div>

            <div className="pl-10 ml-4 border-l border-white/10 flex items-center gap-8">
               <div className="flex flex-col items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-18 w-20 rounded-[28px] text-slate-400 hover:bg-blue-600/10 hover:text-blue-500 transition-all" onClick={copyLink}>
                     <Link2 size={28} />
                  </Button>
                  {showLinkTooltip && (
                     <Badge className="absolute -top-12 bg-blue-600 text-white font-black text-[10px] px-4 py-1 rounded-sm border-none shadow-3xl animate-in slide-in-from-bottom">Copied link</Badge>
                  )}
               </div>
               <Button className="bg-red-600 hover:bg-red-700 text-white font-black px-12 h-20 rounded-[36px] shadow-3xl shadow-red-600/40 active:scale-95 transition-all text-lg italic tracking-tighter" onClick={handleEndCall}>
                  Terminate Link
               </Button>
            </div>
         </div>
      </div>

      {/* Slide Integration Panels (Right) */}
      {rightPanel !== 'none' && (
         <div className="w-[480px] bg-[#0a0a0a] border-l border-white/10 flex flex-col animate-in slide-in-from-right duration-700 shadow-5xl z-[200]">
            <div className="p-12 border-b border-white/5 flex items-center justify-between bg-black/60 backdrop-blur-xl">
               <div>
                  <h3 className="font-black text-xl italic uppercase tracking-[0.4em] text-white underline decoration-blue-600 decoration-4 underline-offset-8">
                     {rightPanel === 'chat' ? 'Broadcast' : 'Registry'}
                  </h3>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mt-6">Secure Frequency ID: <span className="text-blue-500">{id}</span></p>
               </div>
               <Button variant="ghost" size="icon" className="h-14 w-14 text-slate-500 hover:text-white rounded-3xl" onClick={() => setRightPanel('none')}>
                  <X size={28} strokeWidth={3} />
               </Button>
            </div>

            {rightPanel === 'chat' ? (
               <>
                  <ScrollArea className="flex-1 p-12">
                     <div className="space-y-12">
                        {currentSessionMessages.map((m, i) => (
                           <div key={i} className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-6 duration-500">
                              <div className="flex justify-between items-baseline px-4">
                                 <span className={`text-[12px] font-black uppercase tracking-[0.3em] ${m.fromId === user?.id ? 'text-blue-500' : 'text-slate-500'}`}>{m.fromName}</span>
                                 <span className="text-[10px] text-slate-800 font-bold">{new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className={`p-8 rounded-[48px] rounded-tl-none border-2 ${m.fromId === user?.id ? 'bg-blue-600/10 border-blue-500/20 text-blue-50 shadow-2xl' : 'bg-[#111] border-white/5 text-slate-300 shadow-xl'}`}>
                                 <p className="text-lg font-bold leading-relaxed">{m.content}</p>
                              </div>
                           </div>
                        ))}
                        <div ref={chatEndRef} />
                     </div>
                  </ScrollArea>
                  <div className="p-12 border-t border-white/5 bg-black">
                     <form onSubmit={(e) => { e.preventDefault(); if(chatInput.trim()) { sendSessionMessage(id, chatInput.trim()); setChatInput(''); } }} className="relative">
                        <Input 
                          className="bg-[#111] border-white/10 h-20 rounded-[40px] text-lg focus-visible:ring-blue-600 pr-24 font-black italic shadow-inner pl-10" 
                          placeholder="Type identifier..." 
                          value={chatInput}
                          onChange={e => setChatInput(e.target.value)}
                        />
                        <Button type="submit" size="icon" className="absolute right-3 top-3 h-14 w-14 bg-blue-600 hover:bg-blue-700 text-white rounded-[24px] shadow-3xl shadow-blue-600/40">
                           <Send size={28} />
                        </Button>
                     </form>
                  </div>
               </>
            ) : (
               <ScrollArea className="flex-1 p-10">
                  <div className="space-y-12">
                     {user?.role === 'lecturer' && session.waitingParticipants?.length > 0 && (
                        <div className="space-y-8">
                           <h4 className="text-[13px] font-black uppercase tracking-[0.4em] text-blue-500 px-8 flex items-center gap-4 italic underline decoration-blue-600/20">
                              <Loader2 size={18} className="animate-spin" /> Admission Control ({session.waitingParticipants.length})
                           </h4>
                           <div className="space-y-4">
                              {session.waitingParticipants.map(p => (
                                 <div key={p.userId} className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[48px] flex items-center justify-between shadow-2xl animate-in zoom-in-95">
                                    <div className="flex items-center gap-6">
                                       <Avatar className="h-16 w-16 ring-4 ring-blue-600/20">
                                          <AvatarFallback className="bg-slate-900 text-xs font-black italic text-slate-500">{p.name[0]}</AvatarFallback>
                                       </Avatar>
                                       <div className="flex flex-col">
                                          <span className="text-lg font-black italic text-white uppercase tracking-tighter">{p.name}</span>
                                          <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest mt-1">Institutional Identity Verified</span>
                                       </div>
                                    </div>
                                    <div className="flex gap-4">
                                       <Button variant="ghost" size="icon" className="h-14 w-14 text-red-500 hover:bg-red-500/20 rounded-3xl" onClick={() => rejectParticipant(id, p.userId)}><X size={32} /></Button>
                                       <Button variant="ghost" size="icon" className="h-14 w-14 text-teal-400 hover:bg-teal-400/20 rounded-3xl" onClick={() => admitParticipant(id, p.userId)}><Check size={32} /></Button>
                                    </div>
                                 </div>
                              ))}
                           </div>
                           <Separator className="bg-white/5 my-12" />
                        </div>
                     )}

                     <div className="space-y-8">
                        <h4 className="text-[13px] font-black uppercase tracking-[0.4em] text-slate-600 px-8 italic">Synchronized registry</h4>
                        <div className="p-8 bg-blue-600/5 rounded-[56px] border border-blue-600/10 flex items-center justify-between mb-12 shadow-4xl ring-8 ring-blue-600/5">
                           <div className="flex items-center gap-6">
                              <Avatar className="h-18 w-18 border-4 border-blue-600 shadow-4xl">
                                 <AvatarFallback className="bg-slate-900 text-white font-black italic text-xl">ME</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                 <span className="text-xl font-black italic text-white uppercase tracking-tight">{user?.name} (You)</span>
                                 <span className="text-[12px] font-black text-blue-500 uppercase tracking-widest mt-1">{user?.role === 'lecturer' ? 'Administrative Lead' : 'Synchronized Entity'}</span>
                              </div>
                           </div>
                           {!micActive && <MicOff size={24} className="text-red-500" />}
                        </div>
                        
                        {participantsList.filter(p => p.id !== user.id && p.id !== session.lecturerId).map(p => (
                           <div key={p.id} className="p-8 hover:bg-white/5 transition-all flex items-center justify-between rounded-[48px] border border-transparent hover:border-white/5">
                              <div className="flex items-center gap-6">
                                 <Avatar className="h-16 w-16 bg-slate-900 shadow-2xl opacity-50">
                                    <AvatarFallback className="text-xl font-black italic opacity-40">{p.name[0]}</AvatarFallback>
                                 </Avatar>
                                 <div className="flex flex-col">
                                    <span className="text-lg font-black italic text-slate-400 uppercase tracking-tighter">{p.name}</span>
                                    <span className="text-[11px] font-black text-slate-700 uppercase tracking-widest mt-1">{p.role} Identity</span>
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </ScrollArea>
            )}
         </div>
      )}

      {/* Style Animations */}
      <style jsx global>{`
         @keyframes float-emoji {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { opacity: 1; transform: translateY(-20vh) scale(1.2); }
            80% { opacity: 1; transform: translateY(-80vh) scale(1); }
            100% { transform: translateY(-100vh) scale(0.8); opacity: 0; }
         }
         .animate-float-emoji {
            animation: float-emoji 4s ease-in forwards;
         }
         .animation-pop {
            animation: pop 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
         }
         @keyframes pop {
            from { transform: translate(-50%, 50px) scale(0.8); opacity: 0; }
            to { transform: translate(-50%, 0) scale(1); opacity: 1; }
         }
      `}</style>
    </div>
  );
}
