"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { MessageSquare, Send, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

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
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-6 h-[calc(100vh-180px)] min-h-[500px] animate-fade-in">
      {/* Contacts sidebar */}
      <aside className="flex flex-col overflow-hidden bg-card text-card-foreground border border-border rounded-xl shadow-sm">
        <header className="px-5 py-4 border-b border-border">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
            <MessageSquare size={18} className="text-muted-foreground" />
            Messages
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">Chat with your students</p>
        </header>

        <div className="flex items-center gap-2 px-4 py-3 border-b border-border text-muted-foreground focus-within:text-foreground">
          <Search size={16} />
          <input
            type="text"
            placeholder="Search students"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredStudents.length === 0 ? (
            <p className="px-5 py-6 text-sm text-muted-foreground text-pretty">No students found.</p>
          ) : (
            filteredStudents.map(student => {
              const unread = getUnread(student.id);
              const conv = getConversation(student.id);
              const last = conv[conv.length - 1];
              const isActive = activeContact?.id === student.id;
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => handleSelect(student)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left border-b border-border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    isActive
                      ? 'bg-accent border-l-2 border-l-primary'
                      : 'hover:bg-accent border-l-2 border-l-transparent'
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                    {student.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{student.name}</span>
                      {unread > 0 && (
                        <span className="shrink-0 rounded-full bg-primary px-1.5 py-0.5 text-[0.625rem] font-semibold tabular-nums text-primary-foreground">
                          {unread}
                        </span>
                      )}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {last ? last.content.slice(0, 35) + '...' : 'No messages yet'}
                    </span>
                  </span>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Chat area */}
      <section className="flex flex-col overflow-hidden bg-card text-card-foreground border border-border rounded-xl shadow-sm">
        {!activeContact ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <MessageSquare size={40} strokeWidth={1.5} className="text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground text-balance">Select a student to start messaging</h3>
            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
              Choose a student from the left panel to view or start a conversation.
            </p>
          </div>
        ) : (
          <>
            <header className="flex items-center gap-3 px-5 py-4 border-b border-border">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {activeContact.avatar}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{activeContact.name}</p>
                <p className="truncate text-xs text-muted-foreground">{activeContact.matNo} · {activeContact.department}</p>
              </div>
            </header>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-6">
              {conversation.length === 0 ? (
                <p className="m-auto text-center text-sm text-muted-foreground text-pretty">No messages yet. Say hello.</p>
              ) : (
                conversation.map(msg => {
                  const sent = msg.from === user.id;
                  return (
                    <div key={msg.id} className={`flex max-w-[65%] flex-col ${sent ? 'self-end items-end' : 'self-start items-start'}`}>
                      <div
                        className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${
                          sent
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-muted text-foreground rounded-bl-sm'
                        }`}
                      >
                        {msg.content}
                      </div>
                      <span className="mt-1 text-[0.6875rem] tabular-nums text-muted-foreground">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  );
                })
              )}
            </div>

            <form onSubmit={handleSend} className="flex items-center gap-3 px-5 py-4 border-t border-border">
              <input
                type="text"
                placeholder={`Message ${activeContact.name}`}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                className="h-10 flex-1 rounded-md border border-input bg-transparent px-4 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <Button type="submit" size="icon" disabled={!newMessage.trim()} aria-label="Send message">
                <Send size={16} />
              </Button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}
