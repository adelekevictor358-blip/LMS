"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import {
  BookOpen, Clock, CheckCircle2, Calendar, FileText,
  Play, Users, ChevronRight, GraduationCap, Bell, Radio, Sparkles
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useRouter } from 'next/navigation';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, courses, assignments, submissions, liveSessions, getStudentCourses } = useStore();
  const [greeting, setGreeting] = useState('');

  // Dynamic greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  // Single source of truth for the student's courses (shared store selector)
  const enrolledCourses = getStudentCourses(user);

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
    { label: 'Enrolled courses', value: enrolledCourses.length || 0, icon: <BookOpen size={20} className="text-muted-foreground" />, sub: 'This semester' },
    { label: 'Active assignments', value: activeAssignments.length, icon: <FileText size={20} className="text-muted-foreground" />, sub: urgentAssignments.length > 0 ? `${urgentAssignments.length} due soon` : 'On track' },
    { label: 'Completed tasks', value: studentSubmissions.length, icon: <CheckCircle2 size={20} className="text-muted-foreground" />, sub: 'Submissions made' },
    { label: 'Live sessions', value: activeSessions.length, icon: <Radio size={20} className="text-muted-foreground" />, sub: activeSessions.length > 0 ? 'In progress now' : 'None active' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 md:p-8 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            {greeting}, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground mt-1 text-pretty">
            {activeAssignments.length > 0
              ? `You have ${activeAssignments.length} assignment${activeAssignments.length > 1 ? 's' : ''} pending. ${urgentAssignments.length > 0 ? `${urgentAssignments.length} due soon.` : 'Keep it up.'}`
              : 'No pending assignments. You are all caught up.'
            }
          </p>
          {user?.program && (
            <p className="text-xs font-medium text-muted-foreground mt-2">{user.program} · {user?.level || ''}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Button onClick={() => router.push('/dashboard/courses')}>My courses</Button>
          <Button variant="outline" onClick={() => router.push('/dashboard/settings')}>Profile</Button>
        </div>
      </header>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, i) => (
          <Card key={i} className="border border-border shadow-sm">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-3 rounded-md bg-muted">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="xl:col-span-2 space-y-8">
          {/* Active live sessions */}
          {activeSessions.length > 0 && (
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="p-5 border-b border-border">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-success/60 animate-pulse"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                    </span>
                    <CardTitle className="text-lg font-semibold text-foreground">Live sessions</CardTitle>
                  </div>
                  <Badge variant="outline" className="bg-success/10 text-success border-transparent rounded-full">Live</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeSessions.map((session, idx) => {
                  const course = courses.find(c => c.id === session.courseId);
                  return (
                    <div key={idx} className="p-5 flex items-center justify-between gap-4 border-b border-border last:border-0 transition-colors hover:bg-muted">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-semibold">
                          {course?.code?.slice(0, 3)}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{course?.title || session.title}</p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                            <Users size={16} /> {session.participants?.length || 0} students · {session.lecturerName}
                          </p>
                        </div>
                      </div>
                      <Button onClick={() => router.push(`/dashboard/classroom/${session.id}`)} className="active:translate-y-px">
                        <Play size={16} className="fill-current" /> Join class
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {/* Current courses progress */}
          <section>
            <SectionHeader title="My courses" icon={<GraduationCap size={18} />} onViewAll={() => router.push('/dashboard/courses')} />
            {enrolledCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {enrolledCourses.slice(0, 4).map((course, idx) => {
                  const courseAssignments = assignments.filter(a => a.courseId === course.id && a.status === 'active');
                  const done = studentSubmissions.filter(s => courseAssignments.some(a => a.id === s.assignmentId)).length;
                  const progress = courseAssignments.length > 0 ? Math.round((done / courseAssignments.length) * 100) : 0;
                  return (
                    <Card key={idx} className="group border border-border shadow-sm transition-colors hover:border-primary/40 cursor-pointer" onClick={() => router.push('/dashboard/courses')}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start mb-4 gap-3">
                          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: course.color }} aria-hidden="true" />
                            {course.code}
                          </span>
                          <span className="text-xs font-medium text-muted-foreground">{course.level}</span>
                        </div>
                        <h4 className="font-semibold text-foreground transition-colors group-hover:text-primary mb-4 text-pretty">{course.title}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-muted-foreground">Tasks done</span>
                            <span className="text-foreground tabular-nums">{done}/{courseAssignments.length}</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="border border-border shadow-sm">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center gap-4">
                  <BookOpen size={40} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">You are not enrolled in any courses yet.</p>
                  <Button onClick={() => router.push('/dashboard/courses')}>Explore courses</Button>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Pending assignments */}
          {activeAssignments.length > 0 && (
            <section>
              <SectionHeader title="Pending assignments" icon={<FileText size={18} />} onViewAll={() => router.push('/dashboard/assignments')} />
              <div className="space-y-3">
                {activeAssignments.slice(0, 3).map((assignment, idx) => {
                  const course = courses.find(c => c.id === assignment.courseId);
                  const daysLeft = Math.ceil((new Date(assignment.dueDate) - Date.now()) / 86400000);
                  const isUrgent = daysLeft <= 2;
                  return (
                    <Card key={idx} className={`border shadow-sm ${isUrgent ? 'border-warning/40' : 'border-border'}`}>
                      <CardContent className="p-5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-md ${isUrgent ? 'bg-warning/10' : 'bg-muted'}`}>
                            <FileText size={18} className={isUrgent ? 'text-warning' : 'text-muted-foreground'} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground text-sm text-pretty">{assignment.title}</p>
                            <p className="text-xs text-muted-foreground">{course?.code} · Due in {daysLeft} day{daysLeft !== 1 ? 's' : ''}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className={isUrgent ? 'bg-warning/10 text-warning border-transparent' : 'bg-muted text-muted-foreground border-transparent'}>
                          {isUrgent ? 'Urgent' : 'Active'}
                        </Badge>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Quick access */}
          <Card className="border border-border shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2 text-foreground">
                <Clock size={18} className="text-muted-foreground" /> Quick access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              {[
                { label: 'My assignments', path: '/dashboard/assignments', icon: <FileText size={16} /> },
                { label: 'Take a quiz', path: '/dashboard/quizzes', icon: <CheckCircle2 size={16} /> },
                { label: 'Course library', path: '/dashboard/library', icon: <BookOpen size={16} /> },
                { label: 'Past questions', path: '/dashboard/past-questions', icon: <Calendar size={16} /> },
                { label: 'Inbox', path: '/dashboard/inbox', icon: <Bell size={16} /> },
              ].map((item, i) => (
                <button
                  key={i}
                  onClick={() => router.push(item.path)}
                  className="w-full flex items-center justify-between p-3 rounded-md transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring group"
                >
                  <div className="flex items-center gap-3">
                    <span className="p-2 rounded-md bg-muted text-muted-foreground transition-colors group-hover:text-primary">
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-foreground">{item.label}</span>
                  </div>
                  <ChevronRight size={16} className="text-muted-foreground transition-colors group-hover:text-primary" />
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Academic AI assistant */}
          <Card className="bg-primary text-primary-foreground border border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-primary-foreground/15">
                <Sparkles size={20} />
              </span>
              <div className="space-y-1.5">
                <h3 className="text-lg font-semibold leading-tight">Academic AI assistant</h3>
                <p className="text-sm leading-relaxed text-primary-foreground/80 text-pretty">
                  Get help with your studies, assignments, and academic questions.
                </p>
              </div>
              <Button
                variant="secondary"
                className="w-full active:translate-y-px"
                onClick={() => router.push('/dashboard/ai')}
              >
                Open assistant
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function SectionHeader({ title, icon, onViewAll }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h3 className="text-lg font-semibold flex items-center gap-2 text-foreground">
        {icon} {title}
      </h3>
      <Button variant="ghost" size="sm" onClick={onViewAll}>View all <ChevronRight size={16} /></Button>
    </div>
  );
}
