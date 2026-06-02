"use client";

import { useStore } from '@/store/useStore';
import { Mail, CheckCircle2, ShieldAlert, Clock, Inbox as InboxIcon } from 'lucide-react';
import { useState } from 'react';

export default function Inbox() {
  const { notifications, markNotificationRead } = useStore();
  const [selectedMsg, setSelectedMsg] = useState(notifications[0] || null);

  const handleSelect = (msg) => {
    setSelectedMsg(msg);
    if (!msg.read) markNotificationRead(msg.id);
  };

  return (
    <div className="inbox-page animate-fade-in">
      <div className="inbox-header">
        <h2><InboxIcon size={28} /> University Communications</h2>
        <p>Official announcements, academic alerts, and scheduled broadcasts.</p>
      </div>

      <div className="inbox-container glass-panel">
        <div className="message-list">
          {notifications.map(msg => (
            <div 
              key={msg.id} 
              className={`message-item ${!msg.read ? 'unread' : ''} ${selectedMsg?.id === msg.id ? 'active' : ''}`}
              onClick={() => handleSelect(msg)}
            >
              <div className="msg-icon">
                {msg.isUrgent ? <ShieldAlert size={18} color="var(--danger)" /> : <Mail size={18} />}
              </div>
              <div className="msg-preview">
                <div className="msg-preview-header">
                  <h5>{msg.isUrgent ? 'URGENT NOTIFICATION' : 'Official Notice'}</h5>
                  <span>{msg.time}</span>
                </div>
                <p>{msg.text.substring(0, 40)}{msg.text.length > 40 ? '...' : ''}</p>
              </div>
              {!msg.read && <div className="unread-dot"></div>}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="empty-state">
              <CheckCircle2 size={32} />
              <p>You're all caught up!</p>
            </div>
          )}
        </div>

        <div className="message-reader">
          {selectedMsg ? (
            <div className="reader-content">
              <div className="reader-header">
                <h3>{selectedMsg.isUrgent ? 'URGENT NOTIFICATION' : 'Official Notice'}</h3>
                <div className="reader-meta">
                  <span><Clock size={14}/> Received: {selectedMsg.time}</span>
                  <span className="sender">From: IT Administration</span>
                </div>
              </div>
              <div className="reader-body">
                <p>{selectedMsg.text}</p>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <Mail size={48} color="var(--text-muted)" />
              <p>Select a message to read.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .inbox-page {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .inbox-header {
          margin-bottom: 1.5rem;
        }

        .inbox-header h2 {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          color: var(--text-main);
        }

        .inbox-header p {
          color: var(--text-muted);
          margin-top: 0.25rem;
        }

        .inbox-container {
          display: flex;
          flex: 1;
          height: 600px;
          overflow: hidden;
        }

        .message-list {
          width: 350px;
          border-right: 1px solid var(--card-border);
          overflow-y: auto;
          background: rgba(255, 255, 255, 0.4);
        }
        :global([data-theme='dark']) .message-list {
          background: rgba(17, 24, 39, 0.4);
        }

        .message-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          padding: 1.25rem 1rem;
          border-bottom: 1px solid var(--card-border);
          cursor: pointer;
          transition: background 0.2s;
          position: relative;
        }

        .message-item:hover {
          background: rgba(0, 121, 107, 0.05);
        }
        :global([data-theme='dark']) .message-item:hover {
          background: rgba(38, 166, 154, 0.1);
        }

        .message-item.active {
          background: var(--nav-active);
          border-left: 4px solid var(--primary);
        }

        .msg-icon {
          color: var(--text-muted);
          margin-top: 0.15rem;
        }

        .message-item.unread .msg-icon {
          color: var(--primary);
        }

        .msg-preview {
          flex: 1;
        }

        .msg-preview-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.35rem;
        }

        .msg-preview-header h5 {
          font-size: 0.85rem;
          color: var(--text-main);
          font-weight: 600;
        }

        .message-item.unread .msg-preview-header h5 {
          color: var(--primary);
          font-weight: 700;
        }

        .msg-preview-header span {
          font-size: 0.7rem;
          color: var(--text-muted);
        }

        .msg-preview p {
          font-size: 0.85rem;
          color: var(--text-muted);
          line-height: 1.4;
        }

        .message-item.unread .msg-preview p {
          color: var(--text-main);
          font-weight: 500;
        }

        .unread-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: var(--primary);
          position: absolute;
          right: 1rem;
          top: 50%;
          transform: translateY(-50%);
        }

        .message-reader {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--card-bg);
        }

        .reader-content {
          padding: 2.5rem;
          height: 100%;
        }

        .reader-header {
          border-bottom: 1px solid var(--card-border);
          padding-bottom: 1.5rem;
          margin-bottom: 1.5rem;
        }

        .reader-header h3 {
          font-size: 1.4rem;
          color: var(--text-main);
          margin-bottom: 0.5rem;
        }

        .reader-meta {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
        }

        .reader-meta span {
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .sender {
          font-weight: 600;
          color: var(--primary);
        }

        .reader-body {
          font-size: 1rem;
          line-height: 1.7;
          color: var(--text-main);
          white-space: pre-wrap;
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          gap: 1rem;
          color: var(--text-muted);
        }

        .message-list::-webkit-scrollbar {
          width: 6px;
        }
        .message-list::-webkit-scrollbar-thumb {
          background: var(--card-border);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
}
