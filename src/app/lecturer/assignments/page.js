"use client";

import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import {
  ClipboardList, Plus, CheckCircle2, Clock, Eye, Star, MessageSquare,
  Download, Pencil, Trash2, Send, CalendarClock, Lock, FileText,
  Link2, AlertTriangle, Users, Printer, FileDown, ArrowLeft, X,
} from 'lucide-react';
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
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const FORMAT_OPTIONS = [
  { value: 'pdf', label: 'PDF (.pdf)' },
  { value: 'docx', label: 'Word (.docx)' },
  { value: 'pptx', label: 'PowerPoint (.pptx)' },
  { value: 'zip', label: 'Archive (.zip)' },
  { value: 'image', label: 'Image (.png/.jpg)' },
];

const MAX_FILE_BYTES = 1024 * 1024; // 1MB hard cap (localStorage budget)

// datetime-local string -> ISO (or '' if blank)
const localToISO = (v) => (v ? new Date(v).toISOString() : '');
// ISO -> value for <input type="datetime-local"> (local time, no seconds)
const isoToLocal = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const fmtDateTime = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '—' : d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

const csvCell = (v) => {
  const s = String(v ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

const emptyForm = () => ({
  courseId: '',
  title: '',
  instructions: '',
  startAt: '',
  dueDate: '',
  totalMarks: 100,
  allowedFormats: ['pdf', 'docx'],
  maxFileSizeMB: 5,
  attachment: null,
  attachmentLink: '',
  rubric: '',
  rubricVisible: false,
});

const statusTint = {
  active: 'bg-success/10 text-success',
  upcoming: 'bg-info/10 text-info',
  closed: 'bg-muted text-muted-foreground',
};

export default function LecturerAssignments() {
  const {
    user, courses, assignments, getAllUsers,
    addAssignment, updateAssignment, deleteAssignment, publishAssignment,
    gradeSubmission, getAssignmentSubmissions, getAssignmentStatus,
    extendAssignmentDeadline, extendStudentDeadline, getStudentCourseIds,
    getLecturerRegisteredCourses,
  } = useStore();

  const myCourses = getLecturerRegisteredCourses(user?.id);
  const myAssignments = useMemo(
    () => assignments.filter(a => (a.lecturerId ?? a.createdBy) === user?.id),
    [assignments, user?.id]
  );

  const [tab, setTab] = useState('list'); // 'list' | 'editor' | 'submissions'
  const [editingId, setEditingId] = useState(null); // assignment id when editing, null when creating
  const [form, setForm] = useState(emptyForm());
  const [fileError, setFileError] = useState('');

  const [dashId, setDashId] = useState(null); // assignment id for submissions dashboard

  // Grade dialog
  const [grading, setGrading] = useState(null); // submission
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  // Deadline-extension dialogs
  const [extendGlobal, setExtendGlobal] = useState(null); // assignment
  const [extendGlobalVal, setExtendGlobalVal] = useState('');
  const [extendStudent, setExtendStudent] = useState(null); // { assignment, student }
  const [extendStudentVal, setExtendStudentVal] = useState('');

  const [confirmDelete, setConfirmDelete] = useState(null); // assignment

  const courseById = useMemo(() => {
    const m = {};
    courses.forEach(c => { m[c.id] = c; });
    return m;
  }, [courses]);

  // ── Enrolled students for a course (matric/dept/level via getAllUsers) ──
  const enrolledStudents = (courseId) =>
    getAllUsers().filter(
      u => u.role === 'student' && getStudentCourseIds(u).some(id => String(id) === String(courseId))
    );

  // ─────────────────────────── Editor ───────────────────────────
  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm());
    setFileError('');
    setTab('editor');
  };

  const openEdit = (a) => {
    setEditingId(a.id);
    setForm({
      courseId: String(a.courseId ?? ''),
      title: a.title ?? '',
      instructions: a.instructions ?? a.description ?? '',
      startAt: isoToLocal(a.startAt),
      dueDate: isoToLocal(a.dueDate),
      totalMarks: a.totalMarks ?? a.maxScore ?? 100,
      allowedFormats: Array.isArray(a.allowedFormats) ? a.allowedFormats : ['pdf', 'docx'],
      maxFileSizeMB: a.maxFileSizeMB ?? 5,
      attachment: a.attachment && a.attachment.data ? a.attachment : null,
      attachmentLink: a.attachment && a.attachment.url ? a.attachment.url : '',
      rubric: a.rubric ?? '',
      rubricVisible: !!a.rubricVisible,
    });
    setFileError('');
    setTab('editor');
  };

  // Once submissions exist, an existing assignment locks to deadline-only edits.
  const editLocked = editingId != null && getAssignmentSubmissions(editingId).length > 0;

  const toggleFormat = (value) => {
    setForm((f) => ({
      ...f,
      allowedFormats: f.allowedFormats.includes(value)
        ? f.allowedFormats.filter(v => v !== value)
        : [...f.allowedFormats, value],
    }));
  };

  const handleFile = (e) => {
    setFileError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File is larger than 1MB. Use a smaller file or paste a link instead.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((f) => ({ ...f, attachment: { name: file.name, type: file.type, data: reader.result }, attachmentLink: '' }));
    };
    reader.readAsDataURL(file);
  };

  // Build the canonical payload shared by save-draft and publish.
  const buildPayload = () => {
    let attachment = null;
    if (form.attachment?.data) attachment = form.attachment;
    else if (form.attachmentLink.trim()) {
      attachment = { name: form.attachmentLink.trim(), type: 'link', url: form.attachmentLink.trim() };
    }
    return {
      courseId: form.courseId ? parseInt(form.courseId, 10) : '',
      title: form.title.trim(),
      instructions: form.instructions,
      startAt: localToISO(form.startAt) || new Date().toISOString(),
      dueDate: localToISO(form.dueDate),
      totalMarks: parseInt(form.totalMarks, 10) || 0,
      allowedFormats: form.allowedFormats.length ? form.allowedFormats : ['pdf'],
      maxFileSizeMB: parseInt(form.maxFileSizeMB, 10) || 1,
      attachment,
      rubric: form.rubric.trim() || null,
      rubricVisible: form.rubricVisible,
    };
  };

  const validate = () => {
    if (!form.courseId) return 'Choose a course.';
    if (!form.title.trim()) return 'Give the assignment a title.';
    if (!form.dueDate) return 'Set a due date.';
    if (form.startAt && form.dueDate && new Date(form.startAt) >= new Date(form.dueDate)) {
      return 'The due date must be after the start date.';
    }
    return '';
  };

  // Persist the editor. `publish` => also flip status to active.
  const handleSave = (publish) => {
    if (editLocked) {
      // Deadline-only patch when locked.
      updateAssignment(editingId, { dueDate: localToISO(form.dueDate) });
      if (publish) publishAssignment(editingId);
      setTab('list');
      return;
    }
    const err = validate();
    if (err) { setFileError(err); return; }

    const payload = buildPayload();
    let id = editingId;
    if (editingId == null) {
      const created = addAssignment(payload);
      id = created?.id;
    } else {
      updateAssignment(editingId, payload);
    }
    if (publish && id != null) publishAssignment(id);
    setEditingId(null);
    setForm(emptyForm());
    setTab('list');
  };

  // ─────────────────────────── Grading ───────────────────────────
  const openGrade = (sub) => {
    setGrading(sub);
    setGradeForm({
      score: sub.score === null || sub.score === undefined ? '' : String(sub.score),
      feedback: sub.feedback ?? '',
    });
  };
  const submitGrade = (e) => {
    e.preventDefault();
    gradeSubmission(grading.id, parseInt(gradeForm.score, 10), gradeForm.feedback);
    setGrading(null);
  };

  // ─────────────────────────── Deadline extensions ───────────────────────────
  const openExtendGlobal = (a) => { setExtendGlobal(a); setExtendGlobalVal(isoToLocal(a.dueDate)); };
  const saveExtendGlobal = () => {
    if (extendGlobalVal) extendAssignmentDeadline(extendGlobal.id, localToISO(extendGlobalVal));
    setExtendGlobal(null);
  };
  const openExtendStudent = (assignment, student) => {
    setExtendStudent({ assignment, student });
    setExtendStudentVal(isoToLocal(assignment.extensions?.[student.id] || assignment.dueDate));
  };
  const saveExtendStudent = () => {
    if (extendStudentVal) extendStudentDeadline(extendStudent.assignment.id, extendStudent.student.id, localToISO(extendStudentVal));
    setExtendStudent(null);
  };

  // ─────────────────────────── Report (CSV + Print) ───────────────────────────
  const buildReportRows = (assignment) => {
    const subs = getAssignmentSubmissions(assignment.id);
    const subByStudent = {};
    subs.forEach(s => { subByStudent[s.studentId] = s; });
    return enrolledStudents(assignment.courseId).map((s, i) => {
      const sub = subByStudent[s.id];
      return {
        sn: i + 1,
        matric: s.matNo || s.matricNo || s.id || '—',
        name: s.name || '—',
        dept: s.program || s.department || '—',
        level: s.level || '—',
        submitted: sub ? 'Yes' : 'No',
        time: sub ? fmtDateTime(sub.submittedAt) : '—',
        score: sub && sub.score !== null && sub.score !== undefined ? `${sub.score}/${assignment.totalMarks ?? assignment.maxScore}` : '—',
      };
    });
  };

  const downloadCSV = (assignment) => {
    const course = courseById[assignment.courseId];
    const header = ['S/N', 'Matric', 'Name', 'Dept', 'Level', 'Submitted', 'Submission time', 'Score'];
    const rows = buildReportRows(assignment).map(r => [r.sn, r.matric, r.name, r.dept, r.level, r.submitted, r.time, r.score]);
    const csv = [header, ...rows].map(row => row.map(csvCell).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(course?.code || 'assignment').replace(/\s+/g, '_')}_${(assignment.title || 'report').replace(/\s+/g, '_')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const printReport = (assignment) => {
    const course = courseById[assignment.courseId];
    const rows = buildReportRows(assignment);
    const bodyRows = rows.map(r => `<tr>
        <td>${r.sn}</td><td>${r.matric}</td><td>${r.name}</td><td>${r.dept}</td>
        <td>${r.level}</td><td>${r.submitted}</td><td>${r.time}</td><td>${r.score}</td>
      </tr>`).join('');
    const submittedCount = rows.filter(r => r.submitted === 'Yes').length;
    const html = `<!doctype html><html><head><meta charset="utf-8" />
      <title>${course?.code || ''} — ${assignment.title || 'Report'}</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;color:#1f2933;margin:32px;}
        h1{font-size:18px;margin:0 0 2px;} h2{font-size:14px;font-weight:normal;color:#52606d;margin:0 0 16px;}
        .meta{font-size:12px;color:#52606d;margin-bottom:16px;}
        table{border-collapse:collapse;width:100%;font-size:12px;}
        th,td{border:1px solid #cbd2d9;padding:6px 8px;text-align:left;}
        th{background:#f0f4f8;}
      </style></head><body>
      <h1>Mountain Top University</h1>
      <h2>Submission report — ${assignment.title || ''} (${course?.code || ''})</h2>
      <div class="meta">Lecturer: ${user?.name || ''} &nbsp;|&nbsp; Due: ${fmtDateTime(assignment.dueDate)} &nbsp;|&nbsp; Submitted: ${submittedCount}/${rows.length}</div>
      <table><thead><tr>
        <th>S/N</th><th>Matric</th><th>Name</th><th>Dept</th><th>Level</th><th>Submitted</th><th>Submission time</th><th>Score</th>
      </tr></thead><tbody>${bodyRows}</tbody></table>
      </body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  // ─────────────────────────── Derived counts ───────────────────────────
  const dashAssignment = dashId != null ? myAssignments.find(a => a.id === dashId) : null;

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Assignments
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Create and publish assignments, track submissions, and grade your students.
          </p>
        </div>
        {tab === 'list' && (
          <Button onClick={openCreate} className="active:translate-y-px">
            <Plus size={16} /> New assignment
          </Button>
        )}
        {tab !== 'list' && (
          <Button variant="outline" onClick={() => { setTab('list'); setDashId(null); }}>
            <ArrowLeft size={16} /> Back to assignments
          </Button>
        )}
      </header>

      {/* ═══════════════════════ TAB 1 — MY ASSIGNMENTS ═══════════════════════ */}
      {tab === 'list' && (
        <section className="flex flex-col gap-4">
          {myAssignments.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-12 text-center">
              <ClipboardList size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">You haven&apos;t created any assignments yet.</p>
              <Button onClick={openCreate} className="active:translate-y-px">
                <Plus size={16} /> New assignment
              </Button>
            </div>
          ) : (
            myAssignments.map((a) => {
              const course = courseById[a.courseId];
              const subs = getAssignmentSubmissions(a.id);
              const locked = subs.length > 0;
              const status = a.status === 'draft' ? 'draft' : getAssignmentStatus(a, null);
              const ungraded = subs.filter(s => s.score === null || s.score === undefined).length;
              return (
                <article
                  key={a.id}
                  className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm transition-colors hover:border-primary/40 sm:flex-row sm:items-start sm:justify-between"
                >
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span
                      className="mt-1.5 h-3 w-3 shrink-0 rounded-full"
                      style={{ background: course?.color }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-medium">{course?.code || 'Course'}</Badge>
                        {a.status === 'draft' ? (
                          <Badge variant="outline" className="border-transparent bg-muted text-muted-foreground capitalize">Draft</Badge>
                        ) : (
                          <Badge variant="outline" className={`border-transparent capitalize ${statusTint[status] || statusTint.closed}`}>
                            {status}
                          </Badge>
                        )}
                        {locked && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Lock size={12} /> Locked to deadline edits
                          </span>
                        )}
                      </div>
                      <h2 className="font-sans text-base font-semibold text-foreground">{a.title}</h2>
                      {(a.instructions || a.description) && (
                        <p className="text-sm leading-relaxed text-muted-foreground text-pretty line-clamp-2">
                          {(a.instructions || a.description).slice(0, 160)}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock size={13} /> Due {fmtDateTime(a.dueDate)}
                        </span>
                        <span className="tabular-nums">Max {a.totalMarks ?? a.maxScore} pts</span>
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <Users size={13} /> {subs.length} submission{subs.length !== 1 ? 's' : ''}
                        </span>
                        {ungraded > 0 && (
                          <span className="tabular-nums font-medium text-warning">{ungraded} to grade</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setDashId(a.id); setTab('submissions'); }}
                    >
                      <Eye size={14} /> Submissions
                    </Button>
                    {a.status === 'draft' && (
                      <Button size="sm" onClick={() => publishAssignment(a.id)} className="active:translate-y-px">
                        <Send size={14} /> Publish
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => openEdit(a)}>
                      <Pencil size={14} /> Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => openExtendGlobal(a)}>
                      <CalendarClock size={14} /> Extend
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive"
                      onClick={() => setConfirmDelete(a)}
                    >
                      <Trash2 size={14} /> Delete
                    </Button>
                  </div>
                </article>
              );
            })
          )}
        </section>
      )}

      {/* ═══════════════════════ TAB 2 — CREATE / EDIT ═══════════════════════ */}
      {tab === 'editor' && (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ClipboardList size={18} className="text-muted-foreground" strokeWidth={1.5} />
            <h2 className="text-lg font-semibold text-foreground">
              {editingId == null ? 'Create assignment' : 'Edit assignment'}
            </h2>
          </div>

          {editLocked && (
            <div className="mb-5 flex items-start gap-2 rounded-xl border border-border bg-warning/10 p-3 text-sm text-warning">
              <Lock size={16} className="mt-0.5 shrink-0" />
              <p>
                Students have already submitted. To protect fairness, only the due date can be changed now.
              </p>
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="courseId">Course</Label>
                <select
                  id="courseId"
                  disabled={editLocked}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                >
                  <option value="">Select course…</option>
                  {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="totalMarks">Total marks</Label>
                <Input
                  id="totalMarks"
                  type="number"
                  min={1}
                  max={1000}
                  disabled={editLocked}
                  className="h-10 tabular-nums"
                  value={form.totalMarks}
                  onChange={(e) => setForm({ ...form, totalMarks: e.target.value })}
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                type="text"
                disabled={editLocked}
                className="h-10"
                placeholder="e.g. Mid-semester project"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                rows={4}
                disabled={editLocked}
                placeholder="Detailed instructions for students…"
                value={form.instructions}
                onChange={(e) => setForm({ ...form, instructions: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="startAt">Opens (start)</Label>
                <Input
                  id="startAt"
                  type="datetime-local"
                  disabled={editLocked}
                  className="h-10"
                  value={form.startAt}
                  onChange={(e) => setForm({ ...form, startAt: e.target.value })}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="dueDate">Due date</Label>
                <Input
                  id="dueDate"
                  type="datetime-local"
                  className="h-10"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>
            </div>

            {/* Allowed formats */}
            <fieldset className="flex flex-col gap-2" disabled={editLocked}>
              <legend className="mb-1 text-sm font-medium text-foreground">Allowed submission formats</legend>
              <div className="flex flex-wrap gap-2">
                {FORMAT_OPTIONS.map((opt) => {
                  const on = form.allowedFormats.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => toggleFormat(opt.value)}
                      className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                        on
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-transparent text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      {on ? <CheckCircle2 size={14} className="text-primary" /> : <span className="h-3.5 w-3.5 rounded-[3px] border border-current" />}
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <div className="flex flex-col gap-1.5 sm:max-w-[12rem]">
              <Label htmlFor="maxFileSizeMB">Max file size (MB)</Label>
              <Input
                id="maxFileSizeMB"
                type="number"
                min={1}
                max={50}
                disabled={editLocked}
                className="h-10 tabular-nums"
                value={form.maxFileSizeMB}
                onChange={(e) => setForm({ ...form, maxFileSizeMB: e.target.value })}
              />
            </div>

            {/* Reference document */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4">
              <Label className="flex items-center gap-1.5">
                <FileText size={15} className="text-muted-foreground" /> Reference document (optional)
              </Label>
              <p className="text-xs text-muted-foreground">Upload a small file (under 1MB) or paste a link.</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Input
                  type="file"
                  disabled={editLocked}
                  className="cursor-pointer file:font-medium file:text-foreground"
                  onChange={handleFile}
                />
                <div className="relative">
                  <Link2 size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="url"
                    disabled={editLocked || !!form.attachment}
                    placeholder="https://…"
                    className="h-10 pl-9"
                    value={form.attachmentLink}
                    onChange={(e) => setForm({ ...form, attachmentLink: e.target.value, attachment: null })}
                  />
                </div>
              </div>
              {form.attachment && (
                <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-card px-2.5 py-1 text-xs font-medium text-foreground">
                  <FileText size={13} /> {form.attachment.name}
                  <button type="button" onClick={() => setForm({ ...form, attachment: null })} aria-label="Remove file">
                    <X size={13} className="text-muted-foreground hover:text-destructive" />
                  </button>
                </span>
              )}
            </div>

            {/* Rubric */}
            <div className="flex flex-col gap-2 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-center justify-between gap-3">
                <Label htmlFor="rubric" className="flex items-center gap-1.5">
                  <Star size={15} className="text-gold" /> Grading rubric (optional)
                </Label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={form.rubricVisible}
                  disabled={editLocked}
                  onClick={() => setForm({ ...form, rubricVisible: !form.rubricVisible })}
                  className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60 ${
                    form.rubricVisible ? 'bg-primary' : 'bg-muted-foreground/40'
                  }`}
                >
                  <span className={`block h-5 w-5 rounded-full bg-background shadow-sm transition-transform ${form.rubricVisible ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  <span className="sr-only">Show rubric to students</span>
                </button>
              </div>
              <Textarea
                id="rubric"
                rows={3}
                disabled={editLocked}
                placeholder="How marks are awarded…"
                value={form.rubric}
                onChange={(e) => setForm({ ...form, rubric: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                {form.rubricVisible ? 'Visible to students.' : 'Hidden from students.'}
              </p>
            </div>

            {fileError && (
              <p className="flex items-center gap-1.5 text-sm text-destructive">
                <AlertTriangle size={15} /> {fileError}
              </p>
            )}

            <div className="mt-2 flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => { setTab('list'); setEditingId(null); }}>
                Cancel
              </Button>
              {!editLocked && (
                <Button type="button" variant="secondary" onClick={() => handleSave(false)}>
                  Save draft
                </Button>
              )}
              <Button type="button" className="active:translate-y-px" onClick={() => handleSave(true)}>
                <Send size={16} /> {editLocked ? 'Save changes' : 'Save & publish'}
              </Button>
            </div>
          </form>
        </section>
      )}

      {/* ═══════════════════════ TAB 3 — SUBMISSIONS DASHBOARD ═══════════════════════ */}
      {tab === 'submissions' && dashAssignment && (
        <SubmissionsDashboard
          assignment={dashAssignment}
          course={courseById[dashAssignment.courseId]}
          submissions={getAssignmentSubmissions(dashAssignment.id)}
          students={enrolledStudents(dashAssignment.courseId)}
          onGrade={openGrade}
          onExtendStudent={openExtendStudent}
          onCSV={() => downloadCSV(dashAssignment)}
          onPrint={() => printReport(dashAssignment)}
        />
      )}

      {/* ─────────── Grade dialog ─────────── */}
      <Dialog open={!!grading} onOpenChange={(o) => { if (!o) setGrading(null); }}>
        <DialogContent className="sm:rounded-xl">
          {grading && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Star size={18} className="text-gold" strokeWidth={1.5} />
                  Grade — {grading.studentName}
                </DialogTitle>
              </DialogHeader>
              <div className="rounded-xl border border-border bg-muted/50 p-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Student&apos;s answer</p>
                {grading.answerText || grading.content ? (
                  <p className="mb-3 text-sm leading-relaxed text-foreground text-pretty">{grading.answerText || grading.content}</p>
                ) : (
                  <p className="mb-3 text-sm italic text-muted-foreground">No text provided.</p>
                )}
                {(grading.file || grading.attachment) && (
                  <Button variant="secondary" size="sm" asChild>
                    <a
                      href={(grading.file || grading.attachment).url || (grading.file || grading.attachment).data}
                      download={(grading.file || grading.attachment).type === 'link' ? undefined : (grading.file || grading.attachment).name}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center"
                    >
                      <Download size={14} className="mr-1.5" />
                      {(grading.file || grading.attachment).name}
                    </a>
                  </Button>
                )}
              </div>
              <form onSubmit={submitGrade} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="score">
                    Score
                    <span className="ml-1 font-normal text-muted-foreground">
                      (max {dashAssignment?.totalMarks ?? dashAssignment?.maxScore})
                    </span>
                  </Label>
                  <Input
                    id="score"
                    type="number"
                    min={0}
                    max={dashAssignment?.totalMarks ?? dashAssignment?.maxScore}
                    className="h-10 tabular-nums"
                    value={gradeForm.score}
                    onChange={(e) => setGradeForm({ ...gradeForm, score: e.target.value })}
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    rows={3}
                    placeholder="Comments to help the student improve…"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                  />
                </div>
                <DialogFooter className="gap-2 sm:gap-2">
                  <Button type="button" variant="outline" onClick={() => setGrading(null)}>Cancel</Button>
                  <Button type="submit" className="active:translate-y-px"><CheckCircle2 size={16} /> Submit grade</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────── Extend global deadline ─────────── */}
      <Dialog open={!!extendGlobal} onOpenChange={(o) => { if (!o) setExtendGlobal(null); }}>
        <DialogContent className="sm:rounded-xl">
          {extendGlobal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarClock size={18} className="text-muted-foreground" strokeWidth={1.5} />
                  Extend deadline
                </DialogTitle>
                <DialogDescription>
                  Sets a new due date for everyone on {extendGlobal.title}.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="extendGlobalVal">New due date</Label>
                <Input
                  id="extendGlobalVal"
                  type="datetime-local"
                  className="h-10"
                  value={extendGlobalVal}
                  onChange={(e) => setExtendGlobalVal(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setExtendGlobal(null)}>Cancel</Button>
                <Button type="button" className="active:translate-y-px" onClick={saveExtendGlobal}>Save deadline</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────── Extend per-student deadline ─────────── */}
      <Dialog open={!!extendStudent} onOpenChange={(o) => { if (!o) setExtendStudent(null); }}>
        <DialogContent className="sm:rounded-xl">
          {extendStudent && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CalendarClock size={18} className="text-muted-foreground" strokeWidth={1.5} />
                  Extend for {extendStudent.student.name}
                </DialogTitle>
                <DialogDescription>
                  A per-student override on {extendStudent.assignment.title}. Others keep the original deadline.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="extendStudentVal">New due date for this student</Label>
                <Input
                  id="extendStudentVal"
                  type="datetime-local"
                  className="h-10"
                  value={extendStudentVal}
                  onChange={(e) => setExtendStudentVal(e.target.value)}
                />
              </div>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setExtendStudent(null)}>Cancel</Button>
                <Button type="button" className="active:translate-y-px" onClick={saveExtendStudent}>Save override</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ─────────── Confirm delete ─────────── */}
      <Dialog open={!!confirmDelete} onOpenChange={(o) => { if (!o) setConfirmDelete(null); }}>
        <DialogContent className="sm:rounded-xl">
          {confirmDelete && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trash2 size={18} className="text-destructive" strokeWidth={1.5} />
                  Delete assignment
                </DialogTitle>
                <DialogDescription>
                  This permanently removes &quot;{confirmDelete.title}&quot; and all its submissions. This can&apos;t be undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="gap-2 sm:gap-2">
                <Button type="button" variant="outline" onClick={() => setConfirmDelete(null)}>Cancel</Button>
                <Button
                  type="button"
                  variant="destructive"
                  className="active:translate-y-px"
                  onClick={() => {
                    deleteAssignment(confirmDelete.id);
                    if (dashId === confirmDelete.id) { setDashId(null); setTab('list'); }
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ════════════════════════ SUBMISSIONS DASHBOARD ════════════════════════
function SubmissionsDashboard({ assignment, course, submissions, students, onGrade, onExtendStudent, onCSV, onPrint }) {
  const max = assignment.totalMarks ?? assignment.maxScore;
  const subByStudent = useMemo(() => {
    const m = {};
    submissions.forEach(s => { m[s.studentId] = s; });
    return m;
  }, [submissions]);

  const submittedCount = students.filter(s => subByStudent[s.id]).length;
  const gradedCount = submissions.filter(s => s.score !== null && s.score !== undefined).length;
  const missing = students.filter(s => !subByStudent[s.id]);

  return (
    <section className="flex flex-col gap-5">
      {/* Header card */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 shadow-sm sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="font-medium">{course?.code || 'Course'}</Badge>
            <Badge variant="outline" className="border-transparent bg-info/10 text-info">Due {fmtDateTime(assignment.dueDate)}</Badge>
          </div>
          <h2 className="font-sans text-lg font-semibold text-foreground">{assignment.title}</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="tabular-nums">{students.length} enrolled</span>
            <span className="tabular-nums text-success">{submittedCount} submitted</span>
            <span className="tabular-nums">{gradedCount} graded</span>
            <span className="tabular-nums text-warning">{missing.length} missing</span>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onCSV}>
            <FileDown size={14} /> Export CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer size={14} /> Print report
          </Button>
        </div>
      </div>

      {/* Roster table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Student</th>
                <th className="px-4 py-3">Matric</th>
                <th className="px-4 py-3">Submitted</th>
                <th className="px-4 py-3">File</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Score</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted-foreground">
                    No students are enrolled in this course yet.
                  </td>
                </tr>
              ) : (
                students.map((s) => {
                  const sub = subByStudent[s.id];
                  const file = sub && (sub.file || sub.attachment);
                  const graded = sub && sub.score !== null && sub.score !== undefined;
                  const override = assignment.extensions?.[s.id];
                  return (
                    <tr key={s.id} className="border-b border-border last:border-0 transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                            {s.name?.charAt(0)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-foreground">{s.name}</p>
                            <p className="truncate text-xs text-muted-foreground">{s.program || s.department || '—'} · {s.level || '—'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 tabular-nums text-muted-foreground">{s.matNo || s.matricNo || '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {sub ? fmtDateTime(sub.submittedAt) : <span className="italic">Not submitted</span>}
                        {override && (
                          <span className="mt-0.5 flex items-center gap-1 text-[11px] text-info">
                            <CalendarClock size={11} /> Ext. {fmtDateTime(override)}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {file ? (
                          <a
                            href={file.url || file.data}
                            download={file.type === 'link' ? undefined : file.name}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-medium text-foreground hover:text-primary"
                          >
                            <Download size={13} /> {file.type === 'link' ? 'Open link' : 'Download'}
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {!sub ? (
                          <Badge variant="outline" className="border-transparent bg-warning/10 text-warning">Missing</Badge>
                        ) : graded ? (
                          <Badge variant="outline" className="border-transparent bg-success/10 text-success">Graded</Badge>
                        ) : (
                          <Badge variant="outline" className="border-transparent bg-info/10 text-info">Submitted</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {graded ? <span className="font-semibold text-success">{sub.score}/{max}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          {sub && (
                            <Button size="sm" variant={graded ? 'ghost' : 'default'} className="active:translate-y-px" onClick={() => onGrade(sub)}>
                              {graded ? <><MessageSquare size={13} /> Review</> : <><Star size={13} /> Grade</>}
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => onExtendStudent(assignment, s)} title="Extend this student's deadline">
                            <CalendarClock size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Not-submitted summary */}
      {missing.length > 0 && (
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertTriangle size={15} className="text-warning" /> Yet to submit ({missing.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {missing.map((s) => (
              <span key={s.id} className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                {s.name} <span className="tabular-nums opacity-70">{s.matNo || s.matricNo || ''}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
