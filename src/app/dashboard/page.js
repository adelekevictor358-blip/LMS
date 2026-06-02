"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Clock, AlertCircle, 
  CheckCircle2, Calendar, FileText, Play, Users, 
  ChevronRight, GraduationCap, Bell, Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, courses, assignments, submissions, liveSessions } = useStore();
  const [waveFrame, setWaveFrame] = useState(0);
  const [greeting, setGreeting] = useState('');

  // Animated hand wave frames
  const waveEmojis = ['👋', '🤚', '👋', '🤚', '👋'];
  useEffect(() => {
    const interval = setInterval(() => {
      setWaveFrame(f => (f + 1) % waveEmojis.length);
    }, 350);
    return () => clearInterval(interval);
  }, []);

  // Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // For enrolled courses: match by program if no explicit enrolledCourseIds
  const enrolledCourses = user?.enrolledCourseIds?.length
    ? courses.filter(c => user.enrolledCourseIds.includes(c.id))
    : courses.filter(c => c.program === user?.program && c.level === user?.level);

  const enrolledCourseIds = enrolledCourses.map(c => c.id);
  const activeAssignments = assignments.filter(a => 
    (enrolledCourseIds.includes(a.courseId) || enrolledCourseIds.length === 0) && a.status === 'active'
  );
  const studentSubmissions = submissions.filter(s => s.studentId === user?.id);
  // Show all live sessions — students can see and join any active class
  const activeSessions = liveSessions;

  // Dynamic assignment urgency
  const urgentAssignments = activeAssignments.filter(a => {
    const daysLeft = (new Date(a.dueDate) - Date.now()) / 86400000;
    return daysLeft <= 2 && daysLeft >= 0;
  });

  const stats = [
    { label: 'Enrolled Courses', value: enrolledCourses.length || 0, icon: <BookOpen className="text-blue-600" />, color: 'blue', sub: 'This semester' },
    { label: 'Active Assignments', value: activeAssignments.length, icon: <FileText className="text-orange-600" />, color: 'orange', sub: urgentAssignments.length > 0 ? `${urgentAssignments.length} urgent!` : 'On track' },
    { label: 'Completed Tasks', value: studentSubmissions.length, icon: <CheckCircle2 className="text-green-600" />, color: 'green', sub: 'Submissions made' },
    { label: 'Live Sessions', value: activeSessions.length, icon: <Zap className="text-purple-600" />, color: 'purple', sub: activeSessions.length > 0 ? 'In progress now' : 'None active' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Section with animated hand wave */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-full bg-gradient-to-l from-blue-50 dark:from-blue-900/10 to-transparent pointer-events-none" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            {greeting}, {user?.name?.split(' ')[0]}!
            <span
              className="inline-block"
              style={{
                display: 'inline-block',
                transformOrigin: '70% 70%',
                animation: 'wave-hand 2.5s ease-in-out infinite',
                fontSize: '2rem'
              }}
            >
              👋
            </span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {activeAssignments.length > 0
              ? `You have ${activeAssignments.length} assignment${activeAssignments.length > 1 ? 's' : ''} pending. ${urgentAssignments.length > 0 ? `⚠️ ${urgentAssignments.length} due soon!` : 'Keep it up!'}`
              : 'No pending assignments. Great job staying on top of things!'
            }
          </p>
          {user?.program && (
            <p className="text-xs font-semibold text-blue-600 mt-1 uppercase tracking-wide">{user.program} · {user?.level || ''}</p>
          )}
        </div>
        <div className="flex gap-3 relative z-10">
          <Button onClick={() => router.push('/dashboard/courses')} className="bg-blue-600 hover:bg-blue-700">My Courses</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>Profile</Button>
        </div>
      </div>

      {/* Stats Grid — no CGPA */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <Card key={i} className="border-none shadow-sm overflow-hidden hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-5">
              <div className={`p-4 rounded-xl bg-${stat.color}-50 dark:bg-${stat.color}-900/20`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500 uppercase tracking-tight">{stat.label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-400 font-medium mt-0.5">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active Live Sessions */}
          {activeSessions.length > 0 && (
            <Card className="border-2 border-blue-100 dark:border-blue-900/30 overflow-hidden">
              <CardHeader className="bg-blue-50 dark:bg-blue-900/20 p-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                    <CardTitle className="text-lg font-bold text-blue-900 dark:text-blue-100 uppercase">Live Academic Sessions</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-white dark:bg-slate-800 text-blue-600 border-blue-200">Session Active</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeSessions.map((session, idx) => {
                  const course = courses.find(c => c.id === session.courseId);
                  return (
                    <div key={idx} className="p-6 flex items-center justify-between border-b last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                          {course?.code?.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{course?.title || session.title}</p>
                          <p className="text-sm text-slate-500 flex items-center gap-1">
                            <Users size={14} /> {session.participants?.length || 0} Students · {session.lecturerName}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => router.push(`/dashboard/classroom/${session.id}`)} className="bg-blue-600 hover:bg-blue-700 h-10 px-6 rounded-full font-bold">
                        <Play size={16} className="mr-2 fill-current" /> Join Class
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Current Courses Progress */}
          <SectionHeader title="My Courses" icon={<GraduationCap size={20} />} onViewAll={() => router.push('/dashboard/courses')} />
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.slice(0, 4).map((course, idx) => {
                const courseAssignments = assignments.filter(a => a.courseId === course.id && a.status === 'active');
                const done = studentSubmissions.filter(s => courseAssignments.some(a => a.id === s.assignmentId)).length;
                const progress = courseAssignments.length > 0 ? Math.round((done / courseAssignments.length) * 100) : 0;
                return (
                  <Card key={idx} className="group hover:border-blue-200 dark:hover:border-blue-800 transition-all cursor-pointer" onClick={() => router.push('/dashboard/courses')}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" style={{ color: course.color, borderColor: `${course.color}40` }}>{course.code}</Badge>
                        <span className="text-xs font-bold text-slate-400">{course.level}</span>
                      </div>
                      <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors mb-4">{course.title}</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold mb-1">
                          <span className="text-slate-500 uppercase">Tasks Done</span>
                          <span className="text-blue-600">{done}/{courseAssignments.length}</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-4">
                <BookOpen size={48} className="text-slate-300" />
                <p className="font-bold text-slate-500">No courses enrolled yet.</p>
                <Button onClick={() => router.push('/dashboard/courses')} className="bg-blue-600 hover:bg-blue-700">Explore Courses</Button>
              </CardContent>
            </Card>
          )}

          {/* Pending Assignments */}
          {activeAssignments.length > 0 && (
            <>
              <SectionHeader title="Pending Assignments" icon={<FileText size={20} />} onViewAll={() => router.push('/dashboard/assignments')} />
              <div className="space-y-3">
                {activeAssignments.slice(0, 3).map((assignment, idx) => {
                  const course = courses.find(c => c.id === assignment.courseId);
                  const daysLeft = Math.ceil((new Date(assignment.dueDate) - Date.now()) / 86400000);
                  const isUrgent = daysLeft <= 2;
                  return (
                    <Card key={idx} className={`${isUrgent ? 'border-orange-200 dark:border-orange-900/40' : ''}`}>
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${isUrgent ? 'bg-orange-50 dark:bg-orange-900/20' : 'bg-blue-50 dark:bg-blue-900/20'}`}>
                            <FileText size={18} className={isUrgent ? 'text-orange-600' : 'text-blue-600'} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm">{assignment.title}</p>
                            <p className="text-xs text-slate-500">{course?.code} · Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Badge className={isUrgent ? 'bg-orange-100 text-orange-700 border-none' : 'bg-blue-100 text-blue-700 border-none'}>
                          {isUrgent ? 'Urgent' : 'Active'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Quick Actions */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Clock size={18} className="text-blue-600" /> Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { label: 'My Assignments', path: '/dashboard/assignments', icon: <FileText size={16} />, color: 'orange' },
                { label: 'Take a Quiz', path: '/dashboard/quizzes', icon: <CheckCircle2 size={16} />, color: 'green' },
                { label: 'Course Library', path: '/dashboard/library', icon: <BookOpen size={16} />, color: 'blue' },
                { label: 'Past Questions', path: '/dashboard/past-questions', icon: <Calendar size={16} />, color: 'purple' },
                { label: 'Inbox', path: '/dashboard/inbox', icon: <Bell size={16} />, color: 'red' },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900/20 text-${item.color}-600`}>
                      {item.icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 group-hover:text-blue-600 transition-colors">{item.label}</span>
                  </div>
                  <ChevronRight size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* AI Support Card */}
          <Card className="bg-slate-900 dark:bg-blue-950 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <LayoutDashboard size={120} />
            </div>
            <CardContent className="p-8 space-y-6 relative z-10">
              <h3 className="text-xl font-bold leading-tight">Academic AI Assistant</h3>
              <p className="text-slate-400 text-sm leading-relaxed">Get instant help with your studies, assignments, and academic questions powered by AI.</p>
              <Button className="w-full bg-white text-slate-950 hover:bg-slate-200 font-bold h-12" onClick={() => router.push('/dashboard/ai')}>
                Launch AI Assistant
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <style jsx global>{`
        @keyframes wave-hand {
          0% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
}

function SectionHeader({ title, icon, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
        {icon} {title}
      </h3>
      <Button variant="ghost" className="text-blue-600 font-bold" onClick={onViewAll}>View All <ChevronRight size={16} /></Button>
    </div>
  );
}
