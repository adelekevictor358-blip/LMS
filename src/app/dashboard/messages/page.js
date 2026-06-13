"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, Video, MoreVertical } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

export default function StudentMessages() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const contactId = searchParams.get('contactId');
  const { user, messages, sendMessage, markMessagesRead, getAllUsers, startLiveSession } = useStore();
  const allUsers = getAllUsers();

  const contacts = allUsers.filter(u => user?.role === 'student' ? u.role === 'lecturer' : u.role === 'student');

  const [activeContact, setActiveContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (contactId) {
      const contact = contacts.find(c => c.id === contactId);
      if (contact) {
        setActiveContact(contact);
        markMessagesRead(contact.id);
      }
    }
  }, [contactId, contacts, markMessagesRead]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, activeContact]);

  const getConversation = (otherId) =>
    messages.filter(m => (m.from === user?.id && m.to === otherId) || (m.from === otherId && m.to === user?.id))
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

  const getUnread = (otherId) => messages.filter(m => m.from === otherId && m.to === user?.id && !m.read).length;

  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeContact) return;
    sendMessage(activeContact.id, activeContact.name, newMessage.trim());
    setNewMessage('');
  };

  const filteredContacts = contacts.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const conversation = activeContact ? getConversation(activeContact.id) : [];

  return (
    <div className="flex h-[calc(100vh-160px)] gap-6 overflow-hidden animate-fade-in">

      {/* Contact list */}
      <aside className="flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        <header className="border-b border-border p-5">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-semibold tracking-tight text-foreground">
            <MessageSquare size={18} className="text-primary" strokeWidth={1.5} />
            Messages
          </h2>
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" strokeWidth={1.5} />
            <Input
              type="text"
              placeholder="Search staff"
              className="h-10 pl-9"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Search size={28} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">No contacts match your search.</p>
            </div>
          ) : (
            filteredContacts.map(contact => {
              const unread = getUnread(contact.id);
              const conv = getConversation(contact.id);
              const last = conv[conv.length - 1];
              const isActive = activeContact?.id === contact.id;

              return (
                <button
                  key={contact.id}
                  type="button"
                  className={`flex w-full items-center gap-3 border-b border-border p-4 text-left transition-colors last:border-0 hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-inset ${isActive ? 'border-l-2 border-l-primary bg-accent' : ''}`}
                  onClick={() => { setActiveContact(contact); markMessagesRead(contact.id); }}
                >
                  <Avatar className="h-10 w-10 shrink-0 border border-border">
                    <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">{contact.avatar}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="mb-0.5 flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">{contact.name}</span>
                      {unread > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-medium tabular-nums text-primary-foreground">{unread}</span>
                      )}
                    </div>
                    <p className="truncate text-xs font-medium text-muted-foreground">{contact.department || 'Faculty'}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{last ? last.content : 'No messages yet.'}</p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* Conversation */}
      <section className="flex flex-1 flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-sm">
        {!activeContact ? (
          <div className="flex flex-1 flex-col items-center justify-center p-12 text-center">
            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MessageSquare size={28} className="text-muted-foreground" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-lg font-semibold tracking-tight text-foreground">Start a conversation</h3>
            <p className="mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Select a contact from the list to view your messages and reply.</p>
          </div>
        ) : (
          <>
            <header className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border">
                  <AvatarFallback className="bg-brand-green-soft text-sm font-medium uppercase text-brand-green">{activeContact.avatar}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{activeContact.title} {activeContact.name}</h4>
                  <div className="mt-0.5 flex items-center gap-2">
                    <Badge variant="outline" className="h-5 rounded-md border-border px-1.5 text-[10px] font-medium capitalize text-muted-foreground">{activeContact.role}</Badge>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-success">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground" onClick={() => {
                  const sessionId = startLiveSession(activeContact.id);
                  if (sessionId) router.push(`/dashboard/classroom/${sessionId}`);
                }}>
                  <Video size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground">
                  <MoreVertical size={18} />
                </Button>
              </div>
            </header>

            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              {conversation.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <MessageSquare size={28} className="mb-3 text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No messages yet. Say hello to get started.</p>
                </div>
              ) : (
                conversation.map((msg) => {
                  const isMe = msg.from === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`flex max-w-[70%] flex-col gap-1 ${isMe ? 'items-end' : 'items-start'}`}>
                        <div className={`rounded-xl px-4 py-2.5 text-sm leading-relaxed ${isMe ? 'rounded-tr-sm bg-primary text-primary-foreground' : 'rounded-tl-sm border border-border bg-muted text-foreground'}`}>
                          {msg.content}
                        </div>
                        <span className="px-1 text-[10px] font-medium tabular-nums text-muted-foreground">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t border-border p-4">
              <form onSubmit={handleSend} className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="Type your message"
                  className="h-11 flex-1"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                />
                <Button
                  type="submit"
                  size="icon"
                  disabled={!newMessage.trim()}
                  className="h-11 w-11 shrink-0"
                >
                  <Send size={16} />
                </Button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
