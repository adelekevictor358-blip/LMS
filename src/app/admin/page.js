"use client";
// Institutional Registry Rebuild v3 - 2026-04-23

import { useStore } from '@/store/useStore';
import { semesterFromCode, nextSession, nextLevel } from '@/lib/utils';
import { Users, BookOpen, Bell, Shield, Search, Plus, BarChart2, UserPlus, Trash2, ShieldCheck, Clock, Send, Globe, Database, Settings, RotateCcw, LogOut, Sun, Moon, Construction, CheckCircle, ChevronRight, ClipboardCheck, CalendarDays, LockOpen, Lock, RefreshCw, Eye } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState, useEffect, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const user = useStore(state => state.user);
  const logout = useStore(state => state.logout);
  const courses = useStore(state => state.courses);
  const broadcasts = useStore(state => state.broadcasts);
  const addBroadcast = useStore(state => state.addBroadcast);
  const deleteUser = useStore(state => state.deleteUser);
  const getAllUsers = useStore(state => state.getAllUsers);
  const resetToDefaultPassword = useStore(state => state.resetToDefaultPassword);
  const notifications = useStore(state => state.notifications);
  const lecturerPortalActive = useStore(state => state.lecturerPortalActive);
  const toggleLecturerPortal = useStore(state => state.toggleLecturerPortal);
  const addUser = useStore(state => state.addUser);
  const addCourse = useStore(state => state.addCourse);
  const deleteCourse = useStore(state => state.deleteCourse);
  const adminToggleEnrollment = useStore(state => state.adminToggleEnrollment);
  const appointLecturerToCourse = useStore(state => state.appointLecturerToCourse);
  const setStudentLevel = useStore(state => state.setStudentLevel);
  const academicStructure = useStore(state => state.getAcademicStructure());
  const currentSession = useStore(state => state.currentSession);
  const currentSemester = useStore(state => state.currentSemester);
  const semesterOpen = useStore(state => state.semesterOpen);
  const openRegistration = useStore(state => state.openRegistration);
  const closeRegistration = useStore(state => state.closeRegistration);
  const advanceSemester = useStore(state => state.advanceSemester);
  const beginNewSession = useStore(state => state.beginNewSession);
  const promoteStudents = useStore(state => state.promoteStudents);

  const hasHydrated = useStore(state => state._hasHydrated);
  const dynamicUsers = useStore(state => state.dynamicUsers);
  const excludedIds = useStore(state => state.excludedIds);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  // ── Lecturer Course Registration store selectors ──
  const lecturerCourseRegWindow = useStore(state => state.lecturerCourseRegWindow);
  const lecturerCourseRegistrations = useStore(state => state.lecturerCourseRegistrations);
  const lecturerRegOverrides = useStore(state => state.lecturerRegOverrides);
  const openLecturerCourseReg = useStore(state => state.openLecturerCourseReg);
  const closeLecturerCourseReg = useStore(state => state.closeLecturerCourseReg);
  const overrideLecturerReg = useStore(state => state.overrideLecturerReg);
  const revokeOverrideLecturerReg = useStore(state => state.revokeOverrideLecturerReg);
  const getLecturerRegisteredCourses = useStore(state => state.getLecturerRegisteredCourses);

  useEffect(() => {
    setMounted(true);
    const userId = user?.id;
    const userRole = user?.role;
    if (hasHydrated && (!userId || userRole !== 'admin')) {
      if (pathname !== '/login') router.push('/login');
    }
  }, [hasHydrated, user?.id, user?.role, pathname]);

  // Memoized — only recomputes when users actually change, not on every keystroke
  const allUsers = useMemo(() => {
    return getAllUsers ? getAllUsers() : [];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dynamicUsers, excludedIds]);

  const students = useMemo(() => allUsers.filter(u => u.role === 'student'), [allUsers]);
  const faculty = useMemo(() => allUsers.filter(u => u.role === 'lecturer'), [allUsers]);
  const promotableStudents = students.filter(s => (s.level || '100L') !== 'Graduated');

  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sessionDraft, setSessionDraft] = useState('');
  const [isPromoteOpen, setIsPromoteOpen] = useState(false);
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastTarget, setBroadcastTarget] = useState('all');

  // Forms State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'student', college: '', program: '', matNo: '', staffId: '' });
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', code: '', units: 2, level: '100L', semester: '1st', program: 'General', color: '#3b82f6' });
  const [enrollingStudent, setEnrollingStudent] = useState(null);

  // Filters
  const [adminCourseLevelFilter, setAdminCourseLevelFilter] = useState('all');
  const [adminCourseSemesterFilter, setAdminCourseSemesterFilter] = useState('all');
  const [adminCourseProgramFilter, setAdminCourseProgramFilter] = useState('all');
  const [appointingCourseId, setAppointingCourseId] = useState(null);

  // Lecturer Course Reg admin state
  const [lcrStartDate, setLcrStartDate] = useState('');
  const [lcrEndDate, setLcrEndDate] = useState('');
  const [lcrSemester, setLcrSemester] = useState(currentSemester || '1st');
  const [lcrSession, setLcrSession] = useState(currentSession || '2025/2026');
  const [viewRegLecturer, setViewRegLecturer] = useState(null);
  const [lcrSearchQuery, setLcrSearchQuery] = useState('');

  // Unified Hydration & Auth Check
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="h-8 w-8 rounded-full border-2 border-muted border-t-foreground animate-spin" />
        <p className="text-xs font-medium text-muted-foreground">Loading admin console</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 px-6 text-center">
        <Shield className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
        <p className="text-sm font-medium text-foreground">Access restricted</p>
        <p className="text-sm text-muted-foreground">Redirecting you to sign in.</p>
      </div>
    );
  }

  const filteredUsers = allUsers
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
    .reverse();

  const filteredCourses = courses
    .filter(c => (adminCourseLevelFilter === 'all' || c.level === adminCourseLevelFilter))
    .filter(c => (adminCourseSemesterFilter === 'all' || c.semester === adminCourseSemesterFilter))
    .filter(c => (adminCourseProgramFilter === 'all' || c.program === adminCourseProgramFilter))
    .reverse();

  return (
    <div className="min-h-screen bg-background flex flex-col animate-fade-in">
      {/* Top navigation */}
      <header className="sticky top-0 z-40 bg-card/95 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md border border-border bg-card p-1 flex items-center justify-center">
              <img src="/mtu-logo.png" alt="Mountain Top University crest" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-serif text-base font-semibold tracking-tight text-foreground leading-tight line-clamp-1">Mountain Top University</h1>
              <p className="text-xs text-muted-foreground leading-none">Admin console</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Toggle theme">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </Button>
             <div className="h-6 w-px bg-border" />
             <div className="flex items-center gap-2.5 rounded-md border border-border bg-secondary px-2 py-1.5 pr-3">
                <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-semibold">AD</div>
                <div className="hidden sm:block">
                   <p className="text-xs font-semibold text-foreground leading-none capitalize">{user.name}</p>
                   <p className="text-xs text-muted-foreground leading-none mt-1">System admin</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-between overflow-x-auto pb-1">
            <TabsList className="h-auto flex-wrap gap-1 bg-muted p-1 rounded-md">
              <TabsTrigger value="overview" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BarChart2 className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Users className="h-4 w-4" /> Directory
              </TabsTrigger>
              <TabsTrigger value="courses" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <BookOpen className="h-4 w-4" /> Courses
              </TabsTrigger>
              <TabsTrigger value="comms" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <Bell className="h-4 w-4" /> Broadcasts
              </TabsTrigger>
              <TabsTrigger value="governance" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ShieldCheck className="h-4 w-4" /> Governance
              </TabsTrigger>
              <TabsTrigger value="lecturer-reg" className="rounded-md px-3.5 py-2 gap-2 text-sm font-medium data-[state=active]:bg-card data-[state=active]:shadow-sm">
                <ClipboardCheck className="h-4 w-4" /> Course Reg
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                { title: 'Total users', value: allUsers.length, detail: 'Across the registry', icon: Users },
                { title: 'Active courses', value: courses.length, detail: 'In the catalog', icon: BookOpen },
                { title: 'Broadcasts', value: broadcasts.length, detail: 'Messages sent', icon: Bell },
                { title: 'Security', value: 'Active', detail: 'Institutional encryption', icon: Shield },
              ].map((stat, i) => (
                <Card key={i} className="rounded-xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground">{stat.title}</p>
                        <h3 className="mt-2 text-2xl font-semibold tabular-nums text-foreground">{stat.value}</h3>
                        <p className="mt-1 text-xs text-muted-foreground">{stat.detail}</p>
                      </div>
                      <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                        <stat.icon className="h-5 w-5" strokeWidth={1.5} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="rounded-xl border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Academic calendar</CardTitle>
                  <CardDescription className="text-sm">Where the institution is in the year. Promotion is separate (Directory or Promote students).</CardDescription>
                </div>
                <Badge variant="secondary" className="font-medium tabular-nums shrink-0">{currentSession} &middot; {currentSemester} sem &middot; {semesterOpen ? 'Open' : 'Closed'}</Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-md border border-border bg-muted/40 p-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      Registration window &mdash; {currentSemester} semester
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium ${semesterOpen ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${semesterOpen ? 'bg-success' : 'bg-muted-foreground'}`} aria-hidden="true" />
                        {semesterOpen ? 'Open' : 'Closed'}
                      </span>
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {semesterOpen
                        ? 'Students can register for their level’s ' + currentSemester + '-semester courses. Close it to lock registration.'
                        : 'Registration is locked. Open it to let students register this semester.'}
                    </p>
                  </div>
                  <Button
                    variant={semesterOpen ? 'outline' : 'default'}
                    className="h-9 gap-2 shrink-0"
                    onClick={() => {
                      if (semesterOpen) {
                        if (confirm(`Close ${currentSemester} semester registration? Students cannot register until you reopen it.`)) closeRegistration();
                      } else {
                        openRegistration();
                      }
                    }}
                  >
                    {semesterOpen ? 'Close registration' : <><ChevronRight className="h-4 w-4" /> Open registration</>}
                  </Button>
                </div>
                <div className="rounded-md border border-border bg-muted/40 p-4 space-y-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Move the calendar forward</p>
                      <p className="text-xs text-muted-foreground">
                        {currentSemester === '1st'
                          ? 'Advance to the second semester when the first is finished (registrations carry over within a session).'
                          : 'The second semester is active. Begin a new session to start the next year.'}
                      </p>
                    </div>
                    {currentSemester === '1st' && (
                      <Button variant="outline" className="h-9 gap-2 shrink-0" onClick={() => {
                        if (confirm(`Advance to the second semester of ${currentSession}? Registration stays closed until you open it.`)) {
                          const r = advanceSemester();
                          if (r && r.success === false) alert(r.error);
                        }
                      }}>
                        <ChevronRight className="h-4 w-4" /> Advance to 2nd semester
                      </Button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between border-t border-border pt-4">
                    <div className="grid gap-1.5 flex-1">
                      <Label className="text-xs font-medium text-muted-foreground">Begin a new session</Label>
                      <p className="text-xs text-muted-foreground">Resets to the 1st semester and clears registrations for the new year. Student levels are not changed.</p>
                      <Input
                        value={sessionDraft}
                        onChange={e => setSessionDraft(e.target.value)}
                        placeholder={`e.g. ${nextSession(currentSession)}`}
                        className="h-11 max-w-[12rem]"
                      />
                    </div>
                    <Button className="gap-2 shrink-0 h-11" onClick={() => {
                      const target = (sessionDraft || nextSession(currentSession)).trim();
                      if (!target || target === currentSession) { alert('Enter a different session to begin.'); return; }
                      if (confirm(`Begin the ${target} academic session?\n\nThis resets to the 1st semester (locked) and clears every student's registration for the new year. Student levels are NOT changed.`)) {
                        const r = beginNewSession(target);
                        if (r && r.success) { setSessionDraft(''); alert(`The ${target} session has begun.`); }
                      }
                    }}>
                      <ChevronRight className="h-4 w-4" /> Begin new session
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-xl border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Student progression</CardTitle>
                  <CardDescription className="text-sm">Levels never change automatically. Move students up individually in the Directory, or promote a cohort here.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
                  Promoting advances every active student one level (400L students graduate) and resets their registration. Use this deliberately, typically at the end of a session.
                </p>
                <Button variant="outline" className="gap-2 shrink-0" onClick={() => setIsPromoteOpen(true)}>
                  <ChevronRight className="h-4 w-4" /> Promote students
                </Button>
              </CardContent>
            </Card>

            <Dialog open={isPromoteOpen} onOpenChange={setIsPromoteOpen}>
              <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-serif text-xl font-semibold tracking-tight">Promote students</DialogTitle>
                  <DialogDescription className="text-sm text-muted-foreground">
                    Advance every active student one level. 400L students graduate. This does not change the session or semester.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2 py-2">
                  {promotableStudents.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">No active students to promote.</p>
                  ) : promotableStudents.map(s => (
                    <div key={s.id} className="flex items-center justify-between rounded-md border border-border px-3 py-2.5">
                      <span className="text-sm font-medium text-foreground">{s.name}</span>
                      <span className="flex items-center gap-1 text-xs tabular-nums text-muted-foreground">
                        {s.level || '100L'} <ChevronRight className="h-3 w-3" /> <span className="font-medium text-foreground">{nextLevel(s.level || '100L')}</span>
                      </span>
                    </div>
                  ))}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsPromoteOpen(false)}>Cancel</Button>
                  <Button disabled={promotableStudents.length === 0} onClick={() => {
                    const res = promoteStudents();
                    setIsPromoteOpen(false);
                    alert(`Promoted ${res.promoted} student${res.promoted === 1 ? '' : 's'}.`);
                  }}>
                    Promote {promotableStudents.length} student{promotableStudents.length === 1 ? '' : 's'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card className="rounded-xl border border-border bg-card shadow-sm">
               <CardHeader>
                  <CardTitle className="text-lg font-semibold">Activity overview</CardTitle>
                  <CardDescription className="text-sm">Recent institutional events and data changes.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="h-48 flex items-end justify-between gap-2">
                     {[40, 70, 45, 90, 65, 80, 55, 30, 95, 60, 75, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-muted rounded-t-md relative group">
                           <div className="absolute bottom-0 w-full bg-primary/70 rounded-t-md transition-colors group-hover:bg-primary" style={{ height: `${h}%` }} />
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 flex-col sm:flex-row sm:items-center gap-3">
                   <div className="relative flex-1 max-w-md">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                         placeholder="Search by name, email, matric or staff ID"
                         className="pl-10 h-11"
                         value={searchQuery}
                         onChange={e => setSearchQuery(e.target.value)}
                      />
                   </div>
                   <div className="flex gap-1 bg-muted p-1 rounded-md w-fit">
                      {[
                         { key: 'all', label: 'All' },
                         { key: 'student', label: 'Students' },
                         { key: 'lecturer', label: 'Lecturers' },
                         { key: 'admin', label: 'Admins' },
                      ].map(r => (
                         <button
                            key={r.key}
                            type="button"
                            onClick={() => setRoleFilter(r.key)}
                            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${roleFilter === r.key ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                         >
                            {r.label}
                         </button>
                      ))}
                   </div>
                </div>

                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="h-11 gap-2">
                          <UserPlus className="h-4 w-4" /> Add user
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle className="font-serif text-xl font-semibold tracking-tight">New user</DialogTitle>
                            <DialogDescription className="text-sm text-muted-foreground">Create an institutional record.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-5 py-4">
                            <div className="grid gap-2">
                                <Label className="text-xs font-medium text-muted-foreground">Full legal name</Label>
                                <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="h-11" placeholder="e.g. John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-medium text-muted-foreground">Institutional email</Label>
                                <Input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="h-11" placeholder="name@mtu.edu.ng" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-xs font-medium text-muted-foreground">Role</Label>
                                <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                                    <SelectTrigger className="h-11"><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student account</SelectItem>
                                        <SelectItem value="lecturer">Faculty member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newUser.role === 'student' ? (
                               <>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Departmental program</Label>
                                    <Select value={newUser.program} onValueChange={v => setNewUser({...newUser, program: v})}>
                                        <SelectTrigger className="h-11"><SelectValue placeholder="Select program" /></SelectTrigger>
                                        <SelectContent>
                                            {academicStructure.colleges.map(col => (
                                                <SelectGroup key={col.name} label={col.name}>
                                                    {col.programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Matriculation number</Label>
                                    <Input value={newUser.matNo} onChange={e => setNewUser({...newUser, matNo: e.target.value})} className="h-11" placeholder="210101010" />
                                </div>
                               </>
                            ) : (
                                <div className="grid gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Faculty ID</Label>
                                    <Input value={newUser.staffId} onChange={e => setNewUser({...newUser, staffId: e.target.value})} className="h-11" placeholder="LEC/2026/000" />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button className="w-full h-11" onClick={() => {
                                if (addUser(newUser).success) {
                                  setIsAddUserOpen(false);
                                  setNewUser({ name: '', email: '', role: 'student', college: '', program: '', matNo: '', staffId: '' });
                                  alert("User created.");
                                }
                            }}>Create user</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
             </div>

             <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {filteredUsers.length === 0 ? (
                   <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <Users className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-sm text-muted-foreground">No users match your search.</p>
                   </div>
                ) : (
                <Table>
                   <TableHeader className="bg-muted/50">
                      <TableRow className="border-border">
                         <TableHead className="text-xs font-medium text-muted-foreground py-4">User</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">ID reference</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Role</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Level</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Password</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Last seen</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground text-right px-6">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredUsers
                        .map((u) => (
                         <TableRow key={u.id} className="border-border transition-colors hover:bg-muted/40">
                            <TableCell className="py-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
                                     {u.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="text-sm font-semibold text-foreground leading-none">{u.name}</p>
                                     <p className="text-xs text-muted-foreground mt-1">{u.email}</p>
                                     {u.role === 'student' && <p className="text-xs text-muted-foreground mt-0.5">{u.program}</p>}
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <code className="text-xs font-medium px-2.5 py-1 bg-muted rounded-md text-muted-foreground tabular-nums">
                                  {u.matNo || u.staffId || 'SYS-UID'}
                               </code>
                            </TableCell>
                            <TableCell>
                               <Badge variant="outline" className={`capitalize border-transparent ${u.role === 'admin' ? 'bg-destructive/10 text-destructive' : u.role === 'lecturer' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'}`}>
                                  {u.role}
                               </Badge>
                            </TableCell>
                            <TableCell>
                               {u.role === 'student' ? (
                                  <Select
                                     value={u.level || '100L'}
                                     onValueChange={(v) => {
                                        if (v !== (u.level || '100L') && confirm(`Change ${u.name}'s level to ${v}? This resets their course registration for the new level.`)) {
                                           setStudentLevel(u.id, v);
                                        }
                                     }}
                                  >
                                     <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                                     <SelectContent className="h-9 w-[8.5rem]">
                                        <SelectItem value="100L">100 Level</SelectItem>
                                        <SelectItem value="200L">200 Level</SelectItem>
                                        <SelectItem value="300L">300 Level</SelectItem>
                                        <SelectItem value="400L">400 Level</SelectItem>
                                        <SelectItem value="Graduated">Graduated</SelectItem>
                                     </SelectContent>
                                  </Select>
                               ) : (
                                  <span className="text-xs text-muted-foreground">&mdash;</span>
                               )}
                            </TableCell>
                            <TableCell>
                               <code className="text-xs font-mono px-2 py-1 bg-muted rounded-md text-muted-foreground cursor-pointer transition-colors hover:text-foreground" title="Click to copy" onClick={() => navigator.clipboard.writeText(u.password || 'password123')}>
                                  {u.password || 'password123'}
                               </code>
                            </TableCell>
                            <TableCell>
                               <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {u.lastSeen || 'Just now'}
                               </span>
                            </TableCell>
                            <TableCell className="text-right px-6">
                               <div className="flex items-center justify-end gap-1.5">
                                  {u.role === 'student' && (
                                    <Dialog open={enrollingStudent?.id === u.id} onOpenChange={open => !open && setEnrollingStudent(null)}>
                                       <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" onClick={() => setEnrollingStudent(u)} className="h-8 gap-1.5 text-xs">
                                            <ShieldCheck size={14} /> Enrolment
                                          </Button>
                                       </DialogTrigger>
                                       <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                          <DialogHeader>
                                             <DialogTitle className="font-serif text-xl font-semibold tracking-tight">Manage enrolment — {u.name}</DialogTitle>
                                             <DialogDescription className="text-sm text-muted-foreground">Course assignments for {u.program}.</DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-6 py-4">
                                             {['100L', '200L', '300L', '400L'].map(level => (
                                                <div key={level} className="space-y-3">
                                                   <p className="text-xs font-medium text-muted-foreground">{level}</p>
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      {courses.filter(c => c.level === level && (c.program === 'General' || c.program === u.program)).map(course => (
                                                         <div key={course.id} className={`flex items-center justify-between p-3.5 rounded-xl border transition-colors cursor-pointer ${u.enrolledCourseIds?.includes(course.id) ? 'border-primary/40 bg-primary/5' : 'border-border bg-card hover:border-primary/40'}`} onClick={() => adminToggleEnrollment(u.id, course.id)}>
                                                            <div className="flex items-center gap-3">
                                                               <div className="h-8 w-8 rounded-md flex items-center justify-center text-white text-[10px] font-semibold" style={{ backgroundColor: course.color }}>{course.code.substring(0, 3)}</div>
                                                               <div>
                                                                  <p className="text-sm font-semibold text-foreground leading-tight">{course.title}</p>
                                                                  <p className="text-xs text-muted-foreground mt-0.5">{course.code} · {course.units || 2} units · {course.semester}</p>
                                                               </div>
                                                            </div>
                                                            <div className={`h-6 w-6 rounded-full flex items-center justify-center transition-colors ${u.enrolledCourseIds?.includes(course.id) ? 'bg-primary text-primary-foreground' : 'bg-muted text-transparent'}`}>
                                                               <CheckCircle size={14} />
                                                            </div>
                                                         </div>
                                                      ))}
                                                   </div>
                                                </div>
                                             ))}
                                          </div>
                                       </DialogContent>
                                    </Dialog>
                                  )}

                                  {u.role !== 'admin' && (
                                     <Button variant="ghost" size="icon" onClick={() => resetToDefaultPassword(u.id)} title="Reset to default password" className="h-8 w-8 text-muted-foreground hover:text-warning">
                                        <RotateCcw size={16} />
                                     </Button>
                                  )}
                                  {u.role !== 'admin' && (
                                     <Button variant="ghost" size="icon" onClick={() => { if(confirm(`Confirm permanent deletion of ${u.name}?`)) deleteUser(u.id); }} title="Delete user" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                                        <Trash2 size={16} />
                                     </Button>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
                )}
             </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
             <div className="flex flex-col xl:flex-row xl:items-center gap-3">
                <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                    {['all', '100L', '200L', '300L', '400L'].map(level => (
                        <button key={level} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${adminCourseLevelFilter === level ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setAdminCourseLevelFilter(level)}>
                          {level === 'all' ? 'All levels' : level}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                   <div className="flex items-center gap-1 bg-muted p-1 rounded-md">
                      {['all', '1st', '2nd'].map(sem => (
                         <button key={sem} className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${adminCourseSemesterFilter === sem ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`} onClick={() => setAdminCourseSemesterFilter(sem)}>
                           {sem === 'all' ? 'All sem' : sem}
                         </button>
                      ))}
                   </div>

                   <div className="w-56">
                    <Select value={adminCourseProgramFilter} onValueChange={setAdminCourseProgramFilter}>
                        <SelectTrigger className="h-10"><SelectValue placeholder="Department" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All departments</SelectItem>
                            <SelectItem value="General">General (GST/ENT)</SelectItem>
                            {academicStructure.colleges.map(col => (
                                <SelectGroup key={col.name} label={col.name}>
                                    {col.programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                   </div>
                </div>

                <div className="xl:ml-auto flex items-center gap-3">
                    <Button variant="outline" className="h-10 gap-2" onClick={() => {
                       const targetProg = adminCourseProgramFilter === 'all' ? 'B.Sc. Mathematics' : adminCourseProgramFilter;
                       const targetLev = adminCourseLevelFilter === 'all' ? '100L' : adminCourseLevelFilter;
                       if(confirm(`Add template courses for ${targetProg} (${targetLev})?`)) {
                          const templates = {
                            'B.Sc. Mathematics': [
                               { title: 'Introduction to Real Analysis', code: 'MTH 301', units: 3, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
                               { title: 'Algebraic Structures', code: 'MTH 303', units: 3, level: '300L', semester: '1st', program: 'B.Sc. Mathematics' },
                               { title: 'Vector Analysis', code: 'MTH 312', units: 2, level: '300L', semester: '2nd', program: 'B.Sc. Mathematics' }
                            ]
                          };
                          const seed = templates[targetProg] || [];
                          const batch = seed.filter(s => s.level === targetLev);
                          if(batch.length === 0) alert("No templates match these filters.");
                          batch.forEach(c => addCourse(c));
                          alert(`Added ${batch.length} courses.`);
                       }
                    }}>
                       <Database size={16} /> Smart seed
                    </Button>
                    <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                        <DialogTrigger asChild>
                            <Button className="h-10 gap-2">
                                <Plus size={16} /> Add course
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                           <DialogHeader>
                               <DialogTitle className="font-serif text-xl font-semibold tracking-tight">Add course</DialogTitle>
                               <DialogDescription className="text-sm text-muted-foreground">Add a course to the institutional catalog.</DialogDescription>
                           </DialogHeader>
                           <div className="grid gap-5 py-4">
                              <div className="grid gap-2">
                                  <Label className="text-xs font-medium text-muted-foreground">Course title</Label>
                                  <Input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="h-11" placeholder="e.g. Metric Space Topology" />
                              </div>
                              <div className="grid gap-2">
                                  <Label className="text-xs font-medium text-muted-foreground">Course code</Label>
                                  <Input value={newCourse.code} onChange={e => { const code = e.target.value; const sem = semesterFromCode(code); setNewCourse(prev => ({ ...prev, code, ...(sem ? { semester: sem } : {}) })); }} className="h-11" placeholder="MTH 301" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="grid gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Level</Label>
                                    <Select value={newCourse.level} onValueChange={v => setNewCourse({...newCourse, level: v})}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['100L', '200L', '300L', '400L'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="grid gap-2">
                                    <Label className="text-xs font-medium text-muted-foreground">Semester</Label>
                                    <Select value={newCourse.semester} onValueChange={v => setNewCourse({...newCourse, semester: v})}>
                                        <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st">1st semester</SelectItem>
                                            <SelectItem value="2nd">2nd semester</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                              <div className="grid gap-2">
                                 <Label className="text-xs font-medium text-muted-foreground">Restricted department / program</Label>
                                 <Select value={newCourse.program} onValueChange={v => setNewCourse({...newCourse, program: v})}>
                                    <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General (public access)</SelectItem>
                                        {academicStructure.colleges.map(col => (
                                            <SelectGroup key={col.name} label={col.name}>
                                                {col.programs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>
                           <DialogFooter>
                              <Button className="w-full h-11" onClick={() => {
                                 if (newCourse.title && newCourse.code) {
                                    addCourse(newCourse);
                                    setIsAddCourseOpen(false);
                                    setNewCourse({ title: '', code: '', units: 2, level: '100L', semester: '1st', program: 'General', color: '#3b82f6' });
                                    alert("Course added.");
                                 }
                              }}>Add course</Button>
                           </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
             </div>

             <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
                {filteredCourses.length === 0 ? (
                   <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                      <BookOpen className="h-9 w-9 text-muted-foreground" strokeWidth={1.5} />
                      <p className="text-sm text-muted-foreground">No courses match these filters.</p>
                      <Button onClick={() => setIsAddCourseOpen(true)} className="gap-2"><Plus size={16} /> Add course</Button>
                   </div>
                ) : (
                <Table>
                   <TableHeader className="bg-muted/50">
                      <TableRow className="border-border">
                         <TableHead className="text-xs font-medium text-muted-foreground py-4 px-6">Course</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Level / sem</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground">Program</TableHead>
                         <TableHead className="text-xs font-medium text-muted-foreground text-right px-6">Manage</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {filteredCourses
                        .map((c) => (
                         <TableRow key={c.id} className="border-border transition-colors hover:bg-muted/40">
                            <TableCell className="py-4 px-6">
                               <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-md flex items-center justify-center text-white text-[10px] font-semibold" style={{ backgroundColor: c.color }}>
                                     {c.code.split(' ')[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-semibold text-foreground leading-none">{c.title}</p>
                                     <p className="text-xs text-muted-foreground mt-1.5">{c.code} · {c.units || 2} credits</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs font-medium border-border">{c.level}</Badge>
                                  <Badge variant="outline" className="text-xs font-medium border-border">{c.semester}</Badge>
                               </div>
                            </TableCell>
                            <TableCell>
                               <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                                  {c.program === 'General' ? <span className="text-success font-medium">Universal</span> : c.program}
                               </p>
                            </TableCell>
                            <TableCell className="text-right px-6">
                               <Button variant="ghost" size="icon" onClick={() => { if(confirm(`Delete ${c.code} from the catalog?`)) deleteCourse(c.id); }} title="Delete course" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                  <Trash2 size={16} />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
                )}
             </div>
          </TabsContent>

          <TabsContent value="comms" className="space-y-6">
             <Card className="rounded-xl border border-border bg-card shadow-sm">
                <CardHeader>
                   <CardTitle className="text-lg font-semibold">Broadcasts</CardTitle>
                   <CardDescription className="text-sm">Send institutional messages and alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground">Audience</Label>
                            <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                               <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="all">Everyone</SelectItem>
                                  <SelectItem value="student">Students only</SelectItem>
                                  <SelectItem value="lecturer">Staff and faculty only</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground">Message</Label>
                            <textarea
                               className="w-full min-h-[120px] rounded-md border border-input bg-transparent p-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring transition-colors"
                               placeholder="Write your message"
                               value={broadcastMessage}
                               onChange={e => setBroadcastMessage(e.target.value)}
                            />
                         </div>
                         <Button className="w-full h-11 gap-2" onClick={() => {
                            if (broadcastMessage.trim()) {
                               addBroadcast(broadcastMessage, broadcastTarget);
                               setBroadcastMessage('');
                               alert("Broadcast sent.");
                            }
                         }}>
                            <Send size={16} /> Send broadcast
                         </Button>
                      </div>

                      <div className="space-y-3">
                         <p className="text-xs font-medium text-muted-foreground flex items-center gap-2">
                            <Globe size={14} /> Recent broadcasts
                         </p>
                         <div className="space-y-3 h-[300px] overflow-y-auto pr-1">
                            {broadcasts.length === 0 ? (
                               <div className="flex flex-col items-center justify-center gap-2 h-full text-center">
                                  <Bell className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                                  <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p>
                               </div>
                            ) : broadcasts.slice().reverse().map(b => (
                               <div key={b.id} className="p-4 rounded-xl border border-border bg-card">
                                  <div className="flex items-center justify-between gap-2 mb-2">
                                     <div className="flex items-center gap-2 min-w-0">
                                        <p className="text-sm font-semibold text-foreground truncate">{b.fromName || 'Administrator'}</p>
                                        {b.target && <Badge variant="outline" className="capitalize border-transparent bg-muted text-muted-foreground shrink-0">{b.target}</Badge>}
                                     </div>
                                     <p className="text-xs text-muted-foreground shrink-0">{new Date(b.timestamp).toLocaleDateString()}</p>
                                  </div>
                                  <p className="text-sm text-muted-foreground">{b.message || b.content}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
                <Card className="rounded-xl border border-border bg-card shadow-sm">
                   <CardHeader className="border-b border-border">
                      <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="text-lg font-semibold">Institutional settings</CardTitle>
                            <CardDescription className="text-sm">Governance protocols and faculty management.</CardDescription>
                         </div>
                         <Shield className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-border">
                         <div className="p-5 flex items-center justify-between gap-4 transition-colors hover:bg-muted/40">
                            <div className="flex items-center gap-4">
                               <div className="h-11 w-11 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                  <Construction size={20} strokeWidth={1.5} />
                               </div>
                               <div>
                                  <p className="text-sm font-semibold text-foreground">Lecturer management portal</p>
                                  <p className="text-xs text-muted-foreground pr-4">Global access control for faculty modules.</p>
                               </div>
                            </div>
                            <button
                               type="button"
                               role="switch"
                               aria-checked={lecturerPortalActive}
                               aria-label="Toggle lecturer management portal"
                               className={`w-11 h-6 rounded-full p-0.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${lecturerPortalActive ? 'bg-primary' : 'bg-muted'}`}
                               onClick={toggleLecturerPortal}
                            >
                               <div className={`h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${lecturerPortalActive ? 'translate-x-5' : 'translate-x-0'}`} />
                            </button>
                         </div>

                         <div className="p-5 flex items-center justify-between gap-4 opacity-60">
                            <div className="flex items-center gap-4">
                               <div className="h-11 w-11 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                  <Clock size={20} strokeWidth={1.5} />
                               </div>
                               <div>
                                  <p className="text-sm font-semibold text-foreground">Academic calendar sync</p>
                                  <p className="text-xs text-muted-foreground pr-4">Manual sync of registration windows and audit logs.</p>
                               </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                         </div>

                         <div className="p-5 flex items-center justify-between gap-4 opacity-60">
                            <div className="flex items-center gap-4">
                               <div className="h-11 w-11 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                                  <Settings size={20} strokeWidth={1.5} />
                               </div>
                               <div>
                                  <p className="text-sm font-semibold text-foreground">Infrastructure maintenance</p>
                                  <p className="text-xs text-muted-foreground pr-4">Database vacuuming and session token cleanup.</p>
                               </div>
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <div className="flex justify-end">
                   <Button variant="outline" onClick={logout} className="h-11 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                      <LogOut size={16} /> Sign out
                   </Button>
                </div>
          </TabsContent>
          <TabsContent value="lecturer-reg" className="space-y-6">
            {/* Window Status Card */}
            <Card className="rounded-xl border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Lecturer Course Registration Window</CardTitle>
                  <CardDescription className="text-sm">
                    Set the registration period for lecturers to declare their offered courses.
                  </CardDescription>
                </div>
                <Badge
                  variant="secondary"
                  className={`font-medium shrink-0 ${
                    lecturerCourseRegWindow.open ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${
                    lecturerCourseRegWindow.open ? 'bg-success' : 'bg-muted-foreground'
                  }`} />
                  {lecturerCourseRegWindow.open ? 'Open' : 'Closed'}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-5">
                {/* Configure window */}
                <div className="grid gap-4 rounded-md border border-border bg-muted/40 p-4 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Semester</Label>
                    <Select value={lcrSemester} onValueChange={setLcrSemester}>
                      <SelectTrigger className="h-10"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1st">1st semester</SelectItem>
                        <SelectItem value="2nd">2nd semester</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Session</Label>
                    <Input
                      value={lcrSession}
                      onChange={e => setLcrSession(e.target.value)}
                      className="h-10"
                      placeholder="e.g. 2025/2026"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">Start date</Label>
                    <Input
                      type="datetime-local"
                      value={lcrStartDate}
                      onChange={e => setLcrStartDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-medium text-muted-foreground">End date (deadline)</Label>
                    <Input
                      type="datetime-local"
                      value={lcrEndDate}
                      onChange={e => setLcrEndDate(e.target.value)}
                      className="h-10"
                    />
                  </div>
                </div>

                {/* Open / Force-close buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    className="gap-2"
                    disabled={!lcrEndDate || !lcrStartDate}
                    onClick={() => {
                      if (!lcrStartDate || !lcrEndDate) { alert('Set both a start and end date first.'); return; }
                      if (confirm(`Open lecturer course registration for ${lcrSemester} semester (${lcrSession})? Deadline: ${new Date(lcrEndDate).toLocaleString()}`)) {
                        openLecturerCourseReg(
                          new Date(lcrStartDate).toISOString(),
                          new Date(lcrEndDate).toISOString(),
                          lcrSemester,
                          lcrSession
                        );
                      }
                    }}
                  >
                    <LockOpen size={15} /> Open registration
                  </Button>
                  <Button
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    disabled={!lecturerCourseRegWindow.open}
                    onClick={() => {
                      if (confirm('Force-close lecturer course registration? All lecturers will immediately lose edit access.')) {
                        closeLecturerCourseReg();
                      }
                    }}
                  >
                    <Lock size={15} /> Force-close
                  </Button>
                </div>

                {/* Active window info */}
                {lecturerCourseRegWindow.session && (
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 rounded-md border border-border bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5"><CalendarDays size={13} /> {lecturerCourseRegWindow.semester} semester · {lecturerCourseRegWindow.session}</span>
                    {lecturerCourseRegWindow.startDate && <span>Start: {new Date(lecturerCourseRegWindow.startDate).toLocaleString()}</span>}
                    {lecturerCourseRegWindow.endDate && <span>Deadline: {new Date(lecturerCourseRegWindow.endDate).toLocaleString()}</span>}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Lecturer Status Table */}
            <Card className="rounded-xl border border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
                <div>
                  <CardTitle className="text-lg font-semibold">Lecturer Status</CardTitle>
                  <CardDescription className="text-sm">Track who has registered and who hasn't.</CardDescription>
                </div>
                <div className="relative w-56">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search lecturers…"
                    className="pl-9 h-9"
                    value={lcrSearchQuery}
                    onChange={e => setLcrSearchQuery(e.target.value)}
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {(() => {
                  const lecturers = allUsers.filter(u => u.role === 'lecturer' &&
                    (!lcrSearchQuery || u.name.toLowerCase().includes(lcrSearchQuery.toLowerCase()) || (u.department||'').toLowerCase().includes(lcrSearchQuery.toLowerCase()))
                  );
                  if (lecturers.length === 0) {
                    return (
                      <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                        <Users className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                        <p className="text-sm text-muted-foreground">No lecturers found.</p>
                      </div>
                    );
                  }
                  return (
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow className="border-border">
                          <TableHead className="py-4 text-xs font-medium text-muted-foreground">Lecturer</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Status</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Courses selected</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground">Submitted at</TableHead>
                          <TableHead className="text-xs font-medium text-muted-foreground text-right px-6">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lecturers.map(lec => {
                          const reg = lecturerCourseRegistrations[lec.id];
                          const hasOverride = lecturerRegOverrides.includes(lec.id);
                          const regCourses = reg ? courses.filter(c => (reg.courseIds || []).includes(c.id)) : [];
                          const statusLabel = reg?.submittedAt ? 'Submitted' : reg?.courseIds?.length > 0 ? 'Draft saved' : 'Not started';
                          const statusColor = reg?.submittedAt ? 'bg-success/10 text-success' : reg?.courseIds?.length > 0 ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground';

                          return (
                            <TableRow key={lec.id} className="border-border hover:bg-muted/40 transition-colors">
                              <TableCell className="py-4">
                                <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-semibold">
                                    {lec.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="text-sm font-semibold text-foreground leading-none">{lec.name}</p>
                                    <p className="text-xs text-muted-foreground mt-1">{lec.department || lec.college || lec.staffId}</p>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusColor}`}>
                                  {reg?.submittedAt && <CheckCircle size={11} />}
                                  {statusLabel}
                                </span>
                                {hasOverride && (
                                  <span className="ml-1.5 inline-flex items-center gap-1 rounded-full bg-info/10 px-2 py-0.5 text-[10px] font-medium text-info">
                                    <RefreshCw size={9} /> Override
                                  </span>
                                )}
                              </TableCell>
                              <TableCell>
                                <span className="tabular-nums text-sm text-foreground font-medium">{regCourses.length}</span>
                                <span className="ml-1 text-xs text-muted-foreground">course{regCourses.length !== 1 ? 's' : ''}</span>
                              </TableCell>
                              <TableCell>
                                <span className="text-xs text-muted-foreground">
                                  {reg?.submittedAt ? new Date(reg.submittedAt).toLocaleString() : '—'}
                                </span>
                              </TableCell>
                              <TableCell className="text-right px-6">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* View registered courses */}
                                  {regCourses.length > 0 && (
                                    <Button
                                      variant="ghost" size="icon"
                                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                      title="View registered courses"
                                      onClick={() => setViewRegLecturer(lec)}
                                    >
                                      <Eye size={15} />
                                    </Button>
                                  )}
                                  {/* Re-open / revoke override */}
                                  {hasOverride ? (
                                    <Button
                                      variant="ghost" size="sm"
                                      className="h-8 gap-1.5 text-xs text-warning hover:text-warning"
                                      onClick={() => revokeOverrideLecturerReg(lec.id)}
                                    >
                                      <Lock size={13} /> Revoke
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="ghost" size="sm"
                                      className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
                                      title="Re-open registration for this lecturer"
                                      onClick={() => {
                                        if (confirm(`Re-open course registration for ${lec.name}? They will be able to edit their selection even if the window is closed.`)) {
                                          overrideLecturerReg(lec.id);
                                        }
                                      }}
                                    >
                                      <LockOpen size={13} /> Re-open
                                    </Button>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  );
                })()}
              </CardContent>
            </Card>

            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {(() => {
                const lecturers = allUsers.filter(u => u.role === 'lecturer');
                const submitted = lecturers.filter(l => !!lecturerCourseRegistrations[l.id]?.submittedAt).length;
                const drafted = lecturers.filter(l => !lecturerCourseRegistrations[l.id]?.submittedAt && (lecturerCourseRegistrations[l.id]?.courseIds?.length > 0)).length;
                const notStarted = lecturers.length - submitted - drafted;
                return [
                  { label: 'Total faculty', value: lecturers.length, color: 'text-foreground' },
                  { label: 'Submitted', value: submitted, color: 'text-success' },
                  { label: 'Draft saved', value: drafted, color: 'text-warning' },
                  { label: 'Not started', value: notStarted, color: 'text-muted-foreground' },
                ].map((s, i) => (
                  <Card key={i} className="rounded-xl border border-border bg-card shadow-sm">
                    <CardContent className="p-4 text-center">
                      <p className={`text-2xl font-semibold tabular-nums ${s.color}`}>{s.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
                    </CardContent>
                  </Card>
                ));
              })()}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* View lecturer registered courses dialog */}
      <Dialog open={!!viewRegLecturer} onOpenChange={open => !open && setViewRegLecturer(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
              {viewRegLecturer?.name} — Registered Courses
            </DialogTitle>
            <DialogDescription>
              {viewRegLecturer && lecturerCourseRegistrations[viewRegLecturer.id]?.submittedAt
                ? `Submitted ${new Date(lecturerCourseRegistrations[viewRegLecturer.id].submittedAt).toLocaleString()}`
                : 'Draft — not yet submitted.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {viewRegLecturer && (() => {
              const reg = lecturerCourseRegistrations[viewRegLecturer.id];
              const regCourses = reg ? courses.filter(c => (reg.courseIds || []).includes(c.id)) : [];
              return regCourses.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">No courses selected.</p>
              ) : regCourses.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
                  <span className="w-5 text-right text-xs tabular-nums text-muted-foreground">{i + 1}.</span>
                  <div className="h-8 w-8 shrink-0 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: c.color || '#3b82f6' }}>
                    {c.code?.split(' ')[0]?.substring(0,3)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.code} · {c.units} units · {c.level}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewRegLecturer(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
