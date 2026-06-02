"use client";

import { useState, useRef, useEffect } from 'react';
import { Sparkles, X, Send, User, RotateCcw, Bot, BookOpen, Clock, Award, PlayCircle, Volume2, Image as ImageIcon } from 'lucide-react';


import { useStore } from '@/store/useStore';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, courses, assignments, submissions, quizzes, quizResults, materials, notifications, library } = useStore();
  
  // Derive this student's enrolled courses
  const enrolledCourses = user?.enrolledCourseIds?.length
    ? courses.filter(c => user.enrolledCourseIds.includes(c.id))
    : courses.filter(c => c.program === user?.program && c.level === user?.level);

  const enrolledCourseIds = enrolledCourses.map(c => c.id);

  const [messages, setMessages] = useState([
    { 
      sender: 'bot', 
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your Academic Chatbot — powered by Mistral AI and trained on your live academic data. I can see you're enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''}. How can I help your studies today?` 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);


  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isTyping]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.trim());
  };

  const sendMessage = async (userText) => {
    const newUserMessage = { 
      sender: 'user', 
      text: userText, 
      image: selectedImage // Include base64 if available
    };
    setMessages(prev => [...prev, newUserMessage]);
    setInput('');
    setSelectedImage(null);
    setIsTyping(true);

    // Build rich per-student context for Mistral
    const activeAssignments = assignments.filter(
      a => (enrolledCourseIds.includes(a.courseId) || enrolledCourseIds.length === 0) && a.status === 'active'
    );
    const studentSubmissions = submissions.filter(s => s.studentId === user?.id);
    const studentQuizResults = quizResults.filter(r => r.studentId === user?.id);
    const courseMaterials = materials.filter(m => enrolledCourseIds.includes(m.courseId));

    try {
      const context = {
        userName: user?.name || 'Student',
        program: user?.program || 'N/A',
        level: user?.level || 'N/A',
        courses: enrolledCourses.map(c => ({
          code: c.code, title: c.title, units: c.units, semester: c.semester,
        })),
        assignments: activeAssignments.map(a => ({
          courseId: a.courseId, title: a.title, dueDate: a.dueDate, maxScore: a.maxScore,
        })),
        submissions: studentSubmissions.map(s => ({
          assignmentId: s.assignmentId, score: s.score,
        })),
        quizResults: studentQuizResults.map(r => ({
          quizId: r.quizId, score: r.score,
        })),
        quizzes: quizzes.map(q => ({
          id: q.id, title: q.title, questionCount: q.questions?.length,
        })),
        materials: courseMaterials.map(m => ({
          courseId: m.courseId, title: m.title, type: m.type,
        })),
      };

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          context
        })
      });


      const data = await response.json();
      
      setIsTyping(false);
      if (data.text) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.text }]);
      } else {
        setMessages(prev => [...prev, { sender: 'bot', text: "I'm experiencing a temporary scholarly disconnect. Please ensure your API credentials are configured in the environment." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Apologies, I encountered an error while processing your request. Please try again shortly." }]);
    }
  };

  const suggestions = [
    "What are my upcoming deadlines?",
    "Show me recommended materials",
    "How is my academic progress?",
    "Explain course registration"
  ];


  return (
    <>
      {/* Floating Action Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <Sparkles size={24} className="gemini-sparkle" />
      </button>

      {/* Chat Window */}
      <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="header-info">
            <div className="chatbot-logo">
              <Sparkles size={16} color="white" />
            </div>
            <div className="title-stack">
              <span>Academic Chatbot</span>
              <small>Powered by Mistral AI</small>
            </div>
          </div>
          <div className="header-actions">
            <button className="header-icon-btn" onClick={() => setMessages([{ sender: 'bot', text: `New session started. I'm analysing your latest academic data, ${user?.name?.split(' ')[0] || 'there'}. How can I help?` }])}>
              <RotateCcw size={16} />
            </button>
            <button className="close-btn" onClick={() => setIsOpen(false)}>
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`message-bubble ${msg.sender}`}>
              {msg.sender === 'bot' && <div className="avatar bot-avatar"><Bot size={14}/></div>}
              <div className="text">
                {msg.text.includes('IMAGE_GENERATED:') ? (
                  <div className="generated-image-container">
                    <p className="mb-3 font-semibold text-blue-600">Visual Aid Generated:</p>
                    <img 
                      src={msg.text.split('IMAGE_GENERATED:')[1].trim()} 
                      alt="AI Visual Aid" 
                      className="rounded-xl shadow-lg hover:scale-[1.02] transition-transform cursor-zoom-in"
                    />
                  </div>
                ) : (
                  <>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i}>{line}</p>
                    ))}
                    {msg.sender === 'bot' && (
                      <button 
                        className="mt-2 text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 text-[10px] uppercase font-black tracking-widest"
                        onClick={() => {
                          const utterance = new SpeechSynthesisUtterance(msg.text);
                          window.speechSynthesis.speak(utterance);
                        }}
                      >
                        <Volume2 size={12} /> Listen to Briefing
                      </button>
                    )}
                  </>
                )}
              </div>


              {msg.sender === 'user' && <div className="avatar user-avatar"><User size={14}/></div>}
            </div>
          ))}
          {isTyping && (
            <div className="message-bubble bot typing">
              <div className="avatar bot-avatar"><Bot size={14}/></div>
              <div className="text typing-indicator">
                <span></span><span></span><span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="suggestions-area">
          {selectedImage && (
            <div className="image-preview-container animate-in zoom-in duration-200">
              <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded-lg border-2 border-blue-500" />
              <button onClick={() => setSelectedImage(null)} className="preview-remove">×</button>
            </div>
          )}
          {messages.length < 5 && !selectedImage && (
            <div className="chips">
              {suggestions.map((text, i) => (
                <button key={i} className="chip" onClick={() => sendMessage(text)}>
                  {text}
                </button>
              ))}
            </div>
          )}
        </div>

        <form className="chat-input" onSubmit={handleSend}>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setSelectedImage(reader.result);
                reader.readAsDataURL(file);
              }
            }}
          />
          <button type="button" className="upload-btn" onClick={() => fileInputRef.current.click()}>
            <ImageIcon size={18} />
          </button>
          <input 
            type="text" 
            placeholder={selectedImage ? "Describe this image..." : "Ask anything about your studies..."} 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" disabled={(!input.trim() && !selectedImage) || isTyping}>
            <Send size={16} />
          </button>
        </form>

      </div>

      <style jsx>{`
        .chatbot-toggle {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          width: 64px;
          height: 64px;
          border-radius: 22px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          color: white;
          border: none;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .chatbot-toggle:hover { transform: scale(1.1) rotate(5deg); }
        .chatbot-toggle.hidden { transform: scale(0); opacity: 0; pointer-events: none; }

        .chatbot-window {
          position: fixed;
          bottom: 2.5rem;
          right: 2.5rem;
          width: 400px;
          height: 600px;
          background: #ffffff;
          border-radius: 24px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          z-index: 1001;
          transform-origin: bottom right;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          overflow: hidden;
          opacity: 0;
          transform: scale(0.9) translateY(20px);
          pointer-events: none;
        }

        :global([data-theme='dark']) .chatbot-window { background: #1a1a1b; border: 1px solid #333; }

        .chatbot-window.open { opacity: 1; transform: scale(1) translateY(0); pointer-events: all; }

        .chat-header {
          padding: 1.5rem;
          background: linear-gradient(135deg, #0f172a 0%, #334155 100%);
          color: white;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-info { display: flex; align-items: center; gap: 0.75rem; }
        .chatbot-logo { width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .title-stack { display: flex; flex-direction: column; }
        .title-stack span { font-weight: 700; font-size: 1rem; }
        .title-stack small { font-size: 0.7rem; opacity: 0.8; }

        .header-actions { display: flex; gap: 0.5rem; }
        .header-icon-btn, .close-btn { background: transparent; border: none; color: white; opacity: 0.7; cursor: pointer; transition: 0.2s; padding: 0.4rem; border-radius: 8px; }
        .header-icon-btn:hover, .close-btn:hover { opacity: 1; background: rgba(255,255,255,0.15); }

        .chat-body { flex: 1; padding: 1.5rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; }
        :global([data-theme='dark']) .chat-body { background: #0f0f10; }

        .message-bubble { display: flex; gap: 0.75rem; max-width: 85%; }
        .message-bubble.user { margin-left: auto; flex-direction: row-reverse; }

        .avatar { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .bot-avatar { background: #eff6ff; color: #1a73e8; }
        .user-avatar { background: #4b5563; color: white; }

        .text { padding: 0.85rem 1.1rem; border-radius: 18px; font-size: 0.9rem; line-height: 1.5; color: #1e293b; background: white; border: 1px solid #e2e8f0; }
        :global([data-theme='dark']) .text { background: #262627; color: #f1f5f9; border-color: #333; }
        .message-bubble.user .text { background: #1a73e8; color: white; border: none; border-bottom-right-radius: 4px; }
        .message-bubble.bot .text { border-bottom-left-radius: 4px; }
        .generated-image-container { margin: 0.5rem 0; max-width: 100%; }
        .generated-image-container img { max-width: 100%; height: auto; display: block; border: 2px solid #e2e8f0; }
        :global([data-theme='dark']) .generated-image-container img { border-color: #333; }


        .typing-indicator { display: flex; gap: 4px; padding: 0.8rem 1.2rem; }
        .typing-indicator span { width: 6px; height: 6px; background: #94a3b8; border-radius: 50%; animation: blink 1.4s infinite both; }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

        @keyframes blink { 0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.2); } }

        .suggestions-area { padding: 0 1.5rem 1rem; background: #f8fafc; }
        :global([data-theme='dark']) .suggestions-area { background: #0f0f10; }
        .chips { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .chip { padding: 0.5rem 0.85rem; background: white; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 0.75rem; color: #64748b; cursor: pointer; transition: 0.2s; }
        :global([data-theme='dark']) .chip { background: #262627; border-color: #333; color: #94a3b8; }
        .chip:hover { border-color: #1a73e8; color: #1a73e8; background: #f0f7ff; }

        .chat-input { padding: 1.25rem 1.5rem; background: white; border-top: 1px solid #e2e8f0; display: flex; gap: 0.75rem; }
        :global([data-theme='dark']) .chat-input { background: #1a1a1b; border-color: #333; }
        .chat-input input { flex: 1; border: none; background: #f1f5f9; color: #1e293b; padding: 0.75rem 1.25rem; border-radius: 14px; font-size: 0.9rem; }
        :global([data-theme='dark']) .chat-input input { background: #0f0f10; color: white; }
        .chat-input input:focus { outline: 2px solid #1a73e8; }
        .upload-btn { background: transition: 0.2s; color: #64748b; padding: 0.5rem; border-radius: 10px; cursor: pointer; border: none; background: transparent; }
        .upload-btn:hover { background: #f1f5f9; color: #1a73e8; }
        .image-preview-container { position: relative; margin-bottom: 0.75rem; display: inline-block; }
        .preview-remove { position: absolute; top: -8px; right: -8px; width: 20px; height: 20px; background: #ef4444; color: white; border-radius: 50%; border: none; font-size: 14px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .chat-input button { width: 42px; height: 42px; border-radius: 12px; background: #1a73e8; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s; }

        .chat-input button:disabled { opacity: 0.5; cursor: not-allowed; }
        .chat-input button:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26, 115, 232, 0.3); }
      `}</style>
    </>
  );
}
