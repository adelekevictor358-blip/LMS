"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2, Clock, Eye, Star, MessageSquare, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export default function LecturerAssignments() {
  const { user, courses, assignments, submissions, addAssignment, gradeSubmission, getLecturerRegisteredCourses } = useStore();
  const myCourses = getLecturerRegisteredCourses(user?.id);
  const myAssignments = assignments.filter(a => a.createdBy === user?.id);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100, attachment: null });

  const handleCreate = (e) => {
    e.preventDefault();
    addAssignment({ ...form, courseId: parseInt(form.courseId), maxScore: parseInt(form.maxScore), createdBy: user.id });
    setForm({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100, attachment: null });
    setShowForm(false);
  };

  const handleGrade = (e) => {
    e.preventDefault();
    gradeSubmission(gradingSubmission.id, parseInt(gradeForm.score), gradeForm.feedback);
    setGradingSubmission(null);
    setGradeForm({ score: '', feedback: '' });
  };

  const getAssignmentSubmissions = (assignmentId) => submissions.filter(s => s.assignmentId === assignmentId);

  const allSubmissions = submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId));

  const pendingCount = allSubmissions.filter(s => s.score === null).length;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Assignments
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Create assignments, review submissions, and grade your students.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="active:translate-y-px">
          <Plus size={16} /> New assignment
        </Button>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-2 rounded-xl border border-border bg-card p-1.5">
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            activeTab === 'assignments'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setActiveTab('assignments')}
        >
          <ClipboardList size={16} /> My assignments
          <span className="tabular-nums opacity-80">({myAssignments.length})</span>
        </button>
        <button
          type="button"
          className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
            activeTab === 'submissions'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
          }`}
          onClick={() => setActiveTab('submissions')}
        >
          <Eye size={16} /> All submissions
          <span className="tabular-nums opacity-80">({allSubmissions.length})</span>
          {pendingCount > 0 && (
            <Badge variant="outline" className="border-transparent bg-warning/10 text-warning tabular-nums">
              {pendingCount} pending
            </Badge>
          )}
        </button>
      </nav>

      {/* Create assignment */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:rounded-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList size={18} className="text-muted-foreground" strokeWidth={1.5} />
              Create assignment
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="courseId">Course</Label>
                <select
                  id="courseId"
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  value={form.courseId}
                  onChange={e => setForm({ ...form, courseId: e.target.value })}
                  required
                >
                  <option value="">Select course…</option>
                  {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="maxScore">Max score</Label>
                <Input
                  id="maxScore"
                  type="number"
                  min={1}
                  max={200}
                  className="h-10 tabular-nums"
                  value={form.maxScore}
                  onChange={e => setForm({ ...form, maxScore: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Assignment title</Label>
              <Input
                id="title"
                type="text"
                className="h-10"
                placeholder="e.g. Mid-semester project"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Instructions</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Detailed instructions for students…"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="dueDate">Due date and time</Label>
              <Input
                id="dueDate"
                type="datetime-local"
                className="h-10"
                value={form.dueDate}
                onChange={e => setForm({ ...form, dueDate: e.target.value })}
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="attachment">Resource attachment (optional)</Label>
              <Input
                id="attachment"
                type="file"
                className="cursor-pointer file:text-foreground file:font-medium"
                onChange={e => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setForm({ ...form, attachment: { name: file.name, type: file.type, data: reader.result } });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2 mt-2">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="active:translate-y-px">Create assignment</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Grade submission */}
      <Dialog open={!!gradingSubmission} onOpenChange={(open) => { if (!open) setGradingSubmission(null); }}>
        <DialogContent className="sm:rounded-xl">
          {gradingSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star size={18} className="text-gold" strokeWidth={1.5} />
                  Grade submission — {gradingSubmission.studentName}
                </DialogTitle>
              </DialogHeader>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Student&apos;s answer
                </p>
                {gradingSubmission.content ? (
                  <p className="text-sm leading-relaxed text-foreground text-pretty mb-3">{gradingSubmission.content}</p>
                ) : (
                  <p className="text-sm italic text-muted-foreground mb-3">No text provided.</p>
                )}
                {gradingSubmission.attachment && (
                  <Button variant="secondary" size="sm" asChild>
                    <a href={gradingSubmission.attachment.data} download={gradingSubmission.attachment.name} className="flex items-center">
                      <Download size={14} className="mr-1.5" />
                      Download attachment: {gradingSubmission.attachment.name}
                    </a>
                  </Button>
                )}
              </div>
              <form onSubmit={handleGrade} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="score">
                    Score
                    <span className="ml-1 font-normal text-muted-foreground">
                      (max: {myAssignments.find(a => a.id === gradingSubmission.assignmentId)?.maxScore})
                    </span>
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    max={myAssignments.find(a => a.id === gradingSubmission.assignmentId)?.maxScore}
                    className="h-10 tabular-nums"
                    value={gradeForm.score}
                    onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback">Feedback and comments</Label>
                  <Textarea
                    id="feedback"
                    rows={3}
                    placeholder="Provide comments to help the student improve…"
                    value={gradeForm.feedback}
                    onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button type="button" variant="outline" onClick={() => setGradingSubmission(null)}>Cancel</Button>
                  <Button type="submit" className="active:translate-y-px"><CheckCircle2 size={16} /> Submit grade</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignments tab */}
      {activeTab === 'assignments' && (
        <section className="flex flex-col gap-4">
          {myAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
              <ClipboardList size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No assignments created yet.</p>
              <Button onClick={() => setShowForm(true)} className="active:translate-y-px">
                <Plus size={16} /> New assignment
              </Button>
            </div>
          ) : (
            myAssignments.map(asgn => {
              const course = courses.find(c => c.id === asgn.courseId);
              const subs = getAssignmentSubmissions(asgn.id);
              const isOverdue = new Date(asgn.dueDate) < new Date();
              const ungraded = subs.filter(s => s.score === null).length;
              return (
                <article
                  key={asgn.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span
                      className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ background: course?.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium">{course?.code}</Badge>
                        <Badge
                          variant="outline"
                          className={`border-transparent ${
                            isOverdue ? 'bg-muted text-muted-foreground' : 'bg-success/10 text-success'
                          }`}
                        >
                          {isOverdue ? 'Closed' : 'Active'}
                        </Badge>
                      </div>
                      <h2 className="font-sans text-base font-semibold text-foreground">{asgn.title}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                        {asgn.description.slice(0, 120)}…
                      </p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} /> Due {new Date(asgn.dueDate).toLocaleDateString()}
                        </span>
                        <span className="tabular-nums">Max {asgn.maxScore} pts</span>
                        <span className="tabular-nums">{subs.length} submission{subs.length !== 1 ? 's' : ''}</span>
                        <span className={`tabular-nums ${ungraded > 0 ? 'font-medium text-warning' : ''}`}>
                          {ungraded} ungraded
                        </span>
                      </div>
                      {asgn.attachment && (
                        <div className="mt-3">
                          <Button variant="secondary" size="sm" asChild>
                            <a href={asgn.attachment.data} download={asgn.attachment.name} className="flex items-center">
                              <Download size={14} className="mr-1.5" />
                              {asgn.attachment.name}
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => { setViewingSubmissions(asgn.id); setActiveTab('submissions'); }}
                  >
                    View submissions
                  </Button>
                </article>
              );
            })
          )}
        </section>
      )}

      {/* Submissions tab */}
      {activeTab === 'submissions' && (
        <section className="flex flex-col gap-4">
          {allSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
              <Eye size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No submissions yet.</p>
            </div>
          ) : (
            allSubmissions.map(sub => {
              const asgn = myAssignments.find(a => a.id === sub.assignmentId);
              const course = courses.find(c => c.id === asgn?.courseId);
              return (
                <article
                  key={sub.id}
                  className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {sub.studentName?.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{sub.studentName}</span>
                      {course && <Badge variant="secondary" className="font-medium">{course.code}</Badge>}
                    </div>
                    <p className="text-sm font-medium text-foreground">{asgn?.title}</p>
                    <p className="text-sm leading-relaxed text-muted-foreground text-pretty mb-2">
                      {sub.content ? sub.content.slice(0, 100) + '…' : <span className="italic">No text content</span>}
                    </p>
                    {sub.attachment && (
                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground bg-muted px-2 py-1 rounded-md w-fit mb-2">
                        <Download size={12} /> Attachment included
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} /> Submitted {new Date(sub.submittedAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    {sub.score !== null ? (
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-success/10 px-2.5 py-1 text-sm font-semibold text-success tabular-nums">
                        <CheckCircle2 size={15} />
                        {sub.score}/{asgn?.maxScore}
                      </span>
                    ) : (
                      <Button
                        size="sm"
                        className="active:translate-y-px"
                        onClick={() => { setGradingSubmission(sub); setGradeForm({ score: '', feedback: '' }); }}
                      >
                        <Star size={14} /> Grade
                      </Button>
                    )}
                    {sub.feedback && (
                      <p className="flex max-w-[200px] items-start gap-1.5 text-right text-xs text-muted-foreground">
                        <MessageSquare size={12} className="mt-0.5 shrink-0" /> {sub.feedback}
                      </p>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}
    </div>
  );
}
