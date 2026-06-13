"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Megaphone, Send, Clock, CheckCircle2, Users, ShieldAlert, History, MessageSquarePlus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function LecturerBroadcast() {
  const { user, courses, broadcasts, sendLecturerBroadcast } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myBroadcasts = broadcasts.filter(b => b.from === user?.id);
  const [form, setForm] = useState({ title: '', message: '', courseId: 'all', isUrgent: false });
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    sendLecturerBroadcast({ ...form, courseId: form.courseId === 'all' ? null : parseInt(form.courseId) });
    setForm({ title: '', message: '', courseId: 'all', isUrgent: false });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Broadcast announcements
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty max-w-prose">
            Send announcements and academic notices to your student cohorts.
          </p>
        </div>
        <Badge variant="outline" className="rounded-full border-border bg-success/10 text-success">
          <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-success" aria-hidden="true" />
          Faculty access
        </Badge>
      </header>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="compose">
            <MessageSquarePlus size={16} className="mr-2" /> Compose
          </TabsTrigger>
          <TabsTrigger value="history">
            <History size={16} className="mr-2" /> History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="mt-6 space-y-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-foreground">New announcement</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Choose an audience and write your message.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSend} className="space-y-6">
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="broadcast-audience" className="text-xs font-medium text-muted-foreground">
                          Audience
                        </label>
                        <div className="relative">
                          <Users size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <select
                            id="broadcast-audience"
                            className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            value={form.courseId}
                            onChange={e => setForm({ ...form, courseId: e.target.value })}
                          >
                            <option value="all">All students</option>
                            {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="broadcast-title" className="text-xs font-medium text-muted-foreground">
                          Title
                        </label>
                        <Input
                          id="broadcast-title"
                          placeholder="e.g. Class rescheduled to Friday"
                          className="h-10"
                          value={form.title}
                          onChange={e => setForm({ ...form, title: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="broadcast-message" className="text-xs font-medium text-muted-foreground">
                        Message
                      </label>
                      <Textarea
                        id="broadcast-message"
                        rows={8}
                        placeholder="Write your announcement here."
                        className="resize-none"
                        value={form.message}
                        onChange={e => setForm({ ...form, message: e.target.value })}
                        required
                      />
                    </div>

                    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors ${form.isUrgent ? 'bg-destructive/10 text-destructive' : 'bg-accent text-muted-foreground'}`}>
                          <ShieldAlert size={18} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-foreground">Mark as urgent</p>
                          <p className="text-xs text-muted-foreground">Flag this announcement for immediate attention.</p>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant={form.isUrgent ? "destructive" : "outline"}
                        size="sm"
                        onClick={() => setForm(f => ({ ...f, isUrgent: !f.isUrgent }))}
                      >
                        {form.isUrgent ? 'Urgent' : 'Standard'}
                      </Button>
                    </div>

                    {sent && (
                      <div className="flex items-center gap-3 rounded-md border border-transparent bg-success/10 p-3 text-success animate-fade-in">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-medium">Announcement sent to your students.</span>
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleSend} className="w-full active:translate-y-px">
                    Send announcement <Send size={16} className="ml-2" />
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <aside className="space-y-6 lg:col-span-5">
              <Card className="border-border shadow-sm">
                <CardHeader>
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-green-soft text-brand-green">
                    <Megaphone size={18} />
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground">How broadcasts work</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground">
                    Faculty announcements are logged and delivered to your selected cohorts. Students receive
                    a notification and a persistent inbox alert.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Separator className="bg-border" />
                  <ul className="space-y-3">
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
                      Delivered across notifications and inbox
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
                      Every announcement is logged
                    </li>
                    <li className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-green" aria-hidden="true" />
                      Available in your sent history
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold text-foreground">Sent history</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Announcements you have sent.
                </CardDescription>
              </div>
              <Badge variant="secondary" className="tabular-nums">
                {myBroadcasts.length} sent
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              {myBroadcasts.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                  <Megaphone size={40} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">You haven&apos;t sent any announcements yet.</p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {myBroadcasts.map(b => {
                    const course = b.courseId ? courses.find(c => c.id === b.courseId) : null;
                    return (
                      <div
                        key={b.id}
                        className={`group rounded-xl border p-5 transition-colors ${b.isUrgent ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-card hover:border-primary/40'}`}
                      >
                        <div className="flex items-start justify-between gap-6">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h4 className="text-base font-semibold text-foreground">{b.title}</h4>
                              {b.isUrgent && (
                                <Badge variant="outline" className="rounded-full border-transparent bg-destructive/10 text-destructive">
                                  Urgent
                                </Badge>
                              )}
                            </div>
                            <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">{b.message}</p>
                            <div className="flex flex-wrap items-center gap-4 pt-1">
                              <span className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                                <Users size={14} className="text-brand-green" /> {course ? course.code : 'All students'}
                              </span>
                              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground tabular-nums">
                                <Clock size={14} /> {new Date(b.timestamp).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100 focus-visible:opacity-100"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
