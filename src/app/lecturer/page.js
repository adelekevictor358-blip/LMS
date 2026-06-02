"use client";

import { useStore } from '@/store/useStore';
import { 
  Users, BookOpen, Clock, FileText, Play, 
  MessageSquare, TrendingUp, Plus, ChevronRight, 
  Settings, LogOut, CheckCircle, Video
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

export default function LecturerDashboard() {
  const router = useRouter();
  const { user, courses, assignments, submissions, startLiveSession, logout, getLecturerTotalStudents, scheduledSessions } = useStore();

  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myCourseIds = myCourses.map(c => c.id);
  const myAssignments = assignments.filter(a => myCourseIds.includes(a.courseId));
  const pendingGradiing = submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId) && s.score === null);
  const totalStudents = user?.id ? getLecturerTotalStudents(user.id) : 0;
  const myScheduledSessions = scheduledSessions?.filter(s => myCourseIds.includes(s.courseId)).length ?? 0;

  const stats = [
    { label: 'Total Students', value: totalStudents, icon: <Users className="text-blue-600" />, color: 'blue' },
    { label: 'Active Courses', value: myCourses.length, icon: <BookOpen className="text-teal-600" />, color: 'teal' },
    { label: 'Pending Grades', value: pendingGradiing.length, icon: <FileText className="text-orange-600" />, color: 'orange' },
    { label: 'Scheduled Sessions', value: myScheduledSessions, icon: <Video className="text-purple-600" />, color: 'purple' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm">
        <div>
           <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-blue-600/10 text-blue-600 border-none font-bold text-[10px] px-3 py-1">FACULTY PORTAL ACTIVE</Badge>
           </div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Welcome, {user?.name}! 👋</h1>
           <p className="text-slate-500 mt-1 font-medium italic">Orchestrate your academic sessions and manage student performance from your command hub.</p>
        </div>
        <div className="flex gap-3">
           <Button className="bg-blue-600 hover:bg-blue-700 font-bold" onClick={() => router.push('/lecturer/students')}>Manage Cohorts</Button>
           <Button variant="outline" className="font-bold" onClick={() => { logout(); router.push('/login'); }}>Terminate Session</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-4 rounded-xl bg-slate-50 dark:bg-slate-800`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
           {/* Active Orchestration */}
           <Card className="border shadow-sm overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-800/50 p-6 border-b">
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <Play className="text-blue-600" size={20} /> Real-time Class Orchestration
                 </CardTitle>
                 <CardDescription>Launch a virtual auditorium session for your enrolled students.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                 {myCourses.map((course, idx) => (
                   <div key={idx} className="p-6 flex items-center justify-between border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <div className="flex items-center gap-4">
                         <div className="h-10 w-10 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">{course.code.slice(0, 3)}</div>
                         <div>
                            <p className="font-bold text-slate-900 dark:text-white">{course.title}</p>
                            <p className="text-xs text-slate-500">{course.level} · {course.semester} Semester</p>
                         </div>
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-lg font-bold" onClick={() => {
                        const sessionId = startLiveSession(course.id);
                        router.push(`/dashboard/classroom/${sessionId}`);
                      }}>
                        <Video size={16} className="mr-2" /> Start Session
                      </Button>
                   </div>
                 ))}
              </CardContent>
           </Card>

           {/* Performance Analytics Overview */}
           <div className="flex items-center justify-between mb-2 px-2">
              <h3 className="text-xl font-bold flex items-center gap-2">
                 <TrendingUp className="text-blue-600" size={20} /> Cohort Analytics
              </h3>
              <Button variant="link" className="text-blue-600 font-bold" onClick={() => router.push('/lecturer/students')}>Full Report <ChevronRight size={16} /></Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myCourses.slice(0, 2).map((course, idx) => (
                <Card key={idx} className="hover:border-blue-200 transition-all">
                  <CardContent className="p-6 space-y-6">
                     <div className="flex justify-between items-start">
                        <Badge variant="outline" className="font-bold border-blue-200 text-blue-600">{course.code}</Badge>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Avg Yield: 76%</span>
                     </div>
                     <h4 className="font-bold text-slate-900 dark:text-white">{course.title}</h4>
                     <div className="flex justify-around py-4 border-t border-b">
                        <div className="text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase italic">Particip.</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white">92%</p>
                        </div>
                        <div className="h-10 w-px bg-slate-100 dark:bg-slate-800" />
                        <div className="text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase italic">Submiss.</p>
                           <p className="text-xl font-black text-slate-900 dark:text-white">84%</p>
                        </div>
                     </div>
                  </CardContent>
                </Card>
              ))}
           </div>
        </div>

        <div className="space-y-8">
           {/* Recent Submissions */}
           <Card className="shadow-sm">
              <CardHeader className="border-b">
                 <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <FileText className="text-orange-600" size={18} /> Evaluation Feed
                 </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                 {pendingGradiing.length === 0 ? (
                    <div className="py-12 text-center flex flex-col items-center gap-3 opacity-40">
                       <CheckCircle className="text-green-600" size={32} />
                       <p className="text-xs font-bold uppercase tracking-widest">Queue Synchronized</p>
                    </div>
                 ) : (
                    pendingGradiing.slice(0, 5).map((sub, i) => (
                       <div key={i} className="flex flex-col gap-1 p-3 rounded-xl border hover:bg-slate-50 transition-all cursor-pointer">
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{sub.studentName}</span>
                             <Badge className="bg-orange-600/10 text-orange-600 border-none text-[8px] px-2 py-0.5 uppercase font-bold">New</Badge>
                          </div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">{sub.assignmentTitle || 'Assignment Submission'}</span>
                       </div>
                    ))
                 )}
                 <Button className="w-full mt-2 font-bold" variant="outline">View All Submissions</Button>
              </CardContent>
           </Card>

           <Card className="bg-blue-600 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10">
                 <Settings size={100} />
              </div>
              <CardContent className="p-8 space-y-6 relative z-10">
                 <h3 className="text-xl font-black italic tracking-tighter uppercase leading-none">Institutional <br/>Faculty Support</h3>
                 <p className="text-xs font-bold text-blue-100/70 leading-relaxed uppercase tracking-wide">Access the global registry or orchestrate departmental broadcasts via the Faculty Hub.</p>
                 <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-black italic tracking-widest uppercase text-xs h-12">
                   Orchestrate Hub
                 </Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
