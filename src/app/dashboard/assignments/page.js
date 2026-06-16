"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useMemo } from 'react';
import {
  ClipboardList, Clock, CheckCircle2, Send, GraduationCap, Download,
  CalendarClock, Lock, AlertCircle, X, Hourglass, Paperclip,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

// ── Submission file constraints (student-facing) ──
const MAX_FILE_BYTES = 1024 * 1024; // hard 1MB cap (localStorage is tiny)

// Map the lecturer's allowedFormats tokens (pdf/docx/pptx/zip/image) to the
// concrete file extensions students may upload. Keeps the uploader in sync
// with what the lecturer actually permitted instead of a fixed pdf/docx list.
const FORMAT_EXT_MAP = {
  pdf: ['pdf'],
  docx: ['docx', 'doc'],
  pptx: ['pptx', 'ppt'],
  zip: ['zip'],
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp'],
};
const DEFAULT_FORMATS = ['pdf', 'docx'];

// Resolve the accepted extension list for a given assignment.
const allowedExtsFor = (asgn) => {
  const formats = Array.isArray(asgn?.allowedFormats) && asgn.allowedFormats.length
    ? asgn.allowedFormats
    : DEFAULT_FORMATS;
  const exts = formats.flatMap((f) => FORMAT_EXT_MAP[f] || [f]);
  return exts.length ? [...new Set(exts)] : ['pdf', 'docx'];
};

// Build the <input accept> attribute from the resolved extension list.
const acceptFor = (asgn) => allowedExtsFor(asgn).map((e) => `.${e}`).join(',');

// Pad helper for the live countdown.
const pad = (n) => String(n).padStart(2, '0');

// Build a short human countdown from a remaining millisecond span.
function formatCountdown(ms) {
  if (ms <= 0) return 'Deadline passed';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${pad(hours)}h ${pad(mins)}m left`;
  return `${pad(hours)}:${pad(mins)}:${pad(secs)} left`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    weekday: 'short', month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit',
  });
}

const STATUS_META = {
  upcoming: { label: 'Upcoming', cls: 'bg-info/10 text-info', accent: 'bg-info' },
  active: { label: 'Active', cls: 'bg-success/10 text-success', accent: 'bg-success' },
  closed: { label: 'Closed', cls: 'bg-muted text-muted-foreground', accent: 'bg-muted-foreground/40' },
};

export default function StudentAssignments() {
  const {
    user, courses, assignments, submissions,
    submitAssignment, getStudentCourses, getAssignmentStatus,
    getCourseAssignedLecturer, _effectiveDueMs,
  } = useStore();

  const [filter, setFilter] = useState('all');
  const [submitting, setSubmitting] = useState(null); // assignment being submitted
  const [answerText, setAnswerText] = useState('');
  const [answerFile, setAnswerFile] = useState(null); // { name, type, data, size }
  const [fileError, setFileError] = useState('');
  const [formError, setFormError] = useState('');
  const [confirmation, setConfirmation] = useState(null); // { title, submittedAt }

  // Single ticking clock drives every live countdown without per-card timers.
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // Student's registered courses only.
  const myCourses = useMemo(() => getStudentCourses(user) || [], [getStudentCourses, user]);
  const myCourseIds = useMemo(() => myCourses.map(c => c.id), [myCourses]);

  // Assignments for those courses, excluding drafts the student shouldn't see.
  const myAssignments = useMemo(
    () => assignments.filter(a => myCourseIds.includes(a.courseId) && a.status !== 'draft'),
    [assignments, myCourseIds]
  );

  const mySubmissions = useMemo(
    () => submissions.filter(s => s.studentId === user?.id),
    [submissions, user?.id]
  );
  const getSubmission = (assignmentId) =>
    mySubmissions.find(s => s.assignmentId === assignmentId) || null;

  // Status per assignment, honoring this student's per-student extension.
  const statusOf = (asgn) => getAssignmentStatus(asgn, user?.id);

  const buckets = useMemo(() => {
    const b = { upcoming: [], active: [], closed: [] };
    myAssignments.forEach(a => { b[statusOf(a)]?.push(a); });
    return b;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myAssignments, user?.id, now]);

  const displayed =
    filter === 'active' ? buckets.active
    : filter === 'upcoming' ? buckets.upcoming
    : filter === 'closed' ? buckets.closed
    : myAssignments;

  const gradedCount = mySubmissions.filter(s => s.status === 'graded' || s.score !== null).length;

  const filterLabels = { all: 'All', upcoming: 'Upcoming', active: 'Active', closed: 'Closed' };

  // ── File picker handler: validate extension AND size before accepting ──
  const handleFilePick = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) { setAnswerFile(null); return; }
    const allowedExts = allowedExtsFor(submitting);
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!allowedExts.includes(ext)) {
      setAnswerFile(null);
      e.target.value = '';
      setFileError(`Only ${allowedExts.map((x) => x.toUpperCase()).join(', ')} files are accepted.`);
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setAnswerFile(null);
      e.target.value = '';
      setFileError('File is too large. The maximum size is 1 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => setFileError('Could not read that file. Try again.');
    reader.onloadend = () => {
      setAnswerFile({ name: file.name, type: file.type, data: reader.result, size: file.size });
    };
    reader.readAsDataURL(file);
  };

  const openSubmit = (asgn) => {
    const existing = getSubmission(asgn.id);
    setSubmitting(asgn);
    setAnswerText(existing?.answerText || existing?.content || '');
    setAnswerFile(existing?.file || existing?.attachment || null);
    setFileError('');
    setFormError('');
  };

  const closeSubmit = () => {
    setSubmitting(null);
    setAnswerText('');
    setAnswerFile(null);
    setFileError('');
    setFormError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError('');
    if (!answerText.trim() && !answerFile) {
      setFormError('Add a text answer or attach a PDF/DOCX file before submitting.');
      return;
    }
    const result = submitAssignment(submitting.id, answerText.trim(), answerFile);
    if (result?.error) {
      // Past the effective deadline (or otherwise closed).
      setFormError('This assignment is closed. The submission deadline has passed.');
      return;
    }
    const title = submitting.title;
    closeSubmit();
    setConfirmation({ title, submittedAt: result.submittedAt });
  };

  const submittingCourse = submitting ? courses.find(c => c.id === submitting.courseId) : null;
  const submittingExisting = submitting ? getSubmission(submitting.id) : null;

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
            Review tasks for your registered courses, submit your work before the deadline, and track your grades.
          </p>
        </div>
        <div className="flex bg-muted p-1 rounded-md border border-border">
          {['all', 'upcoming', 'active', 'closed'].map(f => (
            <button
              key={f}
              className={`px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${filter === f ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
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
        <MetricCard label="Open to submit" value={buckets.active.length} icon={<Clock size={20} strokeWidth={1.5} />} />
        <MetricCard label="Submitted" value={mySubmissions.length} icon={<CheckCircle2 size={20} strokeWidth={1.5} />} />
        <MetricCard label="Graded" value={gradedCount} icon={<GraduationCap size={20} strokeWidth={1.5} />} />
      </section>

      {/* Assignment grid */}
      {displayed.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center gap-3 rounded-xl border border-border bg-card py-16 px-6">
          <ClipboardList size={40} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose">
            No assignments to show here yet. They will appear once your lecturers publish work for your registered courses.
          </p>
        </div>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {displayed.map(asgn => {
            const status = statusOf(asgn);
            const meta = STATUS_META[status];
            const course = courses.find(c => c.id === asgn.courseId);
            const lecturer = getCourseAssignedLecturer(asgn.courseId);
            const sub = getSubmission(asgn.id);
            const graded = sub && (sub.status === 'graded' || sub.score !== null);
            const dueMs = _effectiveDueMs(asgn, user?.id);
            const remaining = Number.isNaN(dueMs) ? 0 : dueMs - now;
            const hasExtension = !!asgn.extensions?.[user?.id];

            return (
              <Card key={asgn.id} className="group relative transition-colors hover:border-primary/40 rounded-xl border border-border overflow-hidden flex flex-col">
                <span className={`absolute inset-y-0 left-0 w-1 ${meta.accent}`} aria-hidden="true" />
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <Badge variant="outline" className="font-medium text-xs">{course?.code || 'Course'}</Badge>
                    <Badge className={`${meta.cls} border-transparent font-medium`}>{meta.label}</Badge>
                  </div>
                  <CardTitle className="text-lg font-semibold text-foreground leading-tight text-balance">
                    {asgn.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="flex-1 pb-5 space-y-4">
                  <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3 text-pretty">
                    {asgn.instructions || asgn.description}
                  </p>

                  {lecturer && (
                    <p className="text-xs font-medium text-muted-foreground">
                      By {lecturer.title || 'Dr.'} {lecturer.name}
                    </p>
                  )}

                  {/* Due date + live countdown (active) or plain due line */}
                  <div className="flex items-center gap-2 text-xs">
                    {status === 'upcoming' ? (
                      <span className="inline-flex items-center gap-1.5 text-info font-medium">
                        <Hourglass size={14} strokeWidth={1.5} /> Opens {formatDateTime(asgn.startAt)}
                      </span>
                    ) : status === 'active' ? (
                      <span className="inline-flex items-center gap-1.5 text-foreground font-medium tabular-nums">
                        <Clock size={14} strokeWidth={1.5} className="text-warning" />
                        {formatCountdown(remaining)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Lock size={14} strokeWidth={1.5} /> Closed {formatDateTime(dueMs ? new Date(dueMs).toISOString() : null)}
                      </span>
                    )}
                  </div>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CalendarClock size={14} strokeWidth={1.5} />
                    Due {formatDateTime(dueMs ? new Date(dueMs).toISOString() : asgn.dueDate)}
                    {hasExtension && <span className="text-info font-medium">· extended for you</span>}
                  </p>

                  {/* Reference document */}
                  {asgn.attachment?.data && (
                    <Button variant="secondary" size="sm" className="w-full justify-start" asChild>
                      <a href={asgn.attachment.data} download={asgn.attachment.name}>
                        <Download size={16} className="mr-2" /> Reference document
                      </a>
                    </Button>
                  )}

                  {/* Score panel */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-md bg-muted border border-border flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Total marks</span>
                      <span className="text-lg font-semibold text-foreground tabular-nums">{asgn.totalMarks ?? asgn.maxScore}</span>
                    </div>
                    <div className="p-3 rounded-md bg-muted border border-border flex flex-col items-center gap-0.5">
                      <span className="text-xs font-medium text-muted-foreground">Your grade</span>
                      <span className="text-lg font-semibold text-foreground tabular-nums">{graded ? sub.score : '--'}</span>
                    </div>
                  </div>

                  {/* Submission confirmation (timestamp) */}
                  {sub && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-success/10 border border-transparent">
                      <CheckCircle2 size={16} className="text-success mt-0.5 shrink-0" strokeWidth={2} />
                      <p className="text-xs leading-relaxed text-success-foreground/90 text-foreground">
                        Submitted on {formatDateTime(sub.submittedAt)}
                        {sub.file?.name && <span className="block text-muted-foreground mt-0.5">{sub.file.name}</span>}
                      </p>
                    </div>
                  )}

                  {/* Grade feedback */}
                  {graded && sub.feedback && (
                    <div className="p-3 rounded-md bg-muted border-l-2 border-primary">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Lecturer feedback</span>
                      <p className="text-sm leading-relaxed text-foreground mt-1 text-pretty">{sub.feedback}</p>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0 px-6 pb-6">
                  {status === 'upcoming' ? (
                    <Button variant="ghost" disabled className="w-full text-muted-foreground">
                      <Hourglass size={16} className="mr-2" /> Not open yet
                    </Button>
                  ) : status === 'active' ? (
                    <Button className="w-full" onClick={() => openSubmit(asgn)}>
                      {sub ? 'Resubmit' : 'Submit now'} <Send size={16} className="ml-2" />
                    </Button>
                  ) : (
                    <Button variant="ghost" disabled className="w-full text-muted-foreground">
                      <Lock size={16} className="mr-2" /> Submission locked
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </section>
      )}

      {/* ── Submission dialog ── */}
      <Dialog open={!!submitting} onOpenChange={(open) => !open && closeSubmit()}>
        <DialogContent className="max-w-2xl rounded-xl p-0 overflow-hidden border border-border">
          <DialogTitle className="sr-only">Submit assignment: {submitting?.title}</DialogTitle>
          <DialogDescription className="sr-only">Provide your response to the assignment prompt below.</DialogDescription>
          {submitting && (
            <div className="flex flex-col max-h-[85vh] overflow-y-auto">
              <div className="p-6 border-b border-border bg-muted">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
                  {submittingExisting ? 'Replace your submission' : 'Assignment submission'}
                </p>
                <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">{submitting.title}</h2>
                <p className="text-sm text-muted-foreground mt-1 tabular-nums">
                  {submittingCourse?.code ? `${submittingCourse.code} · ` : ''}Total marks: {submitting.totalMarks ?? submitting.maxScore}
                </p>
                <p className="flex items-center gap-1.5 text-sm text-foreground font-medium mt-2 tabular-nums">
                  <Clock size={14} strokeWidth={1.5} className="text-warning" />
                  {formatCountdown(_effectiveDueMs(submitting, user?.id) - now)}
                </p>
              </div>

              <div className="p-6 space-y-6">
                <div className="p-4 rounded-md bg-muted border-l-2 border-primary text-sm leading-relaxed text-muted-foreground text-pretty">
                  {submitting.instructions || submitting.description}
                </div>

                {submitting.attachment?.data && (
                  <Button variant="secondary" size="sm" className="justify-start" asChild>
                    <a href={submitting.attachment.data} download={submitting.attachment.name}>
                      <Download size={16} className="mr-2" /> Reference document
                    </a>
                  </Button>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="answerText" className="text-sm font-medium text-foreground">Text answer (optional)</label>
                    <Textarea
                      id="answerText"
                      rows={7}
                      placeholder="Type your response here, or attach a file below…"
                      className="w-full text-base leading-relaxed"
                      value={answerText}
                      onChange={e => setAnswerText(e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="submissionFile" className="text-sm font-medium text-foreground">
                      Attach file <span className="text-muted-foreground font-normal">— {allowedExtsFor(submitting).map((x) => x.toUpperCase()).join(', ')}, up to 1 MB</span>
                    </label>
                    <input
                      id="submissionFile"
                      type="file"
                      accept={acceptFor(submitting)}
                      className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm text-muted-foreground file:mr-3 file:border-0 file:bg-muted file:rounded file:px-3 file:py-1 file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      onChange={handleFilePick}
                    />

                    {answerFile && !fileError && (
                      <div className="flex items-center justify-between gap-2 p-2.5 rounded-md bg-muted border border-border">
                        <span className="flex items-center gap-2 text-sm text-foreground truncate">
                          <Paperclip size={14} strokeWidth={1.5} className="shrink-0 text-muted-foreground" />
                          <span className="truncate">{answerFile.name}</span>
                          {answerFile.size != null && (
                            <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                              {(answerFile.size / 1024).toFixed(0)} KB
                            </span>
                          )}
                        </span>
                        <button
                          type="button"
                          aria-label="Remove attached file"
                          className="text-muted-foreground hover:text-foreground transition-colors"
                          onClick={() => { setAnswerFile(null); setFileError(''); }}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}

                    {fileError && (
                      <p className="flex items-center gap-1.5 text-xs font-medium text-destructive">
                        <AlertCircle size={14} strokeWidth={2} /> {fileError}
                      </p>
                    )}
                  </div>

                  {formError && (
                    <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 border border-transparent">
                      <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" strokeWidth={2} />
                      <p className="text-sm text-destructive font-medium">{formError}</p>
                    </div>
                  )}

                  <div className="flex gap-3 pt-1">
                    <Button type="button" variant="outline" className="flex-1" onClick={closeSubmit}>Cancel</Button>
                    <Button type="submit" className="flex-[2]">
                      {submittingExisting ? 'Replace submission' : 'Submit response'} <Send size={16} className="ml-2" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Confirmation dialog ── */}
      <Dialog open={!!confirmation} onOpenChange={(open) => !open && setConfirmation(null)}>
        <DialogContent className="max-w-md rounded-xl border border-border text-center">
          <DialogTitle className="sr-only">Submission received</DialogTitle>
          <DialogDescription className="sr-only">Your assignment was submitted successfully.</DialogDescription>
          {confirmation && (
            <div className="flex flex-col items-center gap-4 py-2">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-success/10">
                <CheckCircle2 size={26} className="text-success" strokeWidth={2} />
              </span>
              <div className="space-y-1.5">
                <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">Submission received</h2>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
                  Your work for <span className="font-medium text-foreground">{confirmation.title}</span> was submitted on{' '}
                  <span className="font-medium text-foreground tabular-nums">{formatDateTime(confirmation.submittedAt)}</span>.
                </p>
              </div>
              <Button className="w-full" onClick={() => setConfirmation(null)}>Done</Button>
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
