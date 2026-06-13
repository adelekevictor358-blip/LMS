"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, Plus, Users, Clock, GraduationCap, Award, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

export default function LecturerCourses() {
  const { user, courses, assignments, submissions, addCourse, addAssignment, getModuleEnrolmentCount } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const [selected, setSelected] = useState(null);

  // New Course States
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: '', code: '', units: '3', level: '100L', color: '#0f52ba' });

  // New Assignment States
  const [isAddAsgnOpen, setIsAddAsgnOpen] = useState(false);
  const [newAsgn, setNewAsgn] = useState({ title: '', description: '', dueDate: '', maxScore: '100' });

  const getCourseStats = (courseId) => {
    const asgns = assignments.filter(a => a.courseId === courseId && a.createdBy === user?.id);
    const subs = submissions.filter(s => asgns.some(a => a.id === s.assignmentId));
    const pending = subs.filter(s => s.score === null);
    return { assignments: asgns.length, submissions: subs.length, pending: pending.length };
  };

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-balance">My courses</h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">Manage your assigned modules and monitor student engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus size={16} className="mr-2" /> New course
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-xl font-semibold tracking-tight">New course</DialogTitle>
                <DialogDescription>Define a new module for your department.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Module title</Label>
                  <Input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="e.g. Quantum Mechanics I" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-medium text-muted-foreground">Module code</Label>
                    <Input value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} placeholder="PHY301" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-medium text-muted-foreground">Credit units</Label>
                    <Input type="number" value={newCourse.units} onChange={e => setNewCourse({...newCourse, units: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-medium text-muted-foreground">Level</Label>
                  <Select value={newCourse.level} onValueChange={v => setNewCourse({...newCourse, level: v})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      {['100L', '200L', '300L', '400L', '500L'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button className="w-full" onClick={() => {
                if (newCourse.title && newCourse.code) {
                  addCourse({ ...newCourse, lecturerId: user.id });
                  setIsAddCourseOpen(false);
                  setNewCourse({ title: '', code: '', units: '3', level: '100L', color: '#0f52ba' });
                }
              }}>Publish module</Button>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Courses grid */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {myCourses.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-16 text-center">
            <BookOpen size={40} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="max-w-sm text-sm leading-relaxed text-muted-foreground text-pretty">No modules are assigned to you yet. Contact the registrar to get started.</p>
          </div>
        ) : (
          myCourses.map(course => {
            const stats = getCourseStats(course.id);
            return (
              <Card
                key={course.id}
                className="group cursor-pointer overflow-hidden border-border transition-colors hover:border-primary/40"
                onClick={() => setSelected(course)}
              >
                <div className="h-1 w-full" style={{ backgroundColor: course.color }} aria-hidden="true"></div>
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="font-medium">{course.code}</Badge>
                    <span className="text-xs font-medium tabular-nums text-muted-foreground">{course.units} units</span>
                  </div>
                  <CardTitle className="text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
                      <Users size={16} className="text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold tabular-nums text-foreground">{getModuleEnrolmentCount(course.id)}</span>
                        <span className="text-xs text-muted-foreground">Enrolled</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
                      <GraduationCap size={16} className="text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold tabular-nums text-foreground">{stats.assignments}</span>
                        <span className="text-xs text-muted-foreground">Tasks</span>
                      </div>
                    </div>
                  </div>

                  {stats.pending > 0 && (
                    <div className="flex items-center gap-2 rounded-md border border-transparent bg-warning/10 p-3 text-warning">
                      <Clock size={16} />
                      <span className="text-xs font-medium">{stats.pending} submissions pending review</span>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Semester progress</span>
                      <span className="tabular-nums text-foreground">65%</span>
                    </div>
                    <Progress value={65} className="h-1.5" />
                  </div>
                </CardContent>
                <CardFooter className="flex items-center justify-between border-t border-border bg-muted/30 px-6 py-3">
                  <span className="text-xs font-medium text-muted-foreground">Course controls</span>
                  <FileText size={16} className="text-muted-foreground transition-colors group-hover:text-primary" />
                </CardFooter>
              </Card>
            );
          })
        )}
      </section>

      {/* Course detail dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0">
          {selected && <DialogTitle className="sr-only">{selected.title}</DialogTitle>}
          {selected && (
            <div className="flex flex-col">
              <div className="space-y-4 border-b border-border bg-card p-8">
                <div className="flex items-center gap-3">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: selected.color }} aria-hidden="true"></span>
                  <Badge variant="secondary" className="font-medium">{selected.code}</Badge>
                </div>
                <h2 className="font-serif text-2xl font-semibold tracking-tight text-foreground text-balance">{selected.title}</h2>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-2"><Users size={16} /> {getModuleEnrolmentCount(selected.id)} students enrolled</span>
                  <span className="flex items-center gap-2"><Award size={16} /> {selected.units} academic units</span>
                </div>
              </div>

              <div className="space-y-8 bg-background p-8">
                {(() => {
                  const stats = getCourseStats(selected.id);
                  return (
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                      {[
                        { label: 'Enrolled', value: getModuleEnrolmentCount(selected.id) },
                        { label: 'Assigned tasks', value: stats.assignments },
                        { label: 'Total submissions', value: stats.submissions },
                        { label: 'Awaiting review', value: stats.pending }
                      ].map((stat, i) => (
                        <div key={i} className="space-y-1 rounded-xl border border-border bg-card p-4 text-center">
                          <span className="block text-2xl font-semibold tabular-nums text-foreground">{stat.value}</span>
                          <span className="block text-xs font-medium text-muted-foreground">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                <Separator />

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Dialog open={isAddAsgnOpen} onOpenChange={setIsAddAsgnOpen}>
                    <DialogTrigger asChild>
                      <Button className="h-12">
                        <Plus size={16} className="mr-2" /> New assignment
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-xl">
                      <DialogHeader>
                        <DialogTitle className="font-serif text-xl font-semibold tracking-tight">New assignment</DialogTitle>
                        <DialogDescription>Assign a new assessment for {selected.code}.</DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-5 py-4">
                        <div className="grid gap-2">
                          <Label className="text-xs font-medium text-muted-foreground">Title</Label>
                          <Input value={newAsgn.title} onChange={e => setNewAsgn({...newAsgn, title: e.target.value})} placeholder="e.g. Mid-semester research paper" />
                        </div>
                        <div className="grid gap-2">
                          <Label className="text-xs font-medium text-muted-foreground">Instructions</Label>
                          <Textarea value={newAsgn.description} onChange={e => setNewAsgn({...newAsgn, description: e.target.value})} placeholder="Define the task scope and requirements" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground">Due date</Label>
                            <Input type="date" value={newAsgn.dueDate} onChange={e => setNewAsgn({...newAsgn, dueDate: e.target.value})} />
                          </div>
                          <div className="grid gap-2">
                            <Label className="text-xs font-medium text-muted-foreground">Maximum score</Label>
                            <Input type="number" value={newAsgn.maxScore} onChange={e => setNewAsgn({...newAsgn, maxScore: e.target.value})} />
                          </div>
                        </div>
                      </div>
                      <Button className="w-full" onClick={() => {
                        if (newAsgn.title && newAsgn.dueDate) {
                          addAssignment({ ...newAsgn, courseId: selected.id, createdBy: user.id });
                          setIsAddAsgnOpen(false);
                          setNewAsgn({ title: '', description: '', dueDate: '', maxScore: '100' });
                        }
                      }}>Publish assignment</Button>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" className="h-12" onClick={() => alert("Curriculum enrollment records exported to institutional cloud storage.")}>
                    <Users size={16} className="mr-2" /> Export enrollment records
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
