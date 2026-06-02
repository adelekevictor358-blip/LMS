"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { MessageSquare, Send, Search } from 'lucide-react';

export default function LecturerMessages() {
  const { user, messages, sendMessage, markMessagesRead, getAllUsers } = useStore();
  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'student');
  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');

  const getConversation = (otherId) =>
    messages.filter(m => (m.from === user.id && m.to === otherId) || (m.from === otherId && m.to === user.id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const getUnread = (otherId) => messages.filter(m => m.from === otherId && m.to === user.id && !m.read).length;

  const handleSelect = (student) => {
    setActiveContact(student);
    markMessagesRead(student.id);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;
    sendMessage(activeContact.id, activeContact.name, newMessage.trim());
    setNewMessage('');
  };

  const filteredStudents = students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
  const conversation = activeContact ? getConversation(activeContact.id) : [];

  return (
    <div className="messages-layout animate-fade-in">
      {/* Contacts Sidebar */}
      <div className="contacts-panel glass-panel">
        <div className="contacts-header">
          <h3><MessageSquare size={18} /> Messages</h3>
          <p>Chat with your students</p>
        </div>
        <div className="search-bar">
          <Search size={15} />
          <input type="text" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="contacts-list">
          {filteredStudents.map(student => {
            const unread = getUnread(student.id);
            const conv = getConversation(student.id);
            const last = conv[conv.length - 1];
            return (
              <div
                key={student.id}
                className={`contact-item ${activeContact?.id === student.id ? 'active' : ''}`}
                onClick={() => handleSelect(student)}
              >
                <div className="contact-avatar">{student.avatar}</div>
                <div className="contact-info">
                  <div className="contact-name-row">
                    <strong>{student.name}</strong>
                    {unread > 0 && <span className="unread-badge">{unread}</span>}
                  </div>
                  <span className="contact-last">{last ? last.content.slice(0, 35) + '...' : 'No messages yet'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area glass-panel">
        {!activeContact ? (
          <div className="chat-empty">
            <MessageSquare size={48} />
            <h3>Select a student to start messaging</h3>
            <p>Click on a student from the left panel to view or start a conversation.</p>
          </div>
        ) : (
          <>
            <div className="chat-header">
              <div className="contact-avatar">{activeContact.avatar}</div>
              <div>
                <strong>{activeContact.name}</strong>
                <span>{activeContact.matNo} · {activeContact.department}</span>
              </div>
            </div>
            <div className="chat-messages">
              {conversation.length === 0 ? (
                <div className="no-messages">No messages yet. Say hello! 👋</div>
              ) : (
                conversation.map(msg => (
                  <div key={msg.id} className={`message-bubble ${msg.from === user.id ? 'sent' : 'received'}`}>
                    <div className="bubble-content">{msg.content}</div>
                    <span className="bubble-time">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))
              )}
            </div>
            <form onSubmit={handleSend} className="chat-input-bar">
              <input
                type="text"
                placeholder={`Message ${activeContact.name}...`}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary send-btn" disabled={!newMessage.trim()}>
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>

      <style jsx>{`
        .messages-layout { display: grid; grid-template-columns: 300px 1fr; gap: 1.5rem; height: calc(100vh - 180px); min-height: 500px; }

        .contacts-panel { display: flex; flex-direction: column; overflow: hidden; }
        .contacts-header { padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--card-border); }
        .contacts-header h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1rem; margin-bottom: 0.2rem; }
        .contacts-header p { font-size: 0.78rem; color: var(--text-muted); }

        .search-bar { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.25rem; border-bottom: 1px solid var(--card-border); color: var(--text-muted); }
        .search-bar input { flex: 1; border: none; background: transparent; color: var(--text-main); font-family: inherit; font-size: 0.88rem; outline: none; }

        .contacts-list { flex: 1; overflow-y: auto; }
        .contact-item { display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.25rem; cursor: pointer; transition: background 0.2s; border-bottom: 1px solid var(--card-border); }
        .contact-item:hover, .contact-item.active { background: var(--nav-active); }
        .contact-item.active { border-left: 3px solid var(--primary); }
        .contact-avatar { width: 38px; height: 38px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.82rem; font-weight: 700; flex-shrink: 0; }
        .contact-info { flex: 1; min-width: 0; }
        .contact-name-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.2rem; }
        .contact-name-row strong { font-size: 0.88rem; color: var(--text-main); }
        .unread-badge { background: var(--primary); color: white; font-size: 0.62rem; font-weight: 700; padding: 0.1rem 0.4rem; border-radius: 10px; }
        .contact-last { font-size: 0.76rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }

        .chat-area { display: flex; flex-direction: column; overflow: hidden; }
        .chat-empty { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); text-align: center; padding: 2rem; }
        .chat-empty h3 { font-size: 1.1rem; color: var(--text-main); }

        .chat-header { display: flex; align-items: center; gap: 1rem; padding: 1.25rem 1.5rem; border-bottom: 1px solid var(--card-border); }
        .chat-header strong { display: block; font-size: 0.95rem; color: var(--text-main); }
        .chat-header span { font-size: 0.78rem; color: var(--text-muted); }

        .chat-messages { flex: 1; overflow-y: auto; padding: 1.5rem; display: flex; flex-direction: column; gap: 0.85rem; }
        .no-messages { text-align: center; color: var(--text-muted); font-size: 0.9rem; margin: auto; }

        .message-bubble { display: flex; flex-direction: column; max-width: 65%; }
        .message-bubble.sent { align-self: flex-end; align-items: flex-end; }
        .message-bubble.received { align-self: flex-start; align-items: flex-start; }
        .bubble-content { padding: 0.75rem 1rem; border-radius: 12px; font-size: 0.9rem; line-height: 1.5; }
        .sent .bubble-content { background: var(--primary); color: white; border-bottom-right-radius: 4px; }
        .received .bubble-content { background: rgba(0,0,0,0.06); color: var(--text-main); border-bottom-left-radius: 4px; }
        [data-theme='dark'] .received .bubble-content { background: rgba(255,255,255,0.08); }
        .bubble-time { font-size: 0.68rem; color: var(--text-muted); margin-top: 0.25rem; }

        .chat-input-bar { display: flex; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid var(--card-border); }
        .chat-input-bar input { flex: 1; padding: 0.75rem 1rem; border-radius: 20px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.6); color: var(--text-main); font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s; }
        [data-theme='dark'] .chat-input-bar input { background: rgba(17,24,39,0.5); }
        .chat-input-bar input:focus { outline: none; border-color: var(--primary); }
        .send-btn { width: 42px; height: 42px; border-radius: 50%; padding: 0; }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>
    </div>
  );
}
