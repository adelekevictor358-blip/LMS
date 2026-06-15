"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Video, Users, Clock, ArrowRight, ShieldCheck, Activity,
  PlusCircle, MicOff, Save, Radio,
  Plus, Copy,
  Info, Disc
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function NeuralLecturerHub() {
  const router = useRouter();
  const { user, liveSessions, courses, startLiveSession, addCourse } = useStore();
  const [selectedModule, setSelectedModule] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);

  // New Course State
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    college: user?.college || "CBAS",
    level: "100"
  });

  // Custom Session Settings (Zoom Style)
  const [settings, setSettings] = useState({
    muteOnEntry: true,
    waitingRoom: true,
    recordLocally: false,
    screenShareEnabled: true,
    chatEnabled: true
  });

  const mySessions = liveSessions.filter(session => session.lecturerId === user?.id);
  const myModules = useStore(s => s.getLecturerRegisteredCourses)(user?.id);

  const handleStartClass = () => {
    if (!selectedModule) {
      alert("Please select an institutional module to launch.");
      return;
    }
    const sessionId = startLiveSession(parseInt(selectedModule), settings);
    router.push(`/dashboard/classroom/${sessionId}`);
  };

  const handleCreateCourse = () => {
    if (!newCourse.code || !newCourse.title) return;
    addCourse({
      ...newCourse,
      lecturerId: user.id,
      lecturerName: user.name,
      students: [],
      materials: [],
      assignments: []
    });
    setIsAddingCourse(false);
    setNewCourse({ code: "", title: "", college: user?.college || "CBAS", level: "100" });
  };

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Live class control</p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-balance">
            Classroom control center
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            Start a live session, manage your modules and admit students into class.
          </p>
        </div>
        <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
          <DialogTrigger asChild>
            <Button variant="outline">
              <Plus size={16} /> New module
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-semibold tracking-tight">Create a module</DialogTitle>
              <DialogDescription>Add a new course to your teaching portfolio.</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-2 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="module-code">Module code</Label>
                <Input
                  id="module-code"
                  placeholder="e.g. PHY104"
                  value={newCourse.code}
                  onChange={e => setNewCourse({ ...newCourse, code: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="module-level">Level</Label>
                <Select value={newCourse.level} onValueChange={(v) => setNewCourse({ ...newCourse, level: v })}>
                  <SelectTrigger id="module-level">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {['100', '200', '300', '400', '500'].map(l => <SelectItem key={l} value={l}>{l} level</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="module-title">Module title</Label>
                <Input
                  id="module-title"
                  placeholder="e.g. Advanced quantum mechanics"
                  value={newCourse.title}
                  onChange={e => setNewCourse({ ...newCourse, title: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button className="w-full" onClick={handleCreateCourse}>
                <Save size={16} /> Create module
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Column: Active sessions */}
        <main className="space-y-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Activity size={18} className="text-primary" /> Active sessions
              </h2>
            </div>
            <Badge variant="secondary" className="tabular-nums">{mySessions.length} live</Badge>
          </div>

          {mySessions.length > 0 ? (
            <div className="space-y-5">
              {mySessions.map((session) => (
                <Card key={session.id} className="border-border transition-colors hover:border-primary/40">
                  <CardContent className="flex flex-col gap-6 p-6 md:flex-row md:items-center">
                    <div className="flex-1 space-y-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
                          <Video size={20} />
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="font-medium">
                              {courses.find(c => c.id === session.courseId)?.code}
                            </Badge>
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-success">
                              <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-success" />
                              </span>
                              Live
                            </span>
                            <span className="text-xs text-muted-foreground">Class ID: {session.id}</span>
                          </div>
                          <h3 className="text-lg font-semibold text-foreground">{session.title}</h3>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                        <div className="flex items-center gap-3">
                          <Users size={16} className="text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Participants</p>
                            <p className="text-sm font-semibold tabular-nums text-foreground">{session.participants?.length || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Clock size={16} className="text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Started</p>
                            <p className="text-sm font-semibold tabular-nums text-foreground">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                        <div className="hidden items-center gap-3 sm:flex">
                          <Radio size={16} className="text-muted-foreground" />
                          <div className="space-y-0.5">
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className="text-sm font-semibold text-success">Streaming</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 md:w-48">
                      <Button onClick={() => router.push(`/dashboard/classroom/${session.id}`)}>
                        Enter session <ArrowRight size={16} />
                      </Button>
                      <Button variant="ghost" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/dashboard/classroom/${session.id}`); alert("Institutional Link Copied."); }}>
                        <Copy size={16} /> Copy link
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <Video size={32} strokeWidth={1.5} className="text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">No active sessions</h3>
                  <p className="mx-auto max-w-sm text-sm leading-relaxed text-muted-foreground">
                    Select a module and start a session to begin teaching.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </main>

        {/* Right Column: Launch a session */}
        <aside className="lg:col-span-5">
          <div className="sticky top-6 space-y-4">
            <Card className="border-border shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                  <PlusCircle size={18} className="text-primary" /> Start a session
                </CardTitle>
                <CardDescription>Choose a module and configure how students join.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="session-module">Module</Label>
                  <Select value={selectedModule} onValueChange={setSelectedModule}>
                    <SelectTrigger id="session-module">
                      <SelectValue placeholder="Select a module" />
                    </SelectTrigger>
                    <SelectContent>
                      {myModules.length > 0 ? myModules.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          {c.code} — {c.title}
                        </SelectItem>
                      )) : (
                        <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
                          <Info size={24} strokeWidth={1.5} className="text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">No modules in your portfolio yet.</p>
                        </div>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session settings</Label>
                  <div className="space-y-2">
                    {[
                      { id: 'mute', icon: <MicOff size={16} />, label: 'Mute on entry', checked: settings.muteOnEntry, key: 'muteOnEntry' },
                      { id: 'wait', icon: <ShieldCheck size={16} />, label: 'Waiting room', checked: settings.waitingRoom, key: 'waitingRoom' },
                      { id: 'rec', icon: <Disc size={16} />, label: 'Record session', checked: settings.recordLocally, key: 'recordLocally' },
                    ].map(opt => (
                      <div key={opt.id} className="flex items-center justify-between rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
                            {opt.icon}
                          </span>
                          <span className="text-sm font-medium text-foreground">{opt.label}</span>
                        </div>
                        <Switch
                          checked={opt.checked}
                          onCheckedChange={(v) => setSettings({ ...settings, [opt.key]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  className="w-full"
                  disabled={!selectedModule}
                  onClick={handleStartClass}
                >
                  <Video size={16} /> Start live session
                </Button>
              </CardContent>
            </Card>

            <p className="px-1 text-center text-xs text-muted-foreground">
              MTU online learning hub
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
