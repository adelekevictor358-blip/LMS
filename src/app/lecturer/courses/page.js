"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, Plus, X, Users, Clock, Send, GraduationCap, Award, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function LecturerCourses() {
  const { user, courses, assignments, submissions, addCourse, addAssignment } = useStore();
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
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Faculty Curriculum Portfolio</h1>
          <p className="text-muted-foreground mt-1 text-lg">Manage your assigned academic modules and monitor student engagement.</p>
        </div>
        <div className="flex items-center gap-3">
          <Dialog open={isAddCourseOpen} onOpenChange={setIsAddCourseOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 font-bold shadow-lg shadow-blue-600/20">
                 <Plus className="mr-2 h-4 w-4" /> New Curriculum Unit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Curriculum Design</DialogTitle>
                <DialogDescription>Define a new academic module for your department.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-6 py-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Module Title</Label>
                  <Input value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})} placeholder="e.g. Quantum Mechanics I" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Module Code</Label>
                    <Input value={newCourse.code} onChange={e => setNewCourse({...newCourse, code: e.target.value})} placeholder="PHY301" />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Credit Units</Label>
                    <Input type="number" value={newCourse.units} onChange={e => setNewCourse({...newCourse, units: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Level Designation</Label>
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
              <Button className="w-full bg-blue-600 font-bold" onClick={() => {
                if (newCourse.title && newCourse.code) {
                  addCourse({ ...newCourse, lecturerId: user.id });
                  setIsAddCourseOpen(false);
                  setNewCourse({ title: '', code: '', units: '3', level: '100L', color: '#0f52ba' });
                }
              }}>Publish Module</Button>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {myCourses.length === 0 ? (
          <div className="md:col-span-3 flex flex-col items-center justify-center p-20 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed">
            <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
            <p className="text-lg font-bold text-slate-500 italic text-center max-w-sm">No academic modules assigned to this faculty identity yet. Contact the Registrar.</p>
          </div>
        ) : (
          myCourses.map(course => {
            const stats = getCourseStats(course.id);
            return (
              <Card key={course.id} className="group hover:border-blue-500/50 hover:shadow-2xl transition-all duration-500 cursor-pointer overflow-hidden border-none shadow-sm bg-card" onClick={() => setSelected(course)}>
                <div className="h-2 w-full" style={{ background: course.color }}></div>
                <CardHeader className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Badge variant="secondary" className="font-bold uppercase tracking-tighter text-[10px]" style={{ color: course.color, backgroundColor: `${course.color}10` }}>
                      {course.code}
                    </Badge>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{course.units} Credit Units</span>
                  </div>
                  <CardTitle className="text-xl font-black leading-tight group-hover:text-blue-600 transition-colors">{course.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                       <Users className="h-4 w-4 text-blue-600" />
                       <div className="flex flex-col">
                          <span className="text-xs font-black">{course.enrolled}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Enrolled</span>
                       </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border">
                       <GraduationCap className="h-4 w-4 text-teal-600" />
                       <div className="flex flex-col">
                          <span className="text-xs font-black">{stats.assignments}</span>
                          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Tasks</span>
                       </div>
                    </div>
                  </div>

                  {stats.pending > 0 && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-orange-50 dark:bg-orange-950/20 text-orange-700 animate-pulse">
                       <Clock className="h-4 w-4" />
                       <span className="text-[10px] font-black uppercase tracking-widest">{stats.pending} Submissions Pending Review</span>
                    </div>
                  )}

                  <div className="space-y-2">
                     <div className="flex justify-between text-xs font-bold tracking-tight">
                        <span className="text-muted-foreground">Semester Uptime</span>
                        <span className="text-blue-600">65%</span>
                     </div>
                     <Progress value={65} className="h-1.5" />
                  </div>
                </CardContent>
                <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 py-3 px-6 flex justify-between items-center group-hover:bg-blue-50/30 transition-colors">
                  <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Faculty Controls</span>
                  <PlayCircle className="h-4 w-4 text-muted-foreground group-hover:text-blue-600 transition-all duration-300 group-hover:scale-110" />
                </CardFooter>
              </Card>
            );
          })
        )}
      </div>

      {/* Course Detail Dialog */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-3xl overflow-hidden p-0 border-none shadow-2xl rounded-2xl">
          {selected && <DialogTitle className="sr-only">{selected.title}</DialogTitle>}
          {selected && (
            <div className="flex flex-col">
              <div className="p-10 text-white relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${selected.color}, ${selected.color}dd)` }}>
                <div className="relative z-10 space-y-4">
                   <Badge className="bg-white/20 text-white border-none font-black tracking-widest px-3 py-1">{selected.code}</Badge>
                   <h2 className="text-4xl font-black tracking-tighter leading-none">{selected.title}</h2>
                   <div className="flex items-center gap-6 text-sm font-bold opacity-90">
                      <span className="flex items-center gap-2"><Users className="h-4 w-4" /> {selected.enrolled} Matched Identities</span>
                      <span className="flex items-center gap-2"><Award className="h-4 w-4" /> {selected.units} Academic Units</span>
                   </div>
                </div>
                {/* Abstract decoration */}
                <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
              </div>

              <div className="p-10 space-y-10 bg-white dark:bg-slate-950">
                 {(() => {
                    const stats = getCourseStats(selected.id);
                    return (
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          {[
                            { label: 'Matriculated', value: selected.enrolled, color: 'blue' },
                            { label: 'Assigned Tasks', value: stats.assignments, color: 'teal' },
                            { label: 'Total Scripts', value: stats.submissions, color: 'purple' },
                            { label: 'Awaiting Review', value: stats.pending, color: 'orange' }
                          ].map((stat, i) => (
                             <div key={i} className="p-4 rounded-2xl border bg-slate-50 dark:bg-slate-900 text-center space-y-1">
                                <span className={`text-2xl font-black text-${stat.color}-600`}>{stat.value}</span>
                                <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block">{stat.label}</span>
                             </div>
                          ))}
                       </div>
                    );
                 })()}

                 <Separator />

                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <Dialog open={isAddAsgnOpen} onOpenChange={setIsAddAsgnOpen}>
                        <DialogTrigger asChild>
                            <Button size="lg" className="h-16 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold shadow-xl shadow-blue-600/20">
                                <Plus className="mr-2 h-5 w-5" /> Dispatch New Assignment
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-black">Academic Task Dispatch</DialogTitle>
                                <DialogDescription>Assign a new assessment for {selected.code}.</DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-6 py-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Task Nomenclature</Label>
                                    <Input value={newAsgn.title} onChange={e => setNewAsgn({...newAsgn, title: e.target.value})} placeholder="e.g. Mid-Semester Research Paper" />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider">Official Instructions</Label>
                                    <Textarea value={newAsgn.description} onChange={e => setNewAsgn({...newAsgn, description: e.target.value})} placeholder="Define task scope and requirements..." />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider">Submission Threshold (Date)</Label>
                                        <Input type="date" value={newAsgn.dueDate} onChange={e => setNewAsgn({...newAsgn, dueDate: e.target.value})} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label className="text-xs font-bold uppercase tracking-wider">Maximum Score</Label>
                                        <Input type="number" value={newAsgn.maxScore} onChange={e => setNewAsgn({...newAsgn, maxScore: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <Button className="w-full bg-blue-600 font-bold" onClick={() => {
                                if (newAsgn.title && newAsgn.dueDate) {
                                    addAssignment({ ...newAsgn, courseId: selected.id, createdBy: user.id });
                                    setIsAddAsgnOpen(false);
                                    setNewAsgn({ title: '', description: '', dueDate: '', maxScore: '100' });
                                }
                            }}>Broadcast Assignment</Button>
                        </DialogContent>
                    </Dialog>
                    <Button size="lg" variant="outline" className="h-16 rounded-2xl border-2 font-bold hvr-bg-slate-50 transition-all" onClick={() => alert("Curriculum enrollment records exported to institutional cloud storage.")}>
                       <Users className="mr-2 h-5 w-5" /> Export Enrollment Records
                    </Button>
                 </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
