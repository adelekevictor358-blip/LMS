"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { 
  Mic, MicOff, Video, VideoOff, PhoneOff, ScreenShare, 
  MessageSquare, Users, Settings, Hand, Smile, Send, X,
  Maximize2, Volume2, Shield, MoreVertical
} from 'lucide-react';

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
      <div className="error-screen">
        <h2>Session Not Found</h2>
        <p>This live class might have ended or the link is invalid.</p>
        <button className="btn btn-primary" onClick={() => router.push('/')}>Return Home</button>
      </div>
    );
  }

  return (
    <div className="classroom-wrapper">
      {/* Top Bar */}
      <div className="classroom-header">
        <div className="session-info">
          <div className="live-pill">LIVE</div>
          <div className="divider"></div>
          <div>
            <h3>{currentSession?.title || "Virtual Lecture Session"}</h3>
            <p>{currentSession?.lecturerName} · PHY104 Fundamentals</p>
          </div>
        </div>
        <div className="header-controls">
          <div className="recording-status">
            <span className="dot"></span> REC 01:24:05
          </div>
          <button className="icon-btn"><Settings size={18} /></button>
          <button className="icon-btn"><Shield size={18} /></button>
        </div>
      </div>

      <div className="main-stage">
        {/* Video Grid */}
        <div className={`video-grid ${showChat ? 'with-chat' : ''}`}>
          {/* Main Speaker (Lecturer) */}
          <div className="video-card main-speaker">
            <div className="video-overlay">
              <span>{user?.role === 'lecturer' ? `${user?.title} ${user?.name} (Host)` : (currentSession?.lecturerName || "Lecturer")}</span>
            </div>
            
            {(user?.role === 'lecturer' && !isCamOff) ? (
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted={true}
                className="live-video-feed"
              />
            ) : (
              <div className="video-placeholder lecturer-view">
                <div className="avatar-lg">
                  {(user?.role === 'lecturer' ? user.avatar : (currentSession?.lecturerName?.charAt(0) || 'L'))}
                </div>
                <p>{isCamOff ? 'Camera is Off' : 'Host is presenting...'}</p>
              </div>
            )}
            
            <div className="speaker-badges">
              <div className="badge">{isMuted ? <MicOff size={14} /> : <Mic size={14} />}</div>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="participants-sidebar">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="video-card mini">
                <div className="video-placeholder mini-v">
                  <div className="avatar-sm">S{i}</div>
                </div>
                <div className="mini-name">Student {i}</div>
              </div>
            ))}
            <div className="video-card mini self">
               <div className={`video-placeholder mini-v ${isCamOff ? 'cam-off' : ''}`}>
                  {isCamOff ? (
                    <div className="avatar-sm">{user?.avatar}</div>
                  ) : (
                    user?.role === 'student' ? (
                      <video 
                        ref={videoRef} 
                        autoPlay 
                        playsInline 
                        muted={true}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px' }}
                      />
                    ) : (
                      <div className="avatar-sm text-xs">Self View</div>
                    )
                  )}
               </div>
               <div className="mini-name">You {isMuted && <MicOff size={10} color="#ff4d4d" />}</div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="chat-panel glass-panel">
            <div className="panel-header">
              <h3>In-call Messages</h3>
              <button className="close-chat" onClick={() => setShowChat(false)}><X size={18} /></button>
            </div>
            <div className="chat-content">
              {chatLog.map((c, i) => (
                <div key={i} className="chat-msg">
                  <span className="sender">{c.user}</span>
                  <p className="txt">{c.text}</p>
                </div>
              ))}
            </div>
            <form className="chat-entry" onSubmit={sendMessage}>
              <input 
                type="text" 
                placeholder="Send a message to everyone" 
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button type="submit"><Send size={16} /></button>
            </form>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="classroom-footer">
        <div className="left-tools">
          <div className="time-display" id="live-clock">{liveClock}</div>
          <div className="divider"></div>
          <button className="tool-btn" onClick={() => setShowChat(!showChat)}>
            <MessageSquare size={20} />
            {chatLog.length > 0 && <span className="notif-dot"></span>}
          </button>
          <button className="tool-btn"><Users size={20} /></button>
        </div>

        <div className="center-actions">
          <button className={`action-circle ${isMuted ? 'off' : ''}`} onClick={toggleMic}>
            {isMuted ? <MicOff size={22} /> : <Mic size={22} />}
          </button>
          <button className={`action-circle ${isCamOff ? 'off' : ''}`} onClick={toggleCam}>
            {isCamOff ? <VideoOff size={22} /> : <Video size={22} />}
          </button>
          <button className="action-circle secondary"><Hand size={22} /></button>
          <button className="action-circle secondary"><ScreenShare size={22} /></button>
          <button className="action-circle secondary"><Smile size={22} /></button>
          <button className="action-circle hang-up" onClick={handleLeave}>
            <PhoneOff size={22} />
          </button>
        </div>

        <div className="right-tools">
           <button className="tool-btn"><Volume2 size={20} /></button>
           <button className="tool-btn"><Maximize2 size={20} /></button>
           <button className="tool-btn"><MoreVertical size={20} /></button>
        </div>
      </div>

      <style jsx>{`
        .classroom-wrapper {
          position: fixed;
          inset: 0;
          background: #0a0a0b;
          color: white;
          display: flex;
          flex-direction: column;
          z-index: 9999;
          font-family: 'Inter', sans-serif;
        }

        .classroom-header {
          height: 70px;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.3);
        }

        .session-info { display: flex; align-items: center; gap: 1.5rem; }
        .live-pill {
          background: #ef4444;
          padding: 0.2rem 0.6rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 800;
          letter-spacing: 1px;
        }
        .divider { width: 1px; height: 30px; background: rgba(255,255,255,0.1); }
        .session-info h3 { font-size: 1rem; margin-bottom: 0.2rem; }
        .session-info p { font-size: 0.75rem; opacity: 0.6; }

        .recording-status {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          font-weight: 600;
          color: #ef4444;
          margin-right: 1.5rem;
        }
        .recording-status .dot { width: 8px; height: 8px; background: #ef4444; border-radius: 50%; animation: pulse 2s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        .header-controls { display: flex; align-items: center; gap: 0.5rem; }
        .icon-btn { background: transparent; border: none; color: white; opacity: 0.6; cursor: pointer; padding: 0.5rem; border-radius: 8px; transition: 0.2s; }
        .icon-btn:hover { background: rgba(255,255,255,0.1); opacity: 1; }

        .main-stage {
          flex: 1;
          display: flex;
          padding: 1rem;
          gap: 1rem;
          overflow: hidden;
        }

        .video-grid {
          flex: 1;
          display: grid;
          grid-template-columns: 1fr 200px;
          gap: 1rem;
          transition: all 0.3s ease;
        }

        .video-card {
          background: #1c1c1e;
          border-radius: 16px;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.05);
        }

        .main-speaker { height: 100%; width: 100%; border: 3px solid var(--primary); background: #000; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .live-video-feed { width: 100%; height: 100%; object-fit: cover; transform: scaleX(-1); }
        .self { border: 2px solid #3b82f6; }
        .cam-off { background: #000; }

        .video-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #1c1c1e;
          gap: 1.5rem;
        }
        .lecturer-view { background: linear-gradient(45deg, #1c1c1e, #2c2c2e); }

        .avatar-lg {
          width: 120px;
          height: 120px;
          border-radius: 50%;
          background: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 700;
          box-shadow: 0 0 40px rgba(15, 82, 186, 0.4);
        }

        .participants-sidebar {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          overflow-y: auto;
        }

        .mini { height: 140px; }
        .avatar-sm { width: 40px; height: 40px; border-radius: 50%; background: #3a3a3c; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; }
        .mini-v { background: #2c2c2e; min-height: 140px; }
        .mini-name {
          position: absolute;
          bottom: 0.5rem;
          left: 0.5rem;
          font-size: 0.7rem;
          opacity: 0.8;
          display: flex;
          align-items: center;
          gap: 0.3rem;
        }

        .self { border: 1px solid #3b82f6; }
        .cam-off { background: #000; }

        .chat-panel {
          width: 350px;
          display: flex;
          flex-direction: column;
          background: rgba(28, 28, 30, 0.8);
          border-radius: 16px;
        }

        .panel-header { padding: 1.25rem; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .panel-header h3 { font-size: 0.9rem; font-weight: 600; }
        .chat-content { flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem; }
        .chat-msg { display: flex; flex-direction: column; gap: 0.25rem; }
        .sender { font-size: 0.75rem; font-weight: 700; color: var(--primary); }
        .txt { font-size: 0.85rem; opacity: 0.8; background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 10px; border-top-left-radius: 0; }

        .chat-entry { padding: 1rem; display: flex; gap: 0.5rem; }
        .chat-entry input { flex: 1; background: #2c2c2e; border: none; border-radius: 10px; padding: 0.6rem 1rem; color: white; font-size: 0.85rem; }
        .chat-entry input:focus { outline: 2px solid var(--primary); }
        .chat-entry button { width: 36px; height: 36px; border-radius: 10px; background: var(--primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; }

        .classroom-footer {
          height: 100px;
          padding: 0 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(0,0,0,0.5);
        }

        .left-tools, .right-tools { display: flex; align-items: center; gap: 1.25rem; width: 250px; }
        .time-display { font-size: 0.9rem; font-weight: 500; opacity: 0.8; }
        .tool-btn { position: relative; background: transparent; border: none; color: white; opacity: 0.7; cursor: pointer; }
        .notif-dot { position: absolute; top: -2px; right: -2px; width: 8px; height: 8px; background: #3b82f6; border-radius: 50%; border: 2px solid #000; }

        .center-actions { display: flex; align-items: center; gap: 1rem; }
        .action-circle {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: #3a3a3c;
          border: none;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-circle:hover { transform: scale(1.05); background: #4a4a4c; }
        .action-circle.off { background: #ef4444; color: white; }
        .action-circle.secondary { background: rgba(255,255,255,0.05); }
        .action-circle.hang-up { background: #ef4444; margin-left: 1rem; width: 64px; border-radius: 20px; }
        .action-circle.hang-up:hover { background: #dc2626; box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }

        .error-screen { height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #000; color: white; gap: 1rem; }
      `}</style>
    </div>
  );
}
