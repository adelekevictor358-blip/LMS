"use client";

import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, RotateCcw, Bot, Volume2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { useStore } from '@/store/useStore';

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, courses, assignments, submissions, quizzes, quizResults, materials, notifications, library, getStudentCourses } = useStore();

  // Derive this student's enrolled courses (single source of truth)
  const enrolledCourses = getStudentCourses(user);

  const enrolledCourseIds = enrolledCourses.map(c => c.id);

  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: `Hello ${user?.name?.split(' ')[0] || 'there'}! I'm your academic assistant — powered by Mistral AI and trained on your live academic data. You're enrolled in ${enrolledCourses.length} course${enrolledCourses.length !== 1 ? 's' : ''}. How can I help with your studies today?`
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
        setMessages(prev => [...prev, { sender: 'bot', text: "I can't reach the assistant right now. Check that your API credentials are configured in the environment." }]);
      }
    } catch (error) {
      console.error("Chat error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { sender: 'bot', text: "Something went wrong while processing your request. Please try again shortly." }]);
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
      {/* Launcher */}
      {!isOpen && (
        <button
          type="button"
          aria-label="Open academic assistant"
          className="fixed bottom-6 right-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquare size={22} strokeWidth={1.75} className="text-primary" />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[1001] flex h-[600px] w-[400px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-xl border border-border bg-card text-card-foreground shadow-lg animate-fade-in">
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Bot size={18} strokeWidth={1.75} />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">Academic assistant</span>
                <span className="text-xs text-muted-foreground">Powered by Mistral AI</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                aria-label="Start a new session"
                onClick={() => setMessages([{ sender: 'bot', text: `New session started. I'm reading your latest academic data, ${user?.name?.split(' ')[0] || 'there'}. How can I help?` }])}
              >
                <RotateCcw size={16} />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close assistant"
                onClick={() => setIsOpen(false)}
              >
                <X size={18} />
              </Button>
            </div>
          </header>

          {/* Messages */}
          <div className="flex flex-1 flex-col gap-4 overflow-y-auto min-h-0 bg-background px-4 py-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex max-w-[85%] gap-2.5 ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                {msg.sender === 'bot' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green-soft text-primary">
                    <Bot size={14} />
                  </span>
                )}
                <div
                  className={`rounded-xl border px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'border-transparent bg-primary text-primary-foreground'
                      : 'border-border bg-card text-card-foreground'
                  }`}
                >
                  {msg.text.includes('IMAGE_GENERATED:') ? (
                    <div className="my-1">
                      <p className="mb-2 text-xs font-medium text-muted-foreground">Visual aid generated</p>
                      <img
                        src={msg.text.split('IMAGE_GENERATED:')[1].trim()}
                        alt="Generated visual aid"
                        className="rounded-md border border-border"
                      />
                    </div>
                  ) : (
                    <>
                      {msg.text.split('\n').map((line, i) => (
                        <p key={i} className="text-pretty">{line}</p>
                      ))}
                      {msg.sender === 'bot' && (
                        <button
                          type="button"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
                          onClick={() => {
                            const utterance = new SpeechSynthesisUtterance(msg.text);
                            window.speechSynthesis.speak(utterance);
                          }}
                        >
                          <Volume2 size={14} /> Read aloud
                        </button>
                      )}
                    </>
                  )}
                </div>

                {msg.sender === 'user' && (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <User size={14} />
                  </span>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="flex max-w-[85%] gap-2.5">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-green-soft text-primary">
                  <Bot size={14} />
                </span>
                <div className="flex items-center gap-1.5 rounded-xl border border-border bg-card px-3.5 py-3">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground/60" />
                  <span className="sr-only">Assistant is typing</span>
                  <span className="text-xs text-muted-foreground">Thinking</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions / image preview */}
          <div className="bg-background px-4 pb-2">
            {selectedImage && (
              <div className="relative mb-2 inline-block animate-fade-in">
                <img src={selectedImage} alt="Selected image preview" className="h-16 w-16 rounded-md border border-border object-cover" />
                <button
                  type="button"
                  aria-label="Remove image"
                  onClick={() => setSelectedImage(null)}
                  className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground transition-colors hover:bg-destructive/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <X size={12} />
                </button>
              </div>
            )}
            {messages.length < 5 && !selectedImage && (
              <div className="flex flex-wrap gap-2">
                {suggestions.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => sendMessage(text)}
                    className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {text}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Composer */}
          <form className="flex items-center gap-2 border-t border-border bg-card px-4 py-3" onSubmit={handleSend}>
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
            <button
              type="button"
              aria-label="Attach an image"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => fileInputRef.current.click()}
            >
              <ImageIcon size={18} />
            </button>
            <input
              type="text"
              placeholder={selectedImage ? "Describe this image" : "Ask anything about your studies"}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Button
              type="submit"
              size="icon"
              aria-label="Send message"
              disabled={(!input.trim() && !selectedImage) || isTyping}
              className="shrink-0 active:translate-y-px"
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </>
  );
}
