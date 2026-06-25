"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import {
  Play, Calendar, Users, Search,
  Download, Share2, Film,
  ShieldCheck, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ClassArchivalSystem() {
  const router = useRouter();
  const { user, classArchivesActive } = useStore();

  // ── Dormant gate ────────────────────────────────────────────────────────────
  if (!classArchivesActive) {
    return (
      <main className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center px-6 animate-fade-in">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-border bg-muted text-muted-foreground">
          <Lock size={28} strokeWidth={1.5} />
        </div>
        <div className="space-y-2 max-w-sm">
          <h1 className="font-serif text-2xl font-semibold text-foreground">Class Archives coming soon</h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            This feature is not yet available. The administration will announce when recorded lecture archives go live.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Return to dashboard
        </Button>
      </main>
    );
  }

  // ── Active archives view ─────────────────────────────────────────────────────
  // Only show recordings that match the student's own level
  const studentLevel = user?.level;

  const mockRecordings = [
    {
      id: "REC-001",
      title: "Advanced Quantum Mechanics - Week 4",
      courseCode: "PHY401",
      level: "400L",
      lecturer: "Prof. James Anderson",
      date: "2024-04-15",
      duration: "1h 45m",
      size: "1.2 GB",
      thumbnail: "QA",
      views: 124
    },
    {
      id: "REC-002",
      title: "Introduction to Neural Networks",
      courseCode: "CSC302",
      level: "300L",
      lecturer: "Dr. Sarah Omotayo",
      date: "2024-04-12",
      duration: "52m",
      size: "640 MB",
      thumbnail: "NN",
      views: 89
    },
    {
      id: "REC-003",
      title: "Fullstack Engineering: State Management",
      courseCode: "ICT204",
      level: "200L",
      lecturer: "Engr. Victor Adeleke",
      date: "2024-04-10",
      duration: "2h 10m",
      size: "2.1 GB",
      thumbnail: "SE",
      views: 256
    }
  ];

  // Restrict to student's current level
  const visibleRecordings = user?.role === 'student'
    ? mockRecordings.filter(r => r.level === studentLevel)
    : mockRecordings;

  return (
    <main className="space-y-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-secondary text-foreground">
              <Film size={20} strokeWidth={1.5} />
            </div>
            <h1 className="font-serif text-2xl font-semibold tracking-tight text-balance text-foreground md:text-3xl">
              Class archives
            </h1>
          </div>
          <p className="max-w-prose text-sm leading-relaxed text-pretty text-muted-foreground">
            Watch back recorded lectures and virtual classroom sessions
            {studentLevel ? ` for ${studentLevel} courses` : ''}.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input className="h-11 pl-9" placeholder="Search recordings" aria-label="Search recordings" />
        </div>
      </header>

      <section aria-label="Recorded sessions">
        {visibleRecordings.length === 0 ? (
          <EmptyState onBrowse={() => router.push('/dashboard/courses')} studentLevel={studentLevel} />
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {visibleRecordings.map((rec) => (
              <Card
                key={rec.id}
                className="group overflow-hidden border-border transition-colors hover:border-primary/40"
              >
                <button
                  type="button"
                  className="relative block aspect-video w-full overflow-hidden bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                  aria-label={`Play ${rec.title}`}
                >
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
                      <Play size={18} className="fill-current" />
                    </span>
                  </span>
                  <Badge variant="secondary" className="absolute left-3 top-3 tabular-nums">
                    {rec.courseCode}
                  </Badge>
                  <span className="absolute bottom-3 right-3 rounded-md bg-foreground/80 px-2 py-0.5 text-xs font-medium tabular-nums text-background">
                    {rec.duration}
                  </span>
                </button>

                <CardHeader className="p-5">
                  <CardTitle className="text-base font-semibold leading-snug text-foreground">
                    {rec.title}
                  </CardTitle>
                  <CardDescription className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <Avatar className="h-5 w-5">
                      <AvatarFallback className="bg-secondary text-[10px] font-medium text-secondary-foreground">
                        {rec.lecturer[0]}
                      </AvatarFallback>
                    </Avatar>
                    {rec.lecturer}
                  </CardDescription>
                </CardHeader>

                <CardContent className="flex items-center justify-between border-t border-border p-5 pt-4">
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <Calendar size={14} strokeWidth={1.5} />
                      <span className="tabular-nums">{new Date(rec.date).toLocaleDateString()}</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Users size={14} strokeWidth={1.5} />
                      <span className="tabular-nums">{rec.views} views</span>
                    </span>
                  </div>
                  <RecordingActions recording={rec} />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <aside className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-green-soft text-brand-green">
            <ShieldCheck size={24} strokeWidth={1.5} />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-foreground">Academic integrity policy</h2>
            <p className="max-w-prose text-sm leading-relaxed text-pretty text-muted-foreground">
              Recordings are for personal academic review only. Downloading or sharing university
              content without permission breaches university policy.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="shrink-0"
          onClick={() => router.push('/dashboard/settings')}
        >
          View policy
        </Button>
      </aside>
    </main>
  );
}

function RecordingActions({ recording }) {
  return (
    <div className="flex gap-1">
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Download recording">
        <Download size={16} />
      </Button>
      <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Share recording">
        <Share2 size={16} />
      </Button>
    </div>
  );
}

function EmptyState({ onBrowse, studentLevel }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-16 text-center">
      <Film size={32} strokeWidth={1.5} className="text-muted-foreground" />
      <p className="mt-4 max-w-prose text-sm text-pretty text-muted-foreground">
        {studentLevel
          ? `No recordings are available for ${studentLevel} yet. They appear here after your live classes end.`
          : 'No recordings are available yet. They appear here after your live classes end.'}
      </p>
      <Button className="mt-6" onClick={onBrowse}>
        Browse courses
      </Button>
    </div>
  );
}
