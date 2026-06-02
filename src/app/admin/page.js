"use client";
// Institutional Registry Rebuild v3 - 2026-04-23

import { useStore } from '@/store/useStore';
import { Users, BookOpen, Bell, Shield, Search, Plus, BarChart2, UserPlus, Trash2, ShieldCheck, Activity, Clock, Send, Globe, Database, Settings, RotateCcw, LogOut, Sun, Moon, Construction, CheckCircle, ChevronRight, UserCheck } from 'lucide-react';
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

const ACADEMIC_PROGRAMS = {
  "College of Allied Health Sciences": [
    "Nursing Science", "Medical Laboratory Science", "Public Health", "Nutrition and Dietetics", "Biomedical Technology"
  ],
  "College of Basic and Applied Sciences (CBAS)": [
    "Biochemistry", "Biology", "Biotechnology", "Chemistry", "Computer Science", "Cyber Security", 
    "Food Science and Technology", "Geology", "Applied Geophysics", "Industrial Chemistry", 
    "Mathematics", "Microbiology", "Physics", "Physics with Electronics", "Software Engineering"
  ],
  "College of Humanities, Management and Social Sciences (CHMS)": [
    "Accounting", "Business Administration", "Economics", "English Language", "Fine and Applied Art", 
    "Finance", "Industrial Relations and Personnel Management", "Mass Communication", "Music", 
    "Philosophy", "Public Administration", "Religious Studies", "Security and Investment"
  ]
};

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

  const hasHydrated = useStore(state => state._hasHydrated);
  const dynamicUsers = useStore(state => state.dynamicUsers);
  const excludedIds = useStore(state => state.excludedIds);
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

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
  
  const [activeTab, setActiveTab] = useState('overview');
  const [searchQuery, setSearchQuery] = useState('');
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

  // Unified Hydration & Auth Check
  if (!mounted || !hasHydrated) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-black uppercase tracking-widest text-slate-500 animate-pulse">Initializing Security Protocol...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-4">
        <Shield className="h-12 w-12 text-red-500 animate-bounce" />
        <p className="text-xs font-black uppercase tracking-widest text-red-500">Access Denied. Redirecting to Gateway...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Top Navigation */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white p-1 rounded-xl shadow-md h-10 w-10 flex items-center justify-center">
              <img src="/mtu-logo.png" alt="Mountain Top University" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase line-clamp-1">Mountain Top University</h1>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Admin Control Center</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
             <Button variant="ghost" size="icon" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="rounded-xl">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
             </Button>
             <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1" />
             <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800/50 p-1.5 pr-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="h-8 w-8 rounded-lg bg-purple-600 flex items-center justify-center text-white text-xs font-black">AD</div>
                <div className="hidden sm:block">
                   <p className="text-xs font-black text-slate-900 dark:text-white leading-none capitalize">{user.name}</p>
                   <p className="text-[9px] font-bold text-purple-600 uppercase tracking-widest mt-0.5">System Admin</p>
                </div>
             </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex items-center justify-between overflow-x-auto pb-2 scrollbar-hide">
            <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 h-auto">
              <TabsTrigger value="overview" className="rounded-xl px-5 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg gap-2 text-xs font-black uppercase tracking-wider">
                <BarChart2 className="h-4 w-4" /> Overview
              </TabsTrigger>
              <TabsTrigger value="directory" className="rounded-xl px-5 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg gap-2 text-xs font-black uppercase tracking-wider">
                <Users className="h-4 w-4" /> Identity Directory
              </TabsTrigger>
              <TabsTrigger value="courses" className="rounded-xl px-5 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg gap-2 text-xs font-black uppercase tracking-wider">
                <BookOpen className="h-4 w-4" /> Course Registry
              </TabsTrigger>
              <TabsTrigger value="comms" className="rounded-xl px-5 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg gap-2 text-xs font-black uppercase tracking-wider">
                <Bell className="h-4 w-4" /> Broadcasts
              </TabsTrigger>
              <TabsTrigger value="governance" className="rounded-xl px-5 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg gap-2 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="h-4 w-4" /> Governance
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Identities', value: allUsers.length, detail: 'Dynamic Registry', icon: Users, color: 'bg-blue-500' },
                { title: 'Active Modules', value: courses.length, detail: 'Academic Catalog', icon: BookOpen, color: 'bg-purple-500' },
                { title: 'Broadcasts', value: broadcasts.length, detail: 'Total Signals', icon: Bell, color: 'bg-amber-500' },
                { title: 'Security Protocol', value: 'Active', detail: 'Institutional encryption', icon: Shield, color: 'bg-teal-500' },
              ].map((stat, i) => (
                <Card key={i} className="border-none shadow-xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{stat.title}</p>
                        <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{stat.value}</h3>
                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">{stat.detail}</p>
                      </div>
                      <div className={`${stat.color} p-4 rounded-2xl shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                        <stat.icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden mt-8">
               <CardHeader>
                  <CardTitle className="text-xl font-black">Real-time Activity Spectrum</CardTitle>
                  <CardDescription className="text-xs">Monitoring all institutional events and data modifications.</CardDescription>
               </CardHeader>
               <CardContent>
                  <div className="h-48 flex items-end justify-between gap-2">
                     {[40, 70, 45, 90, 65, 80, 55, 30, 95, 60, 75, 50].map((h, i) => (
                        <div key={i} className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-t-lg relative group">
                           <div className="absolute bottom-0 w-full bg-purple-600 rounded-t-lg transition-all duration-500 ease-out group-hover:bg-purple-400" style={{ height: `${h}%` }}></div>
                        </div>
                     ))}
                  </div>
               </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="directory" className="space-y-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                   <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                   <Input 
                      placeholder="Search identities (Email, Matric No, Staff ID)..." 
                      className="pl-12 h-12 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-2xl font-bold shadow-sm"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                   />
                </div>
                
                <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-teal-600 hover:bg-teal-700 h-12 px-6 rounded-2xl shadow-lg shadow-teal-600/20 gap-2 font-black uppercase text-xs">
                          <UserPlus className="h-5 w-5" /> Identity Overwrite
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px] rounded-3xl">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black tracking-tighter">Identity Registration</DialogTitle>
                            <DialogDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Create a new institutional record.</DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-6 py-6">
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Full Legal Name</Label>
                                <Input value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="rounded-xl font-bold h-11" placeholder="e.g. John Doe" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Email</Label>
                                <Input value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="rounded-xl font-bold h-11" placeholder="name@mtu.edu.ng" />
                            </div>
                            <div className="grid gap-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Role</Label>
                                <Select value={newUser.role} onValueChange={v => setNewUser({...newUser, role: v})}>
                                    <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue placeholder="Select role" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="student">Student Account</SelectItem>
                                        <SelectItem value="lecturer">Faculty Member</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {newUser.role === 'student' ? (
                               <>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Departmental Program</Label>
                                    <Select value={newUser.program} onValueChange={v => setNewUser({...newUser, program: v})}>
                                        <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue placeholder="Select program" /></SelectTrigger>
                                        <SelectContent>
                                            {Object.entries(ACADEMIC_PROGRAMS).map(([college, progs]) => (
                                                <SelectGroup key={college} label={college}>
                                                    {progs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                                </SelectGroup>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Matriculation Number</Label>
                                    <Input value={newUser.matNo} onChange={e => setNewUser({...newUser, matNo: e.target.value})} className="rounded-xl font-bold h-11" placeholder="210101010" />
                                </div>
                               </>
                            ) : (
                                <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Faculty ID</Label>
                                    <Input value={newUser.staffId} onChange={e => setNewUser({...newUser, staffId: e.target.value})} className="rounded-xl font-bold h-11" placeholder="LEC/2026/000" />
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button className="w-full h-12 bg-teal-600 hover:bg-teal-700 rounded-xl font-black uppercase text-xs" onClick={() => {
                                if (addUser(newUser).success) {
                                  setIsAddUserOpen(false);
                                  setNewUser({ name: '', email: '', role: 'student', college: '', program: '', matNo: '', staffId: '' });
                                  alert("Identity Committed Successfully.");
                                }
                            }}>Commit Identity</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                         <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Identity Profile</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">ID Reference</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">Role</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">Security Pass</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">Last Seen</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Actions</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {allUsers
                        .filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
                        .reverse()
                        .map((u) => (
                         <TableRow key={u.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <TableCell className="py-5">
                               <div className="flex items-center gap-3">
                                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white text-xs font-black shadow-lg ${u.role === 'admin' ? 'bg-red-500 shadow-red-500/20' : u.role === 'lecturer' ? 'bg-indigo-500 shadow-indigo-500/20' : 'bg-teal-500 shadow-teal-500/20'}`}>
                                     {u.name.substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{u.name}</p>
                                     <p className="text-[10px] font-bold text-slate-500 mt-1">{u.email}</p>
                                     {u.role === 'student' && <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter mt-0.5">{u.program}</p>}
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <code className="text-xs font-bold px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400">
                                  {u.matNo || u.staffId || 'SYS-UID'}
                               </code>
                            </TableCell>
                            <TableCell>
                               <Badge className={`${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : u.role === 'lecturer' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-teal-500/10 text-teal-500'} border-none shadow-none text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg`}>
                                  {u.role}
                               </Badge>
                            </TableCell>
                            <TableCell>
                               <code className="text-[10px] font-mono px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 cursor-pointer hover:text-slate-900 dark:hover:text-white" title="Click to copy" onClick={() => navigator.clipboard.writeText(u.password || 'password123')}>
                                  {u.password || 'password123'}
                               </code>
                            </TableCell>
                            <TableCell>
                               <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                  {u.lastSeen || 'Just now'}
                               </span>
                            </TableCell>
                            <TableCell className="text-right px-8">
                               <div className="flex items-center justify-end gap-2">
                                  {u.role === 'student' && (
                                    <Dialog open={enrollingStudent?.id === u.id} onOpenChange={open => !open && setEnrollingStudent(null)}>
                                       <DialogTrigger asChild>
                                          <Button variant="outline" size="sm" onClick={() => setEnrollingStudent(u)} className="h-8 text-[9px] font-black uppercase tracking-widest gap-1 border-teal-200 text-teal-600 dark:border-teal-900 dark:text-teal-400 rounded-lg hover:bg-teal-50 dark:hover:bg-teal-900/20">
                                            <ShieldCheck size={12} /> Enrollment
                                          </Button>
                                       </DialogTrigger>
                                       <DialogContent className="max-w-2xl rounded-3xl max-h-[85vh] overflow-y-auto">
                                          <DialogHeader>
                                             <DialogTitle className="text-2xl font-black">Management Interface: {u.name}</DialogTitle>
                                             <DialogDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Overwriting institutional course assignments for {u.program}.</DialogDescription>
                                          </DialogHeader>
                                          <div className="space-y-6 py-4">
                                             {['100L', '200L', '300L', '400L'].map(level => (
                                                <div key={level} className="space-y-3">
                                                   <div className="flex items-center gap-2 px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg w-fit">
                                                      <div className="h-2 w-2 rounded-full bg-purple-600 animate-pulse" />
                                                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">{level} Registry</p>
                                                   </div>
                                                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                      {courses.filter(c => c.level === level && (c.program === 'General' || c.program === u.program)).map(course => (
                                                         <div key={course.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${u.enrolledCourseIds?.includes(course.id) ? 'bg-purple-600/5 border-purple-200 dark:border-purple-800' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-sm'}`} onClick={() => adminToggleEnrollment(u.id, course.id)}>
                                                            <div className="flex items-center gap-3">
                                                               <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-white text-[10px] font-black shadow-md`} style={{ backgroundColor: course.color }}>{course.code.substring(0, 3)}</div>
                                                               <div>
                                                                  <p className="text-xs font-black text-slate-900 dark:text-white leading-tight">{course.title}</p>
                                                                  <p className="text-[9px] font-bold text-slate-500 mt-0.5">{course.code} • {course.units || 2} Units • {course.semester}</p>
                                                               </div>
                                                            </div>
                                                            <div className={`h-6 w-6 rounded-lg flex items-center justify-center transition-all ${u.enrolledCourseIds?.includes(course.id) ? 'bg-purple-600 text-white scale-110 shadow-lg shadow-purple-600/20' : 'bg-slate-100 dark:bg-slate-800 text-transparent'}`}>
                                                               <CheckCircle size={14} strokeWidth={4} />
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

                                  <Button variant="ghost" size="icon" onClick={() => resetToDefaultPassword(u.id)} title="Reset to default password" className="h-8 w-8 text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/20 rounded-lg">
                                     <RotateCcw size={16} />
                                  </Button>
                                  {u.role !== 'admin' && (
                                     <Button variant="ghost" size="icon" onClick={() => { if(confirm(`Confirm permanent deletion of ${u.name}?`)) deleteUser(u.id); }} className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg">
                                        <Trash2 size={16} />
                                     </Button>
                                  )}
                               </div>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          </TabsContent>

          <TabsContent value="courses" className="space-y-6">
             <div className="flex flex-col xl:flex-row xl:items-center gap-4">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    {['all', '100L', '200L', '300L', '400L'].map(level => (
                        <button key={level} className={`px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${adminCourseLevelFilter === level ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`} onClick={() => setAdminCourseLevelFilter(level)}>
                          {level === 'all' ? 'Universal Registry' : level}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                   <div className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 flex">
                      {['all', '1st', '2nd'].map(sem => (
                         <button key={sem} className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase transition-all ${adminCourseSemesterFilter === sem ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`} onClick={() => setAdminCourseSemesterFilter(sem)}>
                           {sem === 'all' ? 'All Sem' : sem}
                         </button>
                      ))}
                   </div>
                   
                   <div className="w-56">
                    <Select value={adminCourseProgramFilter} onValueChange={setAdminCourseProgramFilter}>
                        <SelectTrigger className="h-10 rounded-xl font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"><SelectValue placeholder="Departmental Filter" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Departments</SelectItem>
                            <SelectItem value="General">General (GST/ENT)</SelectItem>
                            {Object.entries(ACADEMIC_PROGRAMS).map(([college, progs]) => (
                                <SelectGroup key={college} label={college}>
                                    {progs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                </SelectGroup>
                            ))}
                        </SelectContent>
                    </Select>
                   </div>
                </div>

                <div className="xl:ml-auto flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-2xl font-black uppercase text-xs gap-2 border-purple-200 text-purple-600 dark:border-purple-900 dark:text-purple-400" onClick={() => {
                       const targetProg = adminCourseProgramFilter === 'all' ? 'Mathematics' : adminCourseProgramFilter;
                       const targetLev = adminCourseLevelFilter === 'all' ? '100L' : adminCourseLevelFilter;
                       if(confirm(`Commit institutional templates for ${targetProg} (${targetLev})?`)) {
                          const templates = {
                            'Mathematics': [
                               { title: 'Introduction to Real Analysis', code: 'MTH 301', units: 3, level: '300L', semester: '1st', program: 'Mathematics' },
                               { title: 'Algebraic Structures', code: 'MTH 303', units: 3, level: '300L', semester: '1st', program: 'Mathematics' },
                               { title: 'Vector Analysis', code: 'MTH 312', units: 2, level: '312', semester: '2nd', program: 'Mathematics' }
                            ]
                          };
                          const seed = templates[targetProg] || [];
                          const batch = seed.filter(s => s.level === targetLev);
                          if(batch.length === 0) alert("No templates available for this criteria. Switching to general registry load...");
                          batch.forEach(c => addCourse(c));
                          alert(`Seeded ${batch.length} modules.`);
                       }
                    }}>
                       <Database size={18} /> Smart Seed
                    </Button>
                    <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-600 hover:bg-purple-700 h-12 px-6 rounded-2xl shadow-lg shadow-purple-600/20 gap-2 font-black uppercase text-xs text-white">
                                <Plus size={20} /> Register Module
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px] rounded-3xl">
                           <DialogHeader>
                               <DialogTitle className="text-2xl font-black">Register Academic Module</DialogTitle>
                               <DialogDescription className="text-xs font-bold uppercase tracking-wider text-slate-500">Add a course to the institutional catalog.</DialogDescription>
                           </DialogHeader>
                           <div className="grid gap-6 py-6">
                              <div className="grid gap-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Module Title</Label>
                                  <Input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} className="rounded-xl font-bold h-11" placeholder="e.g. Metric Space Topology" />
                              </div>
                              <div className="grid gap-2">
                                  <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Code</Label>
                                  <Input value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} className="rounded-xl font-bold h-11" placeholder="MTH 301" />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                 <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Level</Label>
                                    <Select value={newCourse.level} onValueChange={v => setNewCourse({...newCourse, level: v})}>
                                        <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {['100L', '200L', '300L', '400L'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                 </div>
                                 <div className="grid gap-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester</Label>
                                    <Select value={newCourse.semester} onValueChange={v => setNewCourse({...newCourse, semester: v})}>
                                        <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1st">1st Semester</SelectItem>
                                            <SelectItem value="2nd">2nd Semester</SelectItem>
                                        </SelectContent>
                                    </Select>
                                 </div>
                              </div>
                              <div className="grid gap-2">
                                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Restricted Department / Program</Label>
                                 <Select value={newCourse.program} onValueChange={v => setNewCourse({...newCourse, program: v})}>
                                    <SelectTrigger className="h-11 rounded-xl font-bold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="General">General (Public Access)</SelectItem>
                                        {Object.entries(ACADEMIC_PROGRAMS).map(([college, progs]) => (
                                            <SelectGroup key={college} label={college}>
                                                {progs.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                                            </SelectGroup>
                                        ))}
                                    </SelectContent>
                                 </Select>
                              </div>
                           </div>
                           <DialogFooter>
                              <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 rounded-xl font-black uppercase text-xs text-white" onClick={() => {
                                 if (newCourse.title && newCourse.code) {
                                    addCourse(newCourse);
                                    setIsAddCourseOpen(false);
                                    setNewCourse({ title: '', code: '', units: 2, level: '100L', semester: '1st', program: 'General', color: '#3b82f6' });
                                    alert("Module Registered.");
                                 }
                              }}>Register Module</Button>
                           </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
             </div>

             <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xl">
                <Table>
                   <TableHeader className="bg-slate-50 dark:bg-slate-800/50">
                      <TableRow className="border-slate-200 dark:border-slate-800">
                         <TableHead className="text-[10px] font-black uppercase tracking-widest py-5">Academic Module</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">Level / Sem</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest">Program / Department</TableHead>
                         <TableHead className="text-[10px] font-black uppercase tracking-widest text-right px-8">Management</TableHead>
                      </TableRow>
                   </TableHeader>
                   <TableBody>
                      {courses
                        .filter(c => (adminCourseLevelFilter === 'all' || c.level === adminCourseLevelFilter))
                        .filter(c => (adminCourseSemesterFilter === 'all' || c.semester === adminCourseSemesterFilter))
                        .filter(c => (adminCourseProgramFilter === 'all' || c.program === adminCourseProgramFilter))
                        .reverse()
                        .map((c) => (
                         <TableRow key={c.id} className="border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <TableCell className="py-5 px-6">
                               <div className="flex items-center gap-4">
                                  <div className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-[10px] font-black shadow-lg shadow-blue-500/10" style={{ backgroundColor: c.color }}>
                                     {c.code.split(' ')[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-black text-slate-900 dark:text-white leading-none">{c.title}</p>
                                     <p className="text-[10px] font-bold text-slate-500 mt-1.5">{c.code} • {c.units || 2} Credits</p>
                                  </div>
                               </div>
                            </TableCell>
                            <TableCell>
                               <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-[9px] font-black border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">{c.level}</Badge>
                                  <Badge variant="outline" className="text-[9px] font-black border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">{c.semester}</Badge>
                               </div>
                            </TableCell>
                            <TableCell>
                               <p className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                                  {c.program === 'General' ? <span className="text-teal-500 font-extrabold tracking-widest uppercase text-[9px]">Universal</span> : c.program}
                               </p>
                            </TableCell>
                            <TableCell className="text-right px-8">
                               <Button variant="ghost" size="icon" onClick={() => { if(confirm(`Flush ${c.code} from registry?`)) deleteCourse(c.id); }} className="h-9 w-9 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-xl">
                                  <Trash2 size={16} />
                               </Button>
                            </TableCell>
                         </TableRow>
                      ))}
                   </TableBody>
                </Table>
             </div>
          </TabsContent>

          <TabsContent value="comms" className="space-y-6">
             <Card className="border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                <CardHeader>
                   <CardTitle className="text-xl font-black">Strategic Communication Terminal</CardTitle>
                   <CardDescription className="text-xs">Issue institutional broadcasts and security alerts.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                   <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                         <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-xs">Audience targeting</Label>
                            <Select value={broadcastTarget} onValueChange={setBroadcastTarget}>
                               <SelectTrigger className="rounded-xl font-bold h-11"><SelectValue /></SelectTrigger>
                               <SelectContent>
                                  <SelectItem value="all">Universal Broadcast (All Roles)</SelectItem>
                                  <SelectItem value="student">Student Body Only</SelectItem>
                                  <SelectItem value="lecturer">Staff & Faculty Only</SelectItem>
                               </SelectContent>
                            </Select>
                         </div>
                         <div className="grid gap-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-xs">Signal Payload</Label>
                            <textarea 
                               className="w-full min-h-[120px] rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 p-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all"
                               placeholder="Draft your institutional directive..."
                               value={broadcastMessage}
                               onChange={e => setBroadcastMessage(e.target.value)}
                            />
                         </div>
                         <Button className="w-full h-14 bg-purple-600 hover:bg-purple-700 shadow-xl shadow-purple-600/20 rounded-2xl font-black uppercase tracking-widest gap-2 text-white" onClick={() => {
                            if (broadcastMessage.trim()) {
                               addBroadcast(broadcastMessage, broadcastTarget);
                               setBroadcastMessage('');
                               alert("Broadcast Transmitted.");
                            }
                         }}>
                            <Send size={18} /> Transmit Shield Signal
                         </Button>
                      </div>

                      <div className="space-y-4">
                         <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                            <Globe size={14} /> Active Transmissions
                         </p>
                         <div className="space-y-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                            {broadcasts.slice().reverse().map(b => (
                               <div key={b.id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-700">
                                  <div className="flex items-center justify-between mb-2">
                                     <Badge className="bg-purple-600/10 text-purple-600 border-none text-[8px] font-black uppercase tracking-widest">{b.target}</Badge>
                                     <p className="text-[9px] font-bold text-slate-400 lowercase">{new Date(b.timestamp).toLocaleDateString()}</p>
                                  </div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">{b.message || b.content}</p>
                               </div>
                            ))}
                         </div>
                      </div>
                   </div>
                </CardContent>
             </Card>
          </TabsContent>

          <TabsContent value="governance" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-xl bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
                   <CardHeader className="border-b border-slate-100 dark:border-slate-800">
                      <div className="flex items-center justify-between">
                         <div>
                            <CardTitle className="text-xl font-black">Institutional Settings</CardTitle>
                            <CardDescription className="text-xs">Governance protocols and faculty management.</CardDescription>
                         </div>
                         <Shield className="h-8 w-8 text-purple-600/20" />
                      </div>
                   </CardHeader>
                   <CardContent className="p-0">
                      <div className="divide-y divide-slate-100 dark:divide-slate-800">
                         <div className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                                  <Construction size={24} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">Lecturer Management Portal</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-4">Global access control for faculty member modules.</p>
                               </div>
                            </div>
                            <div 
                               className={`w-14 h-8 rounded-full p-1 cursor-pointer transition-all duration-300 ${lecturerPortalActive ? 'bg-indigo-600' : 'bg-slate-200 dark:bg-slate-800'}`}
                               onClick={toggleLecturerPortal}
                            >
                               <div className={`h-6 w-6 rounded-full bg-white shadow-md transform transition-all duration-300 ${lecturerPortalActive ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                         </div>

                         <div className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors opacity-50">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                                  <Clock size={24} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">Academic Calendar Sync</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-4">Manual synchronization of registration windows and audit logs.</p>
                               </div>
                            </div>
                            <ChevronRight className="text-slate-300" />
                         </div>

                         <div className="p-6 flex items-center justify-between group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors opacity-50">
                            <div className="flex items-center gap-4">
                               <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                                  <Settings size={24} />
                               </div>
                               <div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white">Infrastructure Maintenance</p>
                                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pr-4">Database vacuuming and session token garbage collection.</p>
                               </div>
                            </div>
                            <ChevronRight className="text-slate-300" />
                         </div>
                      </div>
                   </CardContent>
                </Card>

                <div className="space-y-6">
                   <Card className="border-none shadow-xl bg-gradient-to-br from-purple-600 to-indigo-700 rounded-3xl overflow-hidden text-white">
                      <CardHeader>
                         <CardTitle className="text-lg font-black uppercase tracking-tighter">Admin Status</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                         <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                            <Activity size={20} className="text-teal-300" />
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Node Integrity</p>
                               <p className="text-sm font-black">99.98% Stabilized</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-3 bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10">
                            <Shield size={20} className="text-amber-300" />
                            <div>
                               <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Encrypted Tunnel</p>
                               <p className="text-sm font-black">TLS 1.3 Active</p>
                            </div>
                         </div>
                      </CardContent>
                   </Card>

                   <Button variant="ghost" onClick={logout} className="w-full h-14 bg-red-500/5 hover:bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 font-black uppercase tracking-widest gap-2">
                      <LogOut size={18} /> Terminal Exit
                   </Button>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
