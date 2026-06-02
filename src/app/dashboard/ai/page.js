"use client";

import { 
  Pause, SkipForward, Volume2, Maximize, 
  Paperclip, Smile, Send, Share, Bookmark,
  Folder, Image as ImageIcon, Lock, UserPlus, Play
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

export default function LiveClassDashboard() {
  return (
    <div className="live-class-page animate-fade-in">
      <div className="page-header">
        <h1 className="text-3xl font-bold text-[#1e1e2d] tracking-tight">Live class</h1>
      </div>

      <div className="top-section">
        {/* Video Player Area */}
        <div className="video-container">
          <div className="video-header">
            <div className="flex items-center gap-3">
              <span className="live-badge">
                <span className="live-dot"></span> Live
              </span>
              <h2 className="font-bold text-[#1e1e2d] text-lg">Design Patterns</h2>
              <span className="text-slate-400">|</span>
              <span className="text-slate-500 text-sm">by</span>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src="https://i.pravatar.cc/150?u=rachel" />
                  <AvatarFallback>RZ</AvatarFallback>
                </Avatar>
                <span className="font-semibold text-sm">Rachel Zang</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="avatar-group">
                <Avatar className="h-8 w-8 border-2 border-white -ml-2"><AvatarImage src="https://i.pravatar.cc/150?u=1" /></Avatar>
                <Avatar className="h-8 w-8 border-2 border-white -ml-2"><AvatarImage src="https://i.pravatar.cc/150?u=2" /></Avatar>
                <Avatar className="h-8 w-8 border-2 border-white -ml-2"><AvatarImage src="https://i.pravatar.cc/150?u=3" /></Avatar>
                <Avatar className="h-8 w-8 border-2 border-white -ml-2"><AvatarImage src="https://i.pravatar.cc/150?u=4" /></Avatar>
                <div className="h-8 w-8 border-2 border-white -ml-2 rounded-full bg-green-500 flex items-center justify-center text-white text-xs font-bold z-10 relative">
                  +9
                </div>
              </div>
            </div>
          </div>

          <div className="video-player-wrapper">
            <img 
              src="https://images.unsplash.com/photo-1573164713988-8665fc963095?q=80&w=2069&auto=format&fit=crop" 
              alt="Teacher" 
              className="video-poster" 
            />
            <div className="video-controls">
              <div className="flex items-center gap-4">
                <button className="control-btn"><Pause size={18} fill="currentColor" /></button>
                <button className="control-btn"><SkipForward size={18} fill="currentColor" /></button>
                <button className="control-btn"><Volume2 size={18} /></button>
              </div>
              <button className="control-btn"><Maximize size={18} /></button>
            </div>
          </div>
        </div>

        {/* Group Chat */}
        <div className="chat-container">
          <h3 className="font-bold text-[#1e1e2d] mb-4">Group chat</h3>
          
          <ScrollArea className="chat-messages">
            <div className="message-wrapper other">
              <Avatar className="h-8 w-8 shrink-0 mt-1"><AvatarImage src="https://i.pravatar.cc/150?u=5" /></Avatar>
              <div className="message-content">
                <span className="time">14:33</span>
                <div className="bubble">
                  Could you show some examples of what you consider to be the best practice of existing mobile onboardings?
                </div>
              </div>
            </div>

            <div className="message-wrapper other">
              <Avatar className="h-8 w-8 shrink-0 mt-1"><AvatarImage src="https://i.pravatar.cc/150?u=rachel" /></Avatar>
              <div className="message-content">
                <span className="time">14:34</span>
                <div className="bubble">
                  Sure thing! I've saved some for you.
                </div>
              </div>
            </div>

            <div className="message-wrapper self">
              <div className="message-content">
                <span className="time">14:35</span>
                <div className="bubble self-bubble">
                  That's awesome! Thanks!
                </div>
              </div>
              <Avatar className="h-8 w-8 shrink-0 mt-1"><AvatarImage src="https://i.pravatar.cc/150?u=me" /></Avatar>
            </div>
          </ScrollArea>
          
          <div className="chat-input-area">
            <div className="typing-indicator text-xs text-slate-400 mb-2 italic">Mike is typing...</div>
            <div className="input-box">
              <button className="icon-btn"><Paperclip size={18} /></button>
              <button className="icon-btn"><Smile size={18} /></button>
              <input type="text" placeholder="Type a message..." className="flex-1 bg-transparent border-none outline-none text-sm px-2" />
              <button className="icon-btn text-purple-600"><Send size={18} fill="currentColor" /></button>
            </div>
          </div>
        </div>
      </div>

      <div className="bottom-section">
        {/* Content Column */}
        <div className="bottom-col">
          <h3 className="font-bold text-[#1e1e2d] mb-4">Content</h3>
          <div className="content-timeline">
            <div className="timeline-item">
              <div className="timeline-icon bg-yellow-100 text-yellow-600"><Folder size={16} /></div>
              <div className="timeline-text flex-1 font-semibold text-sm">Introduction</div>
              <div className="timeline-time text-xs text-slate-400">2 min</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-green-100 text-green-600"><ImageIcon size={16} /></div>
              <div className="timeline-text flex-1 font-semibold text-sm">Landing Page</div>
              <div className="timeline-time text-xs text-slate-400">15 min</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-blue-100 text-blue-600"><Lock size={16} /></div>
              <div className="timeline-text flex-1 font-semibold text-sm">Login & Signup</div>
              <div className="timeline-time text-xs text-slate-400">20 min</div>
            </div>
            <div className="timeline-item">
              <div className="timeline-icon bg-orange-100 text-orange-600"><UserPlus size={16} /></div>
              <div className="timeline-text flex-1 font-semibold text-sm text-slate-400">User Onboarding</div>
              <div className="timeline-time text-xs text-slate-400">18 min</div>
            </div>
          </div>
        </div>

        {/* Resources Column */}
        <div className="bottom-col">
          <h3 className="font-bold text-[#1e1e2d] mb-4">Resources</h3>
          <div className="resources-list">
            <div className="resource-item">
              <div className="resource-number">01</div>
              <div className="resource-info">
                <div className="font-semibold text-sm">LP Design inspirations</div>
                <div className="text-xs text-slate-400">100+ real cases</div>
              </div>
              <button className="share-btn"><Share size={14} /></button>
            </div>
            <div className="resource-item">
              <div className="resource-number">02</div>
              <div className="resource-info">
                <div className="font-semibold text-sm">Mobile Design Patterns</div>
                <div className="text-xs text-slate-400">Best practices used worldwide</div>
              </div>
              <button className="share-btn"><Share size={14} /></button>
            </div>
            <div className="resource-item">
              <div className="resource-number bg-purple-100 text-purple-600">03</div>
              <div className="resource-info">
                <div className="font-semibold text-sm">Micro-interactions</div>
                <div className="text-xs text-slate-400">200 inspirational designs</div>
              </div>
              <button className="share-btn"><Share size={14} /></button>
            </div>
            <div className="resource-item">
              <div className="resource-number">04</div>
              <div className="resource-info">
                <div className="font-semibold text-sm">How to increase website conversion</div>
                <div className="text-xs text-slate-400">Practical advices</div>
              </div>
              <button className="share-btn"><Share size={14} /></button>
            </div>
          </div>
        </div>

        {/* Previous Class Records Column */}
        <div className="bottom-col">
          <h3 className="font-bold text-[#1e1e2d] mb-4">Previous class records</h3>
          <div className="records-list">
            <div className="record-item">
              <div className="record-thumb">
                <img src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=2070&auto=format&fit=crop" alt="Thumb" />
                <div className="play-overlay"><Play size={12} fill="currentColor" /></div>
              </div>
              <div className="record-info">
                <div className="font-semibold text-sm">Design Accessibility</div>
                <div className="text-xs text-slate-400 mt-1">05.01.2023</div>
              </div>
              <button className="bookmark-btn"><Bookmark size={16} /></button>
            </div>
            <div className="record-item">
              <div className="record-thumb">
                <img src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=2069&auto=format&fit=crop" alt="Thumb" />
                <div className="play-overlay"><Play size={12} fill="currentColor" /></div>
              </div>
              <div className="record-info">
                <div className="font-semibold text-sm">UX Research</div>
                <div className="text-xs text-slate-400 mt-1">04.01.2023</div>
              </div>
              <button className="bookmark-btn"><Bookmark size={16} /></button>
            </div>
            <div className="record-item">
              <div className="record-thumb">
                <img src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop" alt="Thumb" />
                <div className="play-overlay"><Play size={12} fill="currentColor" /></div>
              </div>
              <div className="record-info">
                <div className="font-semibold text-sm">Wireframing</div>
                <div className="text-xs text-slate-400 mt-1">04.01.2023</div>
              </div>
              <button className="bookmark-btn"><Bookmark size={16} /></button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .live-class-page {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          height: 100%;
        }

        .page-header {
          margin-bottom: 0.5rem;
        }

        .top-section {
          display: grid;
          grid-template-columns: 2.2fr 1fr;
          gap: 2rem;
          min-height: 400px;
        }

        /* ── Video Player Area ── */
        .video-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .video-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .live-badge {
          background: #ff4757;
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.3rem;
          text-transform: uppercase;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          background: white;
          border-radius: 50%;
          animation: pulse 1.5s infinite;
        }

        .avatar-group {
          display: flex;
          align-items: center;
        }

        .avatar-group > * {
          position: relative;
        }

        .video-player-wrapper {
          position: relative;
          width: 100%;
          height: 380px;
          border-radius: 20px;
          overflow: hidden;
          background: #000;
        }

        .video-poster {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .video-controls {
          position: absolute;
          bottom: 1.5rem;
          left: 1.5rem;
          right: 1.5rem;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .control-btn {
          color: white;
          background: transparent;
          border: none;
          cursor: pointer;
          opacity: 0.9;
          transition: opacity 0.2s;
        }

        .control-btn:hover {
          opacity: 1;
        }

        /* ── Group Chat ── */
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .chat-messages {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-right: 1rem;
          margin-bottom: 1rem;
        }

        .message-wrapper {
          display: flex;
          gap: 0.75rem;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .message-wrapper.self {
          justify-content: flex-end;
        }

        .message-content {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          max-width: 80%;
        }

        .message-wrapper.self .message-content {
          align-items: flex-end;
        }

        .time {
          font-size: 0.65rem;
          color: #94a3b8;
          padding: 0 0.25rem;
        }

        .bubble {
          padding: 0.75rem 1rem;
          border-radius: 14px;
          font-size: 0.85rem;
          line-height: 1.4;
          background: #f1f5f9;
          color: #334155;
          border-top-left-radius: 4px;
        }

        .self-bubble {
          background: #e0e7ff;
          color: #3730a3;
          border-top-left-radius: 14px;
          border-top-right-radius: 4px;
        }

        .chat-input-area {
          margin-top: auto;
        }

        .input-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          border-radius: 12px;
        }

        .icon-btn {
          color: #94a3b8;
          padding: 0.4rem;
          border-radius: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          background: #e2e8f0;
          color: #475569;
        }

        /* ── Bottom Section ── */
        .bottom-section {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2rem;
          margin-top: 1rem;
        }

        .bottom-col {
          display: flex;
          flex-direction: column;
        }

        /* Content Timeline */
        .content-timeline {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          position: relative;
        }

        .content-timeline::before {
          content: '';
          position: absolute;
          left: 15px;
          top: 30px;
          bottom: 20px;
          width: 1px;
          background: #e2e8f0;
          z-index: 0;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          z-index: 1;
        }

        .timeline-icon {
          width: 32px;
          height: 32px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 2px solid white;
        }

        /* Resources List */
        .resources-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .resource-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem;
          border-radius: 12px;
          background: #f8fafc;
          transition: background 0.2s;
        }

        .resource-item:hover {
          background: #f1f5f9;
        }

        .resource-number {
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: #e2e8f0;
          color: #64748b;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.85rem;
        }

        .resource-info {
          flex: 1;
        }

        .share-btn {
          color: #94a3b8;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        .share-btn:hover { color: #64748b; }

        /* Records List */
        .records-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .record-item {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .record-thumb {
          width: 90px;
          height: 60px;
          border-radius: 8px;
          overflow: hidden;
          position: relative;
        }

        .record-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .play-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .play-overlay > * {
          background: rgba(255,255,255,0.2);
          padding: 0.4rem;
          border-radius: 50%;
          backdrop-filter: blur(4px);
        }

        .record-info {
          flex: 1;
        }

        .bookmark-btn {
          color: #cbd5e1;
          background: transparent;
          border: none;
          cursor: pointer;
          padding: 0.5rem;
        }
        .bookmark-btn:hover { color: #94a3b8; }

        @media (max-width: 1024px) {
          .top-section {
            grid-template-columns: 1fr;
          }
          .bottom-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
