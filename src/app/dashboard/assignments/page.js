"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, Send, GraduationCap, ChevronRight, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function StudentAssignments() {
  const { user, courses, assignments, submissions, submitAssignment, getStudentCourses, getCourseAssignedLecturer } = useStore();
  const [submitting, setSubmitting] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [answerFile, setAnswerFile] = useState(null);
  const [filter, setFilter] = useState('all');

  const mySubmissions = submissions.filter(s => s.studentId === user?.id);
  const hasSubmitted = (assignmentId) => mySubmissions.some(s => s.assignmentId === assignmentId);
  const getSubmission = (assignmentId) => mySubmissions.find(s => s.assignmentId === assignmentId);

  const myCourses = getStudentCourses(user);
  const levelCourseIds = myCourses.map(c => c.id);
  const myAssignments = assignments.filter(a => levelCourseIds.includes(a.courseId));

  const activeAssignments = myAssignments.filter(a => a.status === 'active');
  const closedAssignments = myAssignments.filter(a => a.status !== 'active');
  const displayed = filter === 'active' ? activeAssignments : filter === 'closed' ? closedAssignments : myAssignments;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim() && !answerFile) return;
    submitAssignment(submitting.id, answerText.trim(), answerFile);
    setSubmitting(null);
    setAnswerText('');
    setAnswerFile(null);
  };

  const getDaysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    if (diff < 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  const filterLabels = { all: 'All', active: 'Active', closed: 'Closed' };

  const submittingCourse = submitting ? courses.find(c => c.id === submitting.courseId) : null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card text-card-foreground p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground flex items-center gap-2.5">
            <ClipboardList size={28} className="text-primary" strokeWidth={1.5} />
            Assignments
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground mt-1.5 max-w-prose text-pretty">
            Review your tasks, submit your work, and track your grades.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-md border border-border">
          {['all', 'active', 'closed'].map(f => (
            <button
              key={f}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setFilter(f)}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </header>

      {/* Metrics */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <MetricCard label="Total assigned" value={myAssignments.length} icon={<ClipboardList size={20} strokeWidth={1.5} />} />
        <MetricCard label="Pending tasks" value={activeAssignments.length} icon={<Clock size={20} strokeWidth={1.5} />} />
        <MetricCard label="Completed" value={mySubmissions.length} icon={<CheckCircle2 size={20} strokeWidth={1.5} />} />
        <MetricCard label="Graded" value={mySubmissions.filter(s => s.score !== null).length} icon={<GraduationCap size={20} strokeWidth={1.5} />} />
      </section>

      {/* Assignment grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-border bg-card py-16 px-6">
          <ClipboardList size={40} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
            No assignments to show here yet. Check back once your lecturers post new work.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayed.map(asgn => {
            const course = courses.find(c => c.id === asgn.courseId);
            const lecturer = getCourseAssignedLecturer(asgn.courseId);
            const submitted = hasSubmitted(asgn.id);
            const sub = getSubmission(asgn.id);
            const isOverdue = new Date(asgn.dueDate) < new Date() && !submitted;
            const daysLeft = getDaysLeft(asgn.dueDate);
            const accent = submitted ? 'bg-success' : isOverdue ? 'bg-destructive' : 'bg-primary';

            return (
              <Card key={asgn.id} className="group relative transition-colors hover:border-primary/40 rounded-xl border border-border overflow-hidden flex flex-col">
                <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden="true" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="font-medium text-xs">{course?.code}</Badge>
                    {submitted ? (
                      <Badge className="bg-success/10 text-success border-transparent font-medium">Submitted</Badge>
                    ) : isOverdue ? (
                      <Badge className="bg-destructive/10 text-destructive border-transparent font-medium">Overdue</Badge>
                    ) : (
                      <Badge className="bg-warning/10 text-warning border-transparent font-medium tabular-nums">{daysLeft || 'Due now'}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground leading-tight text-balance">
                    {asgn.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 pb-5">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 mb-5 text-pretty">
                    {asgn.description}
                  </p>
                  {lecturer && (
                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-muted-foreground">
                      <span>By: {lecturer.title || 'Dr.'} {lecturer.name}</span>
                    </div>
                  )}
                  {asgn.attachment && (
                    <div className="mb-5">
                      <Button variant="secondary" size="sm" className="w-full justify-start" asChild>
                        <a href={asgn.attachment.data} download={asgn.attachment.name}>
                          <Download size={16} className="mr-2" /> Download attachment
                        </a>
                      </Button>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-md bg-muted border border-border flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Max score</span>
                      <span className="text-lg font-semibold text-foreground tabular-nums">{asgn.maxScore}</span>
                    </div>
                    <div className="p-3 rounded-md bg-muted border border-border flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Your grade</span>
                      <span className="text-lg font-semibold text-foreground tabular-nums">{sub && sub.score !== null ? sub.score : '--'}</span>
                    </div>
                  </div>
                  {sub?.feedback && (
                    <div className="mt-3 p-3 rounded-md bg-muted border-l-2 border-primary">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lecturer feedback</span>
                      <p className="text-sm leading-relaxed text-foreground mt-1 text-pretty">{sub.feedback}</p>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-0 px-6 pb-6">
                  {submitted ? (
                    <Button variant="outline" className="w-full" onClick={() => alert("Submission details coming soon...")}>
                      Review submission
                    </Button>
                  ) : !isOverdue ? (
                    <Button className="w-full" onClick={() => setSubmitting(asgn)}>
                      Submit now <Send size={16} className="ml-2" />
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className="w-full text-muted-foreground">
                      Submissions closed
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </section>
      )}

      {/* Submission dialog */}
      <Dialog open={!!submitting} onOpenChange={(open) => !open && setSubmitting(null)}>
        <DialogContent className="max-w-2xl rounded-xl p-0 overflow-hidden border border-border">
          <DialogTitle className="sr-only">Submit assignment: {submitting?.title}</DialogTitle>
          <DialogDescription className="sr-only">Provide your response to the assignment prompt below.</DialogDescription>
          {submitting && (
            <div className="flex flex-col">
              <div className="p-6 border-b border-border bg-muted">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Assignment submission</p>
                <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">{submitting.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 tabular-nums">{submittingCourse?.code ? `${submittingCourse.code} · ` : ''}Max points: {submitting.maxScore}</p>
              </div>
              <div className="p-6 space-y-6">
                <div className="p-4 rounded-md bg-muted border-l-2 border-primary text-sm leading-relaxed text-muted-foreground">
                  {submitting.description}
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Textarea
                    rows={8}
                    placeholder="Type your response here (optional if attaching a file)..."
                    className="w-full text-base leading-relaxed"
                    value={answerText}
                    onChange={e => setAnswerText(e.target.value)}
                    required={!answerFile}
                  />
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="submissionFile" className="text-sm font-medium text-foreground">Attach file (optional)</label>
                    <input
                      id="submissionFile"
                      type="file"
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onChange={e => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setAnswerFile({ name: file.name, type: file.type, data: reader.result });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setSubmitting(null); setAnswerFile(null); }}>Discard</Button>
                    <Button type="submit" className="flex-[2]">
                      Submit response <ChevronRight size={18} className="ml-1" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ label, value, icon }) {
  return (
    <Card className="border border-border shadow-sm transition-colors hover:border-primary/40">
      <CardContent className="p-5 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
          <p className="text-2xl font-semibold text-foreground tabular-nums">{value}</p>
        </div>
        <div className="text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
