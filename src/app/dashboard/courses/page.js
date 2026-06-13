"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, X, Plus, Info, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { semesterFromCode } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function StudentCourses() {
  const { user, courses, getAllUsers, lecturerRatings, enrollInCourse, unenrollFromCourse, getStudentCourses, getStudentCourseIds, registrationEligibility, currentSession, currentSemester, semesterOpen } = useStore();
  const [view, setView] = useState('portfolio');
  const [semesterFilter, setSemesterFilter] = useState(currentSemester || '1st');
  const [levelFilter, setLevelFilter] = useState(user?.level || '100L');
  const allUsers = getAllUsers();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const levels = ['100L', '200L', '300L', '400L'];

  const levelCourses = courses.filter(c => {
    const matchesLevel = c.level === levelFilter;
    const matchesSemester = (c.semester || semesterFromCode(c.code)) === semesterFilter;

    // Normalizing strings for matching (removing dots and spaces, lowercase)
    const normalize = (str) => str?.toLowerCase().replace(/[\s.]/g, '') || '';
    const courseProgram = normalize(c.program);
    const userProgram = normalize(user?.program);

    const isGeneral = courseProgram === 'general' || c.code.startsWith('GST') || c.code.startsWith('MTU') || c.code.startsWith('ENT');
    const matchesProgram = courseProgram === userProgram || courseProgram === '';

    return matchesLevel && matchesSemester && (isGeneral || matchesProgram);
  });

  const myCourses = getStudentCourses(user);
  const enrolledIds = getStudentCourseIds(user);
  const availableCourses = levelCourses.filter(c => !enrolledIds.includes(c.id));

  const getLecturer = (lecturerId) => allUsers.find(u => u.id === lecturerId && u.role === 'lecturer');
  const getLecturerStats = (lecturerId) => {
    const ratings = lecturerRatings.filter(r => r.lecturerId === lecturerId);
    return ratings.length === 0 ? { avg: "0.0", count: 0 } : { avg: (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1), count: ratings.length };
  };

  const visibleCourses = view === 'portfolio' ? myCourses : availableCourses;

  return (
    <main className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Course registration
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
            Register and manage your academic modules for the {currentSession} session ({currentSemester} semester).
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1 bg-muted p-1 rounded-md">
             {levels.map(lvl => (
                <button
                  key={lvl}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${levelFilter === lvl ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setLevelFilter(lvl)}
                >
                  {lvl}
                </button>
             ))}
          </div>
          <div className="flex gap-1 bg-muted p-1 rounded-md">
             {['1st', '2nd'].map(sem => (
                <button
                  key={sem}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${semesterFilter === sem ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  onClick={() => setSemesterFilter(sem)}
                >
                  {sem} sem
                </button>
             ))}
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex border-b border-border gap-8 px-2">
        <button
          className={`pb-3 -mb-px text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm ${view === 'portfolio' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setView('portfolio')}
        >
          My courses ({myCourses.length})
          {view === 'portfolio' && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
        <button
          className={`pb-3 -mb-px text-sm font-medium transition-colors relative focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm ${view === 'catalog' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
          onClick={() => setView('catalog')}
        >
          Course catalog ({availableCourses.length})
          {view === 'catalog' && <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-primary rounded-full" />}
        </button>
      </nav>

      {/* Registration is locked by the registrar */}
      {view === 'catalog' && !semesterOpen && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/10 p-4">
          <Lock size={18} className="text-warning shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-foreground text-pretty">
            Course registration is currently <span className="font-medium">closed</span> for {currentSession}. You can browse the catalog, but registration reopens once the registrar opens a semester.
          </p>
        </div>
      )}
      {/* Read-only notice when a semester is open but you're browsing another level/semester */}
      {view === 'catalog' && semesterOpen && (levelFilter !== user?.level || semesterFilter !== currentSemester) && (
        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted p-4">
          <Info size={18} className="text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            You&apos;re browsing in read-only mode. Registration is open for your level (<span className="font-medium text-foreground">{user?.level}</span>) and the <span className="font-medium text-foreground">{currentSemester}</span> semester only.
          </p>
        </div>
      )}

      {/* Grid */}
      {visibleCourses.length === 0 ? (
        <section className="flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-border bg-card py-16 px-6">
          <BookOpen size={28} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
            {view === 'portfolio'
              ? "You haven't registered any courses for this level and semester yet."
              : "No further courses are available for this level and semester."}
          </p>
          {view === 'portfolio' && (
            <Button variant="outline" onClick={() => setView('catalog')}>
              Browse the catalog
            </Button>
          )}
        </section>
      ) : (
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {visibleCourses.map(course => {
          const lecturer = getLecturer(course.lecturerId);
          const isRegistered = enrolledIds.includes(course.id);
          const elig = registrationEligibility(course, user);
          const registrable = elig.ok;

          return (
            <Card key={course.id} className="group flex flex-col border border-border rounded-xl transition-colors hover:border-primary/40">
               <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: course.color }} aria-hidden="true" />
                      <Badge variant="secondary" className="font-medium tracking-wide">{course.code}</Badge>
                    </div>
                    <span className="text-xs font-medium text-muted-foreground tabular-nums">{course.units} units</span>
                  </div>
                  <CardTitle className="text-base font-semibold leading-tight text-foreground">
                    {course.title}
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-5 flex-1">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                        {lecturer?.name ? lecturer.name.split(' ').map(n=>n[0]).join('') : 'MT'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                       <span className="text-sm font-medium text-foreground truncate">{lecturer?.title || 'Dr.'} {lecturer?.name || 'Assigned Staff'}</span>
                       <span className="text-xs text-muted-foreground">Lead instructor</span>
                    </div>
                  </div>
                  {isRegistered && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-xs font-medium">
                          <span className="text-muted-foreground">Learning progress</span>
                          <span className="text-foreground tabular-nums">45%</span>
                       </div>
                       <Progress value={45} className="h-1.5" />
                    </div>
                  )}
               </CardContent>
               <CardFooter className="pt-0 flex gap-2">
                  {isRegistered ? (
                    <>
                      <Button className="flex-1" onClick={() => setSelectedCourse(course)}>
                         Open details
                      </Button>
                      <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive" aria-label={`Unenroll from ${course.code}`} onClick={() => {
                         if(confirm(`Unenroll from ${course.code}?`)) unenrollFromCourse(course.id);
                      }}>
                         <X size={18} />
                      </Button>
                    </>
                  ) : registrable ? (
                    <Button variant="outline" className="w-full" onClick={() => enrollInCourse(course.id)}>
                       <Plus size={16} /> Register course
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full text-muted-foreground" disabled aria-label={`${course.code} is not open for registration`}>
                       <Lock size={16} /> {elig.reason === 'closed' ? 'Registration closed' : elig.reason === 'level' ? `View only · ${elig.detail}` : elig.reason === 'semester' ? `View only · ${elig.detail} sem` : 'View only'}
                    </Button>
                  )}
               </CardFooter>
            </Card>
          );
        })}
      </section>
      )}

      {/* Course details dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-xl border border-border">
          {selectedCourse && (
            <div className="flex flex-col gap-6">
              <DialogHeader className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: selectedCourse.color }} aria-hidden="true" />
                  <Badge variant="secondary" className="font-medium tracking-wide">{selectedCourse.code}</Badge>
                  <Badge variant="secondary" className="font-medium tabular-nums">{selectedCourse.units} units</Badge>
                </div>
                <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">
                  {selectedCourse.title}
                </DialogTitle>
                <DialogDescription className="text-sm leading-relaxed text-muted-foreground">
                  {selectedCourse.semester} semester · {selectedCourse.level}
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button variant="outline" className="h-14 rounded-md justify-start" onClick={() => router.push('/dashboard/library')}>Library resources</Button>
                <Button variant="outline" className="h-14 rounded-md justify-start" onClick={() => router.push('/dashboard/assignments')}>Assignments</Button>
              </div>
              <div className="p-5 rounded-xl bg-muted border border-border flex gap-3 items-start">
                 <Info size={18} className="text-muted-foreground shrink-0 mt-0.5" />
                 <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                   This module is currently active for the {selectedCourse.semester} semester {selectedCourse.level} cycle.
                 </p>
              </div>
           </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
