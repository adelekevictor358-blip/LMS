"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Video, Users, Clock, ArrowRight, ShieldAlert, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentClassroomHub() {
  const router = useRouter();
  const { user, liveSessions, courses, getStudentCourseIds } = useStore();

  const mySessions = liveSessions.filter(session =>
    getStudentCourseIds(user).includes(session.courseId)
  );

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-green-soft text-brand-green">
            <Video size={18} />
          </div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
            Live classes
          </h1>
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Online sessions for the courses you are enrolled in.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <main className="space-y-6 lg:col-span-8">
          {mySessions.length > 0 ? (
            mySessions.map((session) => (
              <Card
                key={session.id}
                className="border-border transition-colors hover:border-primary/40"
              >
                <CardHeader>
                  <div className="flex items-center gap-2.5">
                    <Badge variant="outline" className="font-medium">
                      {courses.find(c => c.id === session.courseId)?.code || 'MTU-SESSION'}
                    </Badge>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Live
                    </span>
                  </div>
                  <CardTitle className="text-xl font-semibold text-foreground">
                    {session.title}
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-muted-foreground">
                    <Users size={16} /> {session.lecturerName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Started</span>
                        <span className="text-sm font-medium tabular-nums text-foreground">
                          {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div className="flex flex-col gap-1">
                        <span className="text-xs font-medium text-muted-foreground">Attending</span>
                        <span className="text-sm font-medium tabular-nums text-foreground">12+ joined</span>
                      </div>
                    </div>
                    <Button
                      onClick={() => router.push(`/dashboard/classroom/${session.id}`)}
                    >
                      Join class <ArrowRight size={16} className="ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border">
              <CardContent className="flex flex-col items-center justify-center gap-4 py-16 text-center">
                <Clock size={32} strokeWidth={1.5} className="text-muted-foreground" />
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-foreground">No live classes right now</h3>
                  <p className="mx-auto max-w-xs text-sm leading-relaxed text-muted-foreground">
                    There are no live sessions for your enrolled courses at the moment.
                  </p>
                </div>
                <Button variant="outline">Refresh</Button>
              </CardContent>
            </Card>
          )}

          <Card className="border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold">Session guidelines</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-info/10 text-info">
                  <ShieldAlert size={16} />
                </div>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Live sessions are recorded for academic integrity. Do not share session links outside the university.
                </p>
              </div>
            </CardContent>
          </Card>
        </main>

        <aside className="space-y-6 lg:col-span-4">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                <Activity size={18} className="text-muted-foreground" /> Connection
              </CardTitle>
              <CardDescription>Class link diagnostics.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Signal strength</span>
                <span className="font-medium text-success">Optimal</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className="h-full rounded-full bg-success" style={{ width: '94%' }} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Latency</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">14ms</p>
                </div>
                <div className="rounded-md border border-border p-3">
                  <p className="text-xs font-medium text-muted-foreground">Sync</p>
                  <p className="text-lg font-semibold tabular-nums text-foreground">100%</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">Recalibrate</Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
