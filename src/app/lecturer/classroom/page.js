"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Video, Users, Clock, ArrowRight, ShieldCheck, Activity,
  PlusCircle, MicOff, Save, Radio,
  Plus, Copy,
  Info, Disc, Timer, Square, ClipboardList, Download, X
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

// Map a lifecycle status to its badge presentation.
const STATUS_META = {
  upcoming: { label: 'Upcoming', cls: 'bg-info/10 text-info border-transparent' },
  live: { label: 'Live', cls: 'bg-success/10 text-success border-transparent' },
  ended: { label: 'Ended', cls: 'bg-muted text-muted-foreground border-transparent' },
};

function formatDuration(sec) {
  if (!sec || sec < 0) return '0s';
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

function formatTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export default function NeuralLecturerHub() {
  const router = useRouter();
  const {
    user, liveSessions, courses, startLiveSession, addCourse,
    getSessionStatus, extendSessionEnd, endLiveSession, getSessionAttendance
  } = useStore();
  const [selectedModule, setSelectedModule] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  const [attendanceSessionId, setAttendanceSessionId] = useState(null);

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

  const attendanceSession = attendanceSessionId
    ? mySessions.find(s => s.id === attendanceSessionId)
    : null;
  const attendanceRecords = attendanceSessionId ? getSessionAttendance(attendanceSessionId) : [];

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

  const handleEndEarly = (sessionId) => {
    if (confirm('End this session now for all participants?')) {
      endLiveSession(sessionId);
    }
  };

  // Dependency-free CSV export of a session's attendance.
  const exportAttendanceCsv = (session, records) => {
    if (typeof window === 'undefined') return;
    const header = ['Name', 'Role', 'Join', 'Leave', 'Duration', 'Status'];
    const rows = records.map(r => [
      r.name ?? '',
      r.role ?? '',
      r.joinTime ? new Date(r.joinTime).toLocaleString() : '',
      r.leaveTime ? new Date(r.leaveTime).toLocaleString() : 'Still in session',
      formatDuration(r.durationSec),
      r.status ?? '',
    ]);
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${String(session?.title || 'session').replace(/[^a-z0-9]+/gi, '_')}_attendance.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
        {/* Left Column: Sessions */}
        <main className="space-y-5 lg:col-span-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <Activity size={18} className="text-primary" /> Your sessions
              </h2>
            </div>
            <Badge variant="secondary" className="tabular-nums">
              {mySessions.filter(s => getSessionStatus(s) === 'live').length} live
            </Badge>
          </div>

          {mySessions.length > 0 ? (
            <div className="space-y-5">
              {mySessions.map((session) => {
                const status = getSessionStatus(session);
                const meta = STATUS_META[status] || STATUS_META.ended;
                const isLive = status === 'live';
                return (
                  <Card key={session.id} className="border-border transition-colors hover:border-primary/40">
                    <CardContent className="flex flex-col gap-6 p-6">
                      <div className="flex flex-col gap-6 md:flex-row md:items-center">
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
                                <Badge className={`rounded-full font-medium ${meta.cls}`}>
                                  {isLive && <span className="mr-1.5 h-2 w-2 rounded-full bg-success animate-pulse" />}
                                  {meta.label}
                                </Badge>
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
                                <p className="text-sm font-semibold tabular-nums text-foreground">{formatTime(session.startAt || session.startTime)}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Radio size={16} className="text-muted-foreground" />
                              <div className="space-y-0.5">
                                <p className="text-xs text-muted-foreground">Ends</p>
                                <p className="text-sm font-semibold tabular-nums text-foreground">{formatTime(session.endAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 md:w-48">
                          <Button
                            disabled={!isLive}
                            onClick={() => router.push(`/dashboard/classroom/${session.id}`)}
                          >
                            Enter session <ArrowRight size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/dashboard/classroom/${session.id}`); alert("Institutional Link Copied."); }}
                          >
                            <Copy size={16} /> Copy link
                          </Button>
                        </div>
                      </div>

                      {/* Session lifecycle controls */}
                      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isLive}
                          onClick={() => extendSessionEnd(session.id, 15)}
                        >
                          <Timer size={15} /> Extend 15 min
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!isLive}
                          onClick={() => extendSessionEnd(session.id, 30)}
                        >
                          <Timer size={15} /> Extend 30 min
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setAttendanceSessionId(session.id)}
                        >
                          <ClipboardList size={15} /> Attendance
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={!isLive}
                          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleEndEarly(session.id)}
                        >
                          <Square size={15} /> End now
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
                <Video size={32} strokeWidth={1.5} className="text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">No sessions yet</h3>
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

      {/* Attendance report dialog */}
      <Dialog open={!!attendanceSessionId} onOpenChange={(open) => { if (!open) setAttendanceSessionId(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-serif text-xl font-semibold tracking-tight">
              <ClipboardList size={18} className="text-primary" /> Attendance report
            </DialogTitle>
            <DialogDescription>
              {attendanceSession?.title || 'Session'} — {attendanceRecords.length} {attendanceRecords.length === 1 ? 'record' : 'records'}
            </DialogDescription>
          </DialogHeader>

          {attendanceRecords.length > 0 ? (
            <div className="max-h-[55vh] overflow-auto rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/60 text-left">
                  <tr className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Join</th>
                    <th className="px-4 py-3">Leave</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceRecords.map((r, i) => (
                    <tr key={`${r.userId}-${i}`} className="border-t border-border">
                      <td className="px-4 py-3 font-medium text-foreground">{r.name || '—'}</td>
                      <td className="px-4 py-3 capitalize text-muted-foreground">{r.role || '—'}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatTime(r.joinTime)}</td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">
                        {r.leaveTime ? formatTime(r.leaveTime) : <span className="text-success">In session</span>}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{formatDuration(r.durationSec)}</td>
                      <td className="px-4 py-3">
                        <Badge className={`rounded-full font-medium ${r.status === 'late' ? 'bg-warning/10 text-warning border-transparent' : 'bg-success/10 text-success border-transparent'}`}>
                          {r.status === 'late' ? 'Late' : 'Present'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border px-6 py-14 text-center">
              <Users size={28} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No attendance recorded for this session yet.</p>
            </div>
          )}

          <DialogFooter className="gap-2 sm:justify-between">
            <Button variant="ghost" onClick={() => setAttendanceSessionId(null)}>
              <X size={16} /> Close
            </Button>
            <Button
              disabled={attendanceRecords.length === 0}
              onClick={() => exportAttendanceCsv(attendanceSession, attendanceRecords)}
            >
              <Download size={16} /> Export CSV
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
