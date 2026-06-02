"use client";

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Search, Video, Smile, Paperclip, MoreVertical, ShieldCheck, User } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useStore } from '@/store/useStore';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from "@/components/ui/card";

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
    <div className="flex h-[calc(100vh-160px)] gap-6 animate-in fade-in duration-500 overflow-hidden">
      
      {/* Sidebar List */}
      <div className="w-80 flex flex-col bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
        <div className="p-6 border-b">
           <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white mb-4">
              <MessageSquare className="text-blue-600" size={20} /> Messages
           </h2>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search staff..." 
                className="w-full h-10 pl-10 pr-4 bg-slate-50 dark:bg-slate-800 border rounded-xl text-sm outline-none focus:border-blue-600 transition-all"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto">
           {filteredContacts.map(contact => {
             const unread = getUnread(contact.id);
             const conv = getConversation(contact.id);
             const last = conv[conv.length - 1];
             const isActive = activeContact?.id === contact.id;

             return (
               <div
                 key={contact.id}
                 className={`flex items-center gap-4 p-4 cursor-pointer border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all ${isActive ? 'bg-blue-50/50 dark:bg-blue-900/10 border-l-4 border-l-blue-600' : ''}`}
                 onClick={() => { setActiveContact(contact); markMessagesRead(contact.id); }}
               >
                 <Avatar className="h-10 w-10 shrink-0 border border-slate-200">
                    <AvatarFallback className="bg-slate-100 text-slate-700 text-xs font-bold">{contact.avatar}</AvatarFallback>
                 </Avatar>
                 <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                       <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{contact.name}</span>
                       {unread > 0 && <span className="h-4 w-4 bg-blue-600 text-white rounded-full flex items-center justify-center text-[10px] font-bold">{unread}</span>}
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight truncate">{contact.department || 'Faculty'}</p>
                    <p className="text-[11px] text-slate-500 font-medium truncate mt-1">{last ? last.content : 'No messages yet.'}</p>
                 </div>
               </div>
             );
           })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-900 border rounded-2xl overflow-hidden shadow-sm">
        {!activeContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12 opacity-40">
             <div className="h-24 w-24 bg-blue-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={40} className="text-blue-400" />
             </div>
             <h3 className="text-xl font-bold text-slate-900 dark:text-white">Start a Conversation</h3>
             <p className="text-sm text-slate-500 mt-2 max-w-sm">Select a contact from the list to synchronize your communications and academic frequencies.</p>
          </div>
        ) : (
          <>
            <div className="p-4 border-b flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
               <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                     <AvatarFallback className="bg-blue-600 text-white font-bold text-sm uppercase">{activeContact.avatar}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{activeContact.title} {activeContact.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase">
                       <Badge variant="outline" className="h-4 border-blue-600/20 text-blue-600 bg-blue-600/5 text-[8px]">{activeContact.role}</Badge>
                       <span>•</span>
                       <span className="text-green-500 font-bold">Online</span>
                    </div>
                  </div>
               </div>
               <div className="flex gap-2">
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-blue-600" onClick={() => {
                     const sessionId = startLiveSession(activeContact.id);
                     router.push(`/dashboard/classroom/${sessionId}`);
                  }}>
                     <Video size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-400">
                     <MoreVertical size={18} />
                  </Button>
               </div>
            </div>
            
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
               {conversation.map((msg, i) => {
                 const isMe = msg.from === user?.id;
                 return (
                   <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                         <div className={`p-3 px-4 rounded-2xl text-sm font-medium shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-tl-none'}`}>
                            {msg.content}
                         </div>
                         <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight px-1">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                   </div>
                 );
               })}
               <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t">
               <form onSubmit={handleSend} className="flex gap-3 items-center">
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 shrink-0">
                     <Smile size={20} />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-slate-400 shrink-0">
                     <Paperclip size={20} />
                  </Button>
                  <div className="relative flex-1">
                     <input
                        type="text"
                        placeholder="Type your message here..."
                        className="w-full h-11 pl-4 pr-12 bg-slate-50 dark:bg-slate-800 border rounded-xl outline-none focus:border-blue-600 transition-all text-sm font-medium"
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                     />
                     <Button 
                        type="submit" 
                        disabled={!newMessage.trim()} 
                        className="absolute right-1 top-1 h-9 w-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md disabled:opacity-30 p-0"
                     >
                        <Send size={16} />
                     </Button>
                  </div>
               </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
