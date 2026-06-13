"use client";

import { useStore } from '@/store/useStore';
import {
  Users, BookOpen, FileText, Play,
  TrendingUp, ChevronRight,
  Settings, CheckCircle, Video
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
    { label: 'Total students', value: totalStudents, icon: <Users size={20} className="text-muted-foreground" /> },
    { label: 'Active courses', value: myCourses.length, icon: <BookOpen size={20} className="text-muted-foreground" /> },
    { label: 'Pending grades', value: pendingGradiing.length, icon: <FileText size={20} className="text-muted-foreground" /> },
    { label: 'Scheduled sessions', value: myScheduledSessions, icon: <Video size={20} className="text-muted-foreground" /> },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Faculty portal</p>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-balance">
            Welcome, {user?.name}
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            Manage your courses, sessions and student performance.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => router.push('/lecturer/students')}>Manage students</Button>
          <Button variant="outline" onClick={() => { logout(); router.push('/login'); }}>Sign out</Button>
        </div>
      </header>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className="border-border transition-colors hover:border-primary/40">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-muted">
                {stat.icon}
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-semibold tabular-nums text-foreground">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-3">
        <div className="space-y-8 xl:col-span-2">
          {/* Live class sessions */}
          <Card className="overflow-hidden border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Play size={18} className="text-primary" /> Live class sessions
              </CardTitle>
              <CardDescription>Start a virtual session for your enrolled students.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {myCourses.length === 0 ? (
                <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                  <BookOpen size={32} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="max-w-prose text-sm text-muted-foreground">
                    You don't have any courses assigned yet.
                  </p>
                </div>
              ) : (
                myCourses.map((course, idx) => (
                  <div key={idx} className="flex items-center justify-between border-b border-border p-5 transition-colors last:border-0 hover:bg-accent">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-sm font-semibold text-secondary-foreground">
                        {course.code.slice(0, 3)}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.level} · {course.semester} semester</p>
                      </div>
                    </div>
                    <Button size="sm" onClick={() => {
                      const sessionId = startLiveSession(course.id);
                      router.push(`/dashboard/classroom/${sessionId}`);
                    }}>
                      <Video size={16} /> Start session
                    </Button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Cohort analytics */}
          <section className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <TrendingUp size={18} className="text-primary" /> Cohort analytics
              </h2>
              <Button variant="link" className="text-primary" onClick={() => router.push('/lecturer/students')}>
                Full report <ChevronRight size={16} />
              </Button>
            </div>
            {myCourses.length === 0 ? (
              <Card className="border-border">
                <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
                  <TrendingUp size={32} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="max-w-prose text-sm text-muted-foreground">
                    Analytics will appear here once you have active courses.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                {myCourses.slice(0, 2).map((course, idx) => (
                  <Card key={idx} className="border-border transition-colors hover:border-primary/40">
                    <CardContent className="space-y-5 p-5">
                      <div className="flex items-start justify-between">
                        <Badge variant="outline" className="border-border">{course.code}</Badge>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">Avg yield 76%</span>
                      </div>
                      <h3 className="font-semibold text-foreground">{course.title}</h3>
                      <div className="flex justify-around border-y border-border py-4">
                        <div className="text-center">
                          <p className="text-xs font-medium text-muted-foreground">Participation</p>
                          <p className="text-xl font-semibold tabular-nums text-foreground">92%</p>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div className="text-center">
                          <p className="text-xs font-medium text-muted-foreground">Submissions</p>
                          <p className="text-xl font-semibold tabular-nums text-foreground">84%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-8">
          {/* Recent submissions */}
          <Card className="border-border">
            <CardHeader className="border-b border-border">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <FileText size={18} className="text-muted-foreground" /> Recent submissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4">
              {pendingGradiing.length === 0 ? (
                <div className="flex flex-col items-center gap-3 py-12 text-center">
                  <CheckCircle size={32} strokeWidth={1.5} className="text-success" />
                  <p className="text-sm text-muted-foreground">No submissions waiting to be graded.</p>
                </div>
              ) : (
                <>
                  {pendingGradiing.slice(0, 5).map((sub, i) => (
                    <div key={i} className="flex flex-col gap-1 rounded-md border border-border p-3 transition-colors hover:bg-accent">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-medium text-foreground">{sub.studentName}</span>
                        <Badge className="bg-info/10 text-info border-transparent">New</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{sub.assignmentTitle || 'Assignment submission'}</span>
                    </div>
                  ))}
                  <Button className="mt-1 w-full" variant="outline">View all submissions</Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Faculty support */}
          <Card className="border-border">
            <CardContent className="space-y-4 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                <Settings size={18} className="text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-foreground">Faculty support</h3>
                <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
                  Access the staff registry or send departmental announcements from the faculty hub.
                </p>
              </div>
              <Button className="w-full">Open faculty hub</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
