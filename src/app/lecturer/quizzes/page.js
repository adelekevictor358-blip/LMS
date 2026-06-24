"use client";

import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import {
  HelpCircle, Plus, X, Trash2, ClipboardList, Clock, Pencil, Send,
  CalendarClock, Search, Download, Printer, ListChecks, FileText,
  AlertTriangle, Lock, Award, Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table, TableHeader, TableBody, TableHead, TableRow, TableCell,
} from '@/components/ui/table';

// ─── helpers ─────────────────────────────────────────────────────────────
const selectClass =
  'flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring';

// ISO string -> value usable by <input type="datetime-local"> (local time, no seconds).
function isoToLocalInput(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

// datetime-local value -> ISO string.
function localInputToIso(value) {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
}

function emptyMcq(id) {
  return { id, type: 'mcq', text: '', options: ['', '', '', ''], correct: 0, marks: 1 };
}

const STATUS_STYLES = {
  draft: 'bg-muted text-muted-foreground border-transparent',
  upcoming: 'bg-info/10 text-info border-transparent',
  active: 'bg-success/10 text-success border-transparent',
  closed: 'bg-destructive/10 text-destructive border-transparent',
};
const STATUS_LABEL = {
  draft: 'Draft', upcoming: 'Upcoming', active: 'Active', closed: 'Closed',
};

function blankForm() {
  return {
    title: '', courseId: '', instructions: '',
    startAt: '', endAt: '', timeLimit: 15, attemptsAllowed: 1,
    shuffleQuestions: false, shuffleOptions: false, displayMode: 'all',
    questions: [emptyMcq(1)],
  };
}

// A small token-based toggle (the shared Switch primitive hardcodes off-token colors).
function Toggle({ checked, onChange, label, id }) {
  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-border transition-colors ${
          checked ? 'bg-primary' : 'bg-muted'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-card shadow-sm transition-transform ${
            checked ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </span>
      <span className="text-sm text-foreground">{label}</span>
    </button>
  );
}

export default function LecturerQuizzes() {
  const {
    user, courses, quizzes,
    addQuiz, updateQuiz, deleteQuiz, publishQuiz, extendQuizDeadline,
    getQuizStatus, getQuizSubmissions, gradeShortAnswers,
  } = useStore();
  const getLecturerRegisteredCourses = useStore(s => s.getLecturerRegisteredCourses);

  const myCourses = useMemo(
    () => getLecturerRegisteredCourses(user?.id) || [],
    [getLecturerRegisteredCourses, user?.id]
  );
  // If the lecturer owns no courses, the builder may target any course.
  const courseOptions = myCourses.length > 0 ? myCourses : courses;

  const myQuizzes = useMemo(
    () => quizzes.filter(q => q.lecturerId === user?.id),
    [quizzes, user?.id]
  );

  const [tab, setTab] = useState('my-quizzes');

  // builder state
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create
  const [form, setForm] = useState(blankForm());
  const [formError, setFormError] = useState('');

  // submissions / extend / grading dialogs
  const [submissionsQuizId, setSubmissionsQuizId] = useState(null);
  const [extendingId, setExtendingId] = useState(null);
  const [extendValue, setExtendValue] = useState('');
  const [gradingAttemptId, setGradingAttemptId] = useState(null);
  const [shortMarks, setShortMarks] = useState({});
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const editingQuiz = editingId ? quizzes.find(q => q.id === editingId) : null;
  const editingHasAttempts =
    editingId ? getQuizSubmissions(editingId).length > 0 : false;

  // ─── builder open helpers ──────────────────────────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(blankForm());
    setFormError('');
    setBuilderOpen(true);
  };

  const openEdit = (quiz) => {
    setEditingId(quiz.id);
    setForm({
      title: quiz.title || '',
      courseId: quiz.courseId != null ? String(quiz.courseId) : '',
      instructions: quiz.instructions ?? quiz.description ?? '',
      startAt: isoToLocalInput(quiz.startAt),
      endAt: isoToLocalInput(quiz.endAt),
      timeLimit: quiz.timeLimit ?? 15,
      attemptsAllowed: quiz.attemptsAllowed ?? 1,
      shuffleQuestions: !!quiz.shuffleQuestions,
      shuffleOptions: !!quiz.shuffleOptions,
      displayMode: quiz.displayMode === 'one' ? 'one' : 'all',
      questions: (quiz.questions || []).map(q => ({
        id: q.id,
        type: q.type || 'mcq',
        text: q.text ?? q.question ?? '',
        options: q.type === 'mcq' ? [...(q.options || ['', '', '', ''])] : ['', '', '', ''],
        correct: q.type === 'tf' ? (q.correct === true) : (q.type === 'mcq' ? (q.correct ?? 0) : (q.correct ?? '')),
        marks: q.marks ?? 1,
      })),
    });
    setFormError('');
    setBuilderOpen(true);
  };

  // ─── question editor mutators ──────────────────────────────────────────
  const setQuestions = (updater) =>
    setForm(f => ({ ...f, questions: typeof updater === 'function' ? updater(f.questions) : updater }));

  const addQuestion = (type) => {
    const id = Date.now();
    let q;
    if (type === 'tf') q = { id, type: 'tf', text: '', correct: true, marks: 1 };
    else if (type === 'short') q = { id, type: 'short', text: '', correct: '', marks: 1 };
    else q = emptyMcq(id);
    setQuestions(qs => [...qs, q]);
  };

  const removeQuestion = (idx) =>
    setQuestions(qs => qs.filter((_, i) => i !== idx));

  const updateQuestion = (idx, patch) =>
    setQuestions(qs => qs.map((q, i) => (i === idx ? { ...q, ...patch } : q)));

  const updateOption = (qIdx, oIdx, value) =>
    setQuestions(qs => qs.map((q, i) => {
      if (i !== qIdx) return q;
      const options = [...q.options];
      options[oIdx] = value;
      return { ...q, options };
    }));

  // ─── validation + save ─────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim()) return 'Add a quiz title.';
    if (!form.courseId) return 'Select a course.';
    if (!form.questions.length) return 'Add at least one question.';
    for (let i = 0; i < form.questions.length; i++) {
      const q = form.questions[i];
      if (!String(q.text).trim()) return `Question ${i + 1} is missing its text.`;
      if ((parseInt(q.marks, 10) || 0) <= 0) return `Question ${i + 1} needs marks greater than 0.`;
      if (q.type === 'mcq' && q.options.some(o => !String(o).trim())) {
        return `Fill in all four options for question ${i + 1}.`;
      }
    }
    if (form.startAt && form.endAt && new Date(form.endAt) <= new Date(form.startAt)) {
      return 'End time must be after the start time.';
    }
    return '';
  };

  const buildPayload = () => ({
    title: form.title.trim(),
    courseId: parseInt(form.courseId, 10),
    instructions: form.instructions,
    startAt: form.startAt ? localInputToIso(form.startAt) : undefined,
    endAt: form.endAt ? localInputToIso(form.endAt) : undefined,
    timeLimit: parseInt(form.timeLimit, 10) || 15,
    attemptsAllowed: parseInt(form.attemptsAllowed, 10) || 1,
    shuffleQuestions: form.shuffleQuestions,
    shuffleOptions: form.shuffleOptions,
    displayMode: form.displayMode,
    questions: form.questions.map(q => ({
      id: q.id,
      type: q.type,
      text: q.text,
      options: q.type === 'mcq' ? q.options : [],
      correct:
        q.type === 'mcq' ? (parseInt(q.correct, 10) || 0)
          : q.type === 'tf' ? (q.correct === true)
            : (String(q.correct).trim() || null),
      marks: parseInt(q.marks, 10) || 1,
    })),
  });

  const handleSave = (publish) => {
    // When editing a quiz that already has attempts, only the end date may change.
    if (editingId && editingHasAttempts) {
      const iso = form.endAt ? localInputToIso(form.endAt) : '';
      if (!iso) { setFormError('Set a valid end date.'); return; }
      extendQuizDeadline(editingId, iso);
      setBuilderOpen(false);
      return;
    }

    const err = validate();
    if (err) { setFormError(err); return; }
    const payload = buildPayload();

    if (editingId) {
      updateQuiz(editingId, payload);
      if (publish) publishQuiz(editingId);
    } else {
      const created = addQuiz(payload);
      if (publish && created) publishQuiz(created.id);
    }
    setBuilderOpen(false);
  };

  const handleDelete = (quiz) => {
    if (typeof window !== 'undefined' &&
        !window.confirm(`Delete "${quiz.title}"? This also removes all of its submissions.`)) {
      return;
    }
    deleteQuiz(quiz.id);
  };

  const openExtend = (quiz) => {
    setExtendingId(quiz.id);
    setExtendValue(isoToLocalInput(quiz.endAt));
  };

  const confirmExtend = () => {
    const iso = extendValue ? localInputToIso(extendValue) : '';
    if (!iso) return;
    extendQuizDeadline(extendingId, iso);
    setExtendingId(null);
  };

  // ─── submissions data ──────────────────────────────────────────────────
  const submissionsQuiz = submissionsQuizId
    ? quizzes.find(q => q.id === submissionsQuizId)
    : null;
  const rawSubmissions = submissionsQuizId
    ? getQuizSubmissions(submissionsQuizId).filter(a => a.status !== 'in-progress')
    : [];
  const filteredSubmissions = rawSubmissions.filter(a => {
    const matchesName = a.studentName?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesName && matchesStatus;
  });

  const openSubmissions = (quiz) => {
    setSubmissionsQuizId(quiz.id);
    setSearch('');
    setStatusFilter('all');
  };

  const exportSubmissionsCsv = () => {
    if (!submissionsQuiz) return;
    const header = ['Student', 'Score', 'Max', 'Grade %', 'Time (s)', 'Submitted', 'Status', 'Tab switches'];
    const rows = filteredSubmissions.map(a => {
      const pct = a.maxScore > 0 ? Math.round(((a.totalScore || 0) / a.maxScore) * 100) : 0;
      return [
        a.studentName ?? '',
        a.totalScore ?? 0,
        a.maxScore ?? 0,
        `${pct}%`,
        a.timeTakenSec ?? '',
        a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '',
        a.status,
        a.flags?.tabSwitches ?? 0,
      ];
    });
    const esc = (v) => `"${String(v).replace(/"/g, '""')}"`;
    const csv = [header, ...rows].map(r => r.map(esc).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(submissionsQuiz.title || 'quiz').replace(/[^a-z0-9]+/gi, '_')}_submissions.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ─── short-answer grading ──────────────────────────────────────────────
  const gradingAttempt = gradingAttemptId
    ? getQuizSubmissions(submissionsQuizId || 0).find(a => a.id === gradingAttemptId)
    : null;
  const gradingShortQuestions = (submissionsQuiz?.questions || []).filter(q => q.type === 'short');

  const openGrading = (attempt) => {
    setGradingAttemptId(attempt.id);
    const init = {};
    gradingShortQuestionsFor(attempt).forEach(q => {
      init[q.id] = attempt.shortMarks?.[q.id] ?? '';
    });
    setShortMarks(init);
  };
  // helper that doesn't rely on submissionsQuiz closure timing
  function gradingShortQuestionsFor(attempt) {
    const quiz = quizzes.find(q => q.id === attempt.quizId);
    return (quiz?.questions || []).filter(q => q.type === 'short');
  }

  const saveGrading = () => {
    if (!gradingAttempt) return;
    const marks = {};
    Object.keys(shortMarks).forEach(qid => {
      marks[qid] = parseInt(shortMarks[qid], 10) || 0;
    });
    gradeShortAnswers(gradingAttempt.id, marks);
    setGradingAttemptId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Quiz workspace
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Build assessments, publish them to your students, and review submissions.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={16} /> Create quiz
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab} className="space-y-5">
        <TabsList>
          <TabsTrigger value="my-quizzes">My quizzes</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
        </TabsList>

        {/* ─── MY QUIZZES ─────────────────────────────────────────────── */}
        <TabsContent value="my-quizzes" className="space-y-5">
          {myQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
              <HelpCircle size={40} className="text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">You haven&apos;t created any quizzes yet.</p>
              <Button onClick={openCreate}>
                <Plus size={16} /> Create quiz
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {myQuizzes.map(quiz => {
                const course = courses.find(c => c.id === quiz.courseId);
                const status = getQuizStatus(quiz);
                const subs = getQuizSubmissions(quiz.id).filter(a => a.status !== 'in-progress');
                const hasAttempts = getQuizSubmissions(quiz.id).length > 0;
                return (
                  <div
                    key={quiz.id}
                    className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        <HelpCircle size={18} strokeWidth={1.5} />
                      </span>
                      <div className="flex flex-wrap items-center justify-end gap-2">
                        <Badge variant="outline" className={STATUS_STYLES[status]}>
                          {STATUS_LABEL[status]}
                        </Badge>
                        {course && (
                          <Badge variant="outline" className="gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ background: course.color }} aria-hidden="true" />
                            {course.code}
                          </Badge>
                        )}
                      </div>
                    </div>

                    <h4 className="text-base font-semibold text-foreground text-balance">{quiz.title}</h4>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                      <span className="inline-flex items-center gap-1">
                        <ListChecks size={14} strokeWidth={1.5} /> {quiz.questions.length} questions
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Award size={14} strokeWidth={1.5} /> {quiz.totalMarks} marks
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock size={14} strokeWidth={1.5} /> {quiz.timeLimit} min
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Users size={14} strokeWidth={1.5} /> {subs.length} submission{subs.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {hasAttempts && (
                      <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock size={13} strokeWidth={1.5} />
                        Has submissions — only the deadline can be edited.
                      </p>
                    )}

                    <div className="mt-auto flex flex-wrap gap-2 pt-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit(quiz)}>
                        <Pencil size={14} /> Edit
                      </Button>
                      {status === 'draft' && (
                        <Button size="sm" onClick={() => publishQuiz(quiz.id)}>
                          <Send size={14} /> Publish
                        </Button>
                      )}
                      {status !== 'draft' && (
                        <Button variant="outline" size="sm" onClick={() => openExtend(quiz)}>
                          <CalendarClock size={14} /> Extend
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => openSubmissions(quiz)}>
                        <ClipboardList size={14} /> Submissions
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => handleDelete(quiz)}
                      >
                        <Trash2 size={14} /> Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ─── SUBMISSIONS PICKER ─────────────────────────────────────── */}
        <TabsContent value="submissions" className="space-y-5">
          {myQuizzes.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
              <ClipboardList size={40} className="text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Create a quiz to start collecting submissions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myQuizzes.map(quiz => {
                const subs = getQuizSubmissions(quiz.id).filter(a => a.status !== 'in-progress');
                const course = courses.find(c => c.id === quiz.courseId);
                return (
                  <button
                    key={quiz.id}
                    type="button"
                    onClick={() => openSubmissions(quiz)}
                    className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 text-left shadow-sm transition-colors hover:border-primary/40"
                  >
                    <span className="text-sm font-semibold text-foreground">{quiz.title}</span>
                    <span className="text-xs text-muted-foreground">{course?.code}</span>
                    <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Users size={14} strokeWidth={1.5} /> {subs.length} submission{subs.length !== 1 ? 's' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ─── BUILDER MODAL ──────────────────────────────────────────────── */}
      {builderOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setBuilderOpen(false)}
        >
          <div
            className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <HelpCircle size={18} className="text-muted-foreground" strokeWidth={1.5} />
                {editingId ? 'Edit quiz' : 'Create a new quiz'}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setBuilderOpen(false)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>

            {editingId && editingHasAttempts && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-border bg-warning/10 p-3 text-sm text-warning">
                <Lock size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p>This quiz already has submissions. Only the end date can be changed.</p>
              </div>
            )}

            <div className="mt-6 space-y-5">
              {/* meta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="quiz-title">Quiz title</Label>
                  <Input
                    id="quiz-title"
                    type="text"
                    placeholder="e.g. Week 4 self-assessment"
                    value={form.title}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-course">Course</Label>
                  <select
                    id="quiz-course"
                    className={selectClass}
                    value={form.courseId}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                  >
                    <option value="">Select course...</option>
                    {courseOptions.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-time">Time limit (minutes)</Label>
                  <Input
                    id="quiz-time" type="number" min={1} max={300}
                    value={form.timeLimit}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, timeLimit: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-start">Start (date & time)</Label>
                  <Input
                    id="quiz-start" type="datetime-local"
                    value={form.startAt}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, startAt: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-end">End (date & time)</Label>
                  <Input
                    id="quiz-end" type="datetime-local"
                    value={form.endAt}
                    onChange={e => setForm({ ...form, endAt: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-attempts">Attempts allowed</Label>
                  <Input
                    id="quiz-attempts" type="number" min={1} max={10}
                    value={form.attemptsAllowed}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, attemptsAllowed: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-display">Display mode</Label>
                  <select
                    id="quiz-display"
                    className={selectClass}
                    value={form.displayMode}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, displayMode: e.target.value })}
                  >
                    <option value="all">All questions on one page</option>
                    <option value="one">One question at a time</option>
                  </select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="quiz-instructions">Instructions</Label>
                  <Textarea
                    id="quiz-instructions"
                    placeholder="Instructions shown to students before they start"
                    value={form.instructions}
                    disabled={editingHasAttempts}
                    onChange={e => setForm({ ...form, instructions: e.target.value })}
                  />
                </div>
              </div>

              {!editingHasAttempts && (
                <div className="flex flex-wrap gap-x-8 gap-y-3 rounded-xl border border-border bg-muted/40 p-4">
                  <Toggle
                    id="shuffle-q"
                    checked={form.shuffleQuestions}
                    onChange={v => setForm({ ...form, shuffleQuestions: v })}
                    label="Shuffle questions"
                  />
                  <Toggle
                    id="shuffle-o"
                    checked={form.shuffleOptions}
                    onChange={v => setForm({ ...form, shuffleOptions: v })}
                    label="Shuffle options"
                  />
                </div>
              )}

              {/* question editor */}
              {!editingHasAttempts && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Questions ({form.questions.length}) · {form.questions.reduce((s, q) => s + (parseInt(q.marks, 10) || 0), 0)} marks
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('mcq')}>
                        <Plus size={14} /> MCQ
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('tf')}>
                        <Plus size={14} /> True / False
                      </Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => addQuestion('short')}>
                        <Plus size={14} /> Short answer
                      </Button>
                    </div>
                  </div>

                  {form.questions.map((q, qIdx) => (
                    <div key={q.id} className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tabular-nums">
                          {qIdx + 1}
                        </span>
                        <Badge variant="outline" className="shrink-0 uppercase">
                          {q.type === 'mcq' ? 'MCQ' : q.type === 'tf' ? 'True / False' : 'Short'}
                        </Badge>
                        <Input
                          type="text"
                          className="flex-1"
                          placeholder={`Question ${qIdx + 1}`}
                          value={q.text}
                          onChange={e => updateQuestion(qIdx, { text: e.target.value })}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => removeQuestion(qIdx)}
                          aria-label="Remove question"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>

                      {q.type === 'mcq' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {q.options.map((opt, oIdx) => (
                            <label
                              key={oIdx}
                              className={`flex items-center gap-2 rounded-md border px-3 transition-colors ${
                                q.correct === oIdx ? 'border-success bg-success/10' : 'border-border'
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${q.id}`}
                                className="accent-primary"
                                checked={q.correct === oIdx}
                                onChange={() => updateQuestion(qIdx, { correct: oIdx })}
                              />
                              <input
                                type="text"
                                className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
                                placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                value={opt}
                                onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                              />
                            </label>
                          ))}
                        </div>
                      )}

                      {q.type === 'tf' && (
                        <div className="flex gap-2">
                          {[true, false].map(val => (
                            <button
                              key={String(val)}
                              type="button"
                              onClick={() => updateQuestion(qIdx, { correct: val })}
                              className={`flex-1 rounded-md border px-3 py-2 text-sm font-medium transition-colors ${
                                q.correct === val
                                  ? 'border-success bg-success/10 text-success'
                                  : 'border-border text-muted-foreground hover:border-primary/40'
                              }`}
                            >
                              {val ? 'True' : 'False'}
                            </button>
                          ))}
                        </div>
                      )}

                      {q.type === 'short' && (
                        <Input
                          type="text"
                          placeholder="Model answer (optional, for your reference)"
                          value={q.correct || ''}
                          onChange={e => updateQuestion(qIdx, { correct: e.target.value })}
                        />
                      )}

                      <div className="flex items-center gap-2">
                        <Label htmlFor={`marks-${q.id}`} className="text-xs text-muted-foreground">Marks</Label>
                        <Input
                          id={`marks-${q.id}`}
                          type="number" min={1} max={100}
                          className="h-9 w-24"
                          value={q.marks}
                          onChange={e => updateQuestion(qIdx, { marks: e.target.value })}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {formError && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertTriangle size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="flex flex-wrap justify-end gap-3 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setBuilderOpen(false)}>Cancel</Button>
                {editingHasAttempts ? (
                  <Button type="button" onClick={() => handleSave(false)}>
                    <CalendarClock size={16} /> Update deadline
                  </Button>
                ) : (
                  <>
                    <Button type="button" variant="outline" onClick={() => handleSave(false)}>
                      Save draft
                    </Button>
                    <Button type="button" onClick={() => handleSave(true)}>
                      <Send size={16} /> {editingId ? 'Save & publish' : 'Publish'}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── EXTEND DEADLINE MODAL ──────────────────────────────────────── */}
      {extendingId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setExtendingId(null)}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <CalendarClock size={18} className="text-muted-foreground" strokeWidth={1.5} />
                Extend deadline
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setExtendingId(null)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>
            <div className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="extend-end">New end (date & time)</Label>
                <Input
                  id="extend-end" type="datetime-local"
                  value={extendValue}
                  onChange={e => setExtendValue(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setExtendingId(null)}>Cancel</Button>
                <Button onClick={confirmExtend}>Save deadline</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── SUBMISSIONS DASHBOARD MODAL ────────────────────────────────── */}
      {submissionsQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4 print:static print:bg-transparent print:p-0"
          onClick={() => setSubmissionsQuizId(null)}
        >
          <div
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm print:max-h-none print:overflow-visible print:border-0 print:shadow-none"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Submissions — {submissionsQuiz.title}</h3>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {rawSubmissions.length} submission{rawSubmissions.length !== 1 ? 's' : ''} · {submissionsQuiz.totalMarks} marks
                </p>
              </div>
              <div className="flex items-center gap-2 print:hidden">
                <Button variant="outline" size="sm" onClick={exportSubmissionsCsv}>
                  <Download size={14} /> Export CSV
                </Button>
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer size={14} /> Print
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setSubmissionsQuizId(null)} aria-label="Close">
                  <X size={18} />
                </Button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3 print:hidden">
              <div className="relative flex-1 min-w-[180px]">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  className="pl-9"
                  placeholder="Search by student name"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select
                className={`${selectClass} w-auto`}
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="all">All statuses</option>
                <option value="submitted">Awaiting grading</option>
                <option value="graded">Graded</option>
              </select>
            </div>

            <div className="mt-4">
              {filteredSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <ClipboardList size={40} className="text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No submissions match your filters yet.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Grade</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Flags</TableHead>
                      <TableHead className="text-right print:hidden">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubmissions.map(a => {
                      const pct = a.maxScore > 0 ? Math.round(((a.totalScore || 0) / a.maxScore) * 100) : 0;
                      const tabs = a.flags?.tabSwitches ?? 0;
                      const mins = a.timeTakenSec != null
                        ? `${Math.floor(a.timeTakenSec / 60)}m ${a.timeTakenSec % 60}s`
                        : '—';
                      const hasShort = (submissionsQuiz.questions || []).some(q => q.type === 'short');
                      return (
                        <TableRow key={a.id}>
                          <TableCell className="font-medium text-foreground">{a.studentName}</TableCell>
                          <TableCell className="tabular-nums">{a.totalScore ?? 0}/{a.maxScore}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={`tabular-nums ${
                                pct >= 70 ? 'bg-success/10 text-success border-transparent'
                                  : pct >= 50 ? 'bg-warning/10 text-warning border-transparent'
                                    : 'bg-destructive/10 text-destructive border-transparent'
                              }`}
                            >
                              {pct}%
                            </Badge>
                          </TableCell>
                          <TableCell className="tabular-nums text-muted-foreground">{mins}</TableCell>
                          <TableCell className="text-muted-foreground">
                            {a.submittedAt ? new Date(a.submittedAt).toLocaleString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={a.status === 'graded'
                                ? 'bg-success/10 text-success border-transparent'
                                : 'bg-info/10 text-info border-transparent'}
                            >
                              {a.status === 'graded' ? 'Graded' : 'Submitted'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {tabs > 0 ? (
                              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive tabular-nums">
                                <AlertTriangle size={13} strokeWidth={1.5} /> {tabs}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right print:hidden">
                            {hasShort && (
                              <Button variant="outline" size="sm" onClick={() => openGrading(a)}>
                                <FileText size={14} /> Grade
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── SHORT-ANSWER GRADING MODAL ─────────────────────────────────── */}
      {gradingAttempt && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setGradingAttemptId(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <div>
                <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                  <FileText size={18} className="text-muted-foreground" strokeWidth={1.5} />
                  Grade short answers
                </h3>
                <p className="text-xs text-muted-foreground">{gradingAttempt.studentName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setGradingAttemptId(null)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {gradingShortQuestions.length === 0 ? (
                <p className="text-sm text-muted-foreground">This quiz has no short-answer questions.</p>
              ) : (
                gradingShortQuestions.map((q, idx) => {
                  const answer = gradingAttempt.answers?.[q.id];
                  return (
                    <div key={q.id} className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-medium text-foreground">
                          {idx + 1}. {q.text}
                        </p>
                        <Badge variant="outline" className="shrink-0 tabular-nums">{q.marks} marks</Badge>
                      </div>
                      <div className="rounded-md border border-border bg-card p-3">
                        <p className="text-xs font-medium text-muted-foreground">Student answer</p>
                        <p className="mt-1 text-sm text-foreground whitespace-pre-wrap">
                          {answer ? String(answer) : <span className="text-muted-foreground">No answer provided.</span>}
                        </p>
                      </div>
                      {q.correct && (
                        <p className="text-xs text-muted-foreground">
                          <span className="font-medium">Model answer:</span> {q.correct}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Label htmlFor={`grade-${q.id}`} className="text-xs text-muted-foreground">
                          Award marks (0–{q.marks})
                        </Label>
                        <Input
                          id={`grade-${q.id}`}
                          type="number" min={0} max={q.marks}
                          className="h-9 w-24"
                          value={shortMarks[q.id] ?? ''}
                          onChange={e => setShortMarks(m => ({ ...m, [q.id]: e.target.value }))}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 border-t border-border pt-4">
              <Button variant="outline" onClick={() => setGradingAttemptId(null)}>Cancel</Button>
              <Button onClick={saveGrading} disabled={gradingShortQuestions.length === 0}>
                Save grades
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
