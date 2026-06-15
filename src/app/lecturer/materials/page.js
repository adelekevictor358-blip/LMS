"use client";

import { useStore } from '@/store/useStore';
import { useState, useMemo, useRef } from 'react';
import {
  Upload, Trash2, FileText, Link2, Plus, BookOpen, Layers, MonitorPlay,
  ExternalLink, ClipboardList, Eye, EyeOff, Pencil, HardDrive, X, FileQuestion,
  CheckCircle2, GraduationCap,
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

// ─── Constants ───────────────────────────────────────────────────────────
const MAX_BYTES = 1024 * 1024; // hard 1MB cap — localStorage is ~5MB for the whole app
const STORAGE_BUDGET = 5 * 1024 * 1024;

const MATERIAL_TYPES = [
  { value: 'note', label: 'Note' },
  { value: 'slide', label: 'Slide' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'reference', label: 'Reference' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Other' },
];

const TYPE_ICONS = {
  note: FileText,
  slide: Layers,
  assignment: ClipboardList,
  reference: BookOpen,
  video: MonitorPlay,
  other: Link2,
};

const SELECT_CLASS =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

const formatBytes = (bytes) => {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

// A small token-compliant on/off control (avoids off-system primitive colors).
function ToggleSwitch({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full border border-border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background ${checked ? 'bg-primary' : 'bg-muted'}`}
    >
      <span
        className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-background shadow-sm transition-transform ${checked ? 'translate-x-4' : 'translate-x-1'}`}
      />
    </button>
  );
}

// ─── Empty material / past-question source state ─────────────────────────
const emptyMaterial = {
  courseId: '', title: '', description: '', week: '', type: 'note',
  source: 'link', url: '', fileData: null, fileName: null, fileSize: null,
};

const emptyPastQuestion = {
  courseCode: '', courseTitle: '', year: String(new Date().getFullYear()),
  semester: '1st', examType: 'final',
  source: 'link', url: '', fileData: null, fileName: null, fileSize: null,
  asSource: 'none', answerSchemeUrl: '', answerSchemeData: null,
  answerSchemeName: null, answerSchemeSize: null, answerSchemeVisible: false,
};

export default function LecturerMaterials() {
  const user = useStore(s => s.user);
  const courses = useStore(s => s.courses);
  const materials = useStore(s => s.materials);
  const pastQuestions = useStore(s => s.pastQuestions);
  const addMaterial = useStore(s => s.addMaterial);
  const updateMaterial = useStore(s => s.updateMaterial);
  const deleteMaterial = useStore(s => s.deleteMaterial);
  const toggleMaterialVisibility = useStore(s => s.toggleMaterialVisibility);
  const getLecturerStorageUsage = useStore(s => s.getLecturerStorageUsage);
  const addPastQuestion = useStore(s => s.addPastQuestion);
  const updatePastQuestion = useStore(s => s.updatePastQuestion);
  const deletePastQuestion = useStore(s => s.deletePastQuestion);
  const togglePastQuestionVisibility = useStore(s => s.togglePastQuestionVisibility);
  const toggleAnswerSchemeVisibility = useStore(s => s.toggleAnswerSchemeVisibility);
  const getLecturerRegisteredCourses = useStore(s => s.getLecturerRegisteredCourses);

  const myCourses = getLecturerRegisteredCourses(user?.id) || [];

  const myMaterials = useMemo(
    () => materials.filter(m => (m.lecturerId ?? m.uploadedBy) === user?.id),
    [materials, user?.id]
  );
  const myPastQuestions = useMemo(
    () => pastQuestions
      .filter(p => p.uploadedBy === user?.id)
      .sort((a, b) => Date.parse(b.createdAt || 0) - Date.parse(a.createdAt || 0)),
    [pastQuestions, user?.id]
  );

  const storageUsed = getLecturerStorageUsage(user?.id) || 0;
  const storagePct = Math.min(100, Math.round((storageUsed / STORAGE_BUDGET) * 100));

  // ─── Materials grouped by course → week ───
  const groupedMaterials = useMemo(() => {
    const byCourse = {};
    for (const m of myMaterials) {
      const cid = m.courseId;
      if (!byCourse[cid]) byCourse[cid] = {};
      const week = (m.week || '').trim() || '__nolabel__';
      if (!byCourse[cid][week]) byCourse[cid][week] = [];
      byCourse[cid][week].push(m);
    }
    return byCourse;
  }, [myMaterials]);

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Library workspace
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            Share lecture materials and past questions with your students. Prefer an external link
            (YouTube, Google Drive). Small files are stored in this browser only.
          </p>
        </div>
        <StorageMeter used={storageUsed} pct={storagePct} />
      </header>

      <Tabs defaultValue="materials" className="space-y-6">
        <TabsList className="w-full sm:w-auto">
          <TabsTrigger value="materials" className="flex-1 sm:flex-none gap-2">
            <FileText className="h-4 w-4" strokeWidth={1.5} /> Materials
          </TabsTrigger>
          <TabsTrigger value="pastq" className="flex-1 sm:flex-none gap-2">
            <FileQuestion className="h-4 w-4" strokeWidth={1.5} /> Past questions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="materials">
          <MaterialsTab
            myCourses={myCourses}
            courses={courses}
            groupedMaterials={groupedMaterials}
            myMaterialsCount={myMaterials.length}
            addMaterial={addMaterial}
            updateMaterial={updateMaterial}
            deleteMaterial={deleteMaterial}
            toggleMaterialVisibility={toggleMaterialVisibility}
          />
        </TabsContent>

        <TabsContent value="pastq">
          <PastQuestionsTab
            myCourses={myCourses}
            myPastQuestions={myPastQuestions}
            addPastQuestion={addPastQuestion}
            updatePastQuestion={updatePastQuestion}
            deletePastQuestion={deletePastQuestion}
            togglePastQuestionVisibility={togglePastQuestionVisibility}
            toggleAnswerSchemeVisibility={toggleAnswerSchemeVisibility}
          />
        </TabsContent>
      </Tabs>
    </main>
  );
}

// ─── Storage meter ───────────────────────────────────────────────────────
function StorageMeter({ used, pct }) {
  const near = pct >= 80;
  return (
    <div className="w-full max-w-xs rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <HardDrive className="h-3.5 w-3.5" strokeWidth={1.5} /> Local storage used
        </span>
        <span className={`text-xs font-semibold tabular-nums ${near ? 'text-warning' : 'text-foreground'}`}>
          {formatBytes(used)}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all ${near ? 'bg-warning' : 'bg-primary'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Inline files share a ~5&nbsp;MB browser budget. Use links to avoid filling it.
      </p>
    </div>
  );
}

// ─── Shared file/link source picker (used by both forms) ─────────────────
function SourceField({
  idPrefix, source, onSourceChange, url, onUrlChange,
  fileName, fileSize, onFile, onClearFile, error, linkLabel, allowNone = false,
}) {
  const fileInputRef = useRef(null);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Source type">
        <Button
          type="button"
          size="sm"
          variant={source === 'link' ? 'default' : 'outline'}
          onClick={() => onSourceChange('link')}
        >
          <Link2 className="mr-1.5 h-3.5 w-3.5" /> External link
        </Button>
        <Button
          type="button"
          size="sm"
          variant={source === 'file' ? 'default' : 'outline'}
          onClick={() => onSourceChange('file')}
        >
          <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload file
        </Button>
        {allowNone && (
          <Button
            type="button"
            size="sm"
            variant={source === 'none' ? 'default' : 'outline'}
            onClick={() => onSourceChange('none')}
          >
            <X className="mr-1.5 h-3.5 w-3.5" /> None
          </Button>
        )}
      </div>

      {source === 'link' && (
        <div className="space-y-1.5">
          <Input
            id={`${idPrefix}-url`}
            type="url"
            inputMode="url"
            placeholder="https://drive.google.com/… or https://youtube.com/…"
            value={url}
            onChange={(e) => onUrlChange(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">{linkLabel}</p>
        </div>
      )}

      {source === 'file' && (
        <div className="space-y-2">
          <input
            ref={fileInputRef}
            type="file"
            id={`${idPrefix}-file`}
            className="hidden"
            onChange={onFile}
          />
          {fileName ? (
            <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2.5">
              <span className="flex min-w-0 items-center gap-2 text-sm text-foreground">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" strokeWidth={1.5} />
                <span className="truncate">{fileName}</span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {formatBytes(fileSize)}
                </span>
              </span>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onClearFile} aria-label="Remove file">
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <label
              htmlFor={`${idPrefix}-file`}
              className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-muted/40 p-6 transition-colors hover:border-primary/40 hover:bg-accent"
            >
              <Upload className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
              <p className="text-sm font-medium text-foreground">Choose a file (max 1 MB)</p>
              <p className="text-xs text-muted-foreground">Stored in this browser only</p>
            </label>
          )}
          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Materials tab ───────────────────────────────────────────────────────
function MaterialsTab({
  myCourses, courses, groupedMaterials, myMaterialsCount,
  addMaterial, updateMaterial, deleteMaterial, toggleMaterialVisibility,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null); // material id or null
  const [form, setForm] = useState(emptyMaterial);
  const [fileError, setFileError] = useState('');

  const courseById = (id) => courses.find(c => String(c.id) === String(id));

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyMaterial, courseId: myCourses[0] ? String(myCourses[0].id) : '' });
    setFileError('');
    setOpen(true);
  };

  const openEdit = (mat) => {
    setEditing(mat.id);
    setForm({
      courseId: String(mat.courseId),
      title: mat.title || '',
      description: mat.description || '',
      week: mat.week || '',
      type: mat.type || 'note',
      source: mat.fileData ? 'file' : 'link',
      url: mat.url || '',
      fileData: mat.fileData || null,
      fileName: mat.fileName || null,
      fileSize: mat.fileSize || null,
    });
    setFileError('');
    setOpen(true);
  };

  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setFileError(`That file is ${formatBytes(file.size)}. The limit is 1 MB — paste an external link instead.`);
      e.target.value = '';
      return;
    }
    setFileError('');
    const reader = new FileReader();
    reader.onload = () => {
      setForm(f => ({ ...f, fileData: reader.result, fileName: file.name, fileSize: file.size }));
    };
    reader.readAsDataURL(file);
  };

  const clearFile = () => setForm(f => ({ ...f, fileData: null, fileName: null, fileSize: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseId || !form.title.trim()) return;

    const payload = {
      courseId: form.courseId,
      title: form.title.trim(),
      description: form.description.trim(),
      week: form.week.trim(),
      type: form.type,
    };
    if (form.source === 'file' && form.fileData) {
      payload.url = null;
      payload.fileData = form.fileData;
      payload.fileName = form.fileName;
      payload.fileSize = form.fileSize;
    } else {
      payload.url = form.url.trim() || null;
      payload.fileData = null;
      payload.fileName = null;
      payload.fileSize = null;
    }

    if (editing) updateMaterial(editing, payload);
    else addMaterial(payload);

    setOpen(false);
    setEditing(null);
    setForm(emptyMaterial);
  };

  const courseIds = Object.keys(groupedMaterials);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{myMaterialsCount}</span>{' '}
          material{myMaterialsCount === 1 ? '' : 's'} across your courses
        </p>
        <Button className="active:translate-y-px" onClick={openCreate} disabled={myCourses.length === 0}>
          <Plus className="mr-2 h-4 w-4" /> Add material
        </Button>
      </div>

      {myCourses.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <GraduationCap className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-prose text-sm text-muted-foreground">
              You have no registered courses yet. Register for courses before adding materials.
            </p>
          </CardContent>
        </Card>
      )}

      {myCourses.length > 0 && courseIds.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileText className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-prose text-sm text-muted-foreground">
              No materials yet. Add your first note, slide deck, or reading to share it with students.
            </p>
            <Button className="active:translate-y-px" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add material
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-8">
        {courseIds.map(cid => {
          const course = courseById(cid);
          const weeks = groupedMaterials[cid];
          const weekKeys = Object.keys(weeks).sort((a, b) =>
            a === '__nolabel__' ? 1 : b === '__nolabel__' ? -1 : a.localeCompare(b, undefined, { numeric: true })
          );
          return (
            <section key={cid} className="space-y-4">
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: course?.color }}
                  aria-hidden="true"
                />
                <h2 className="text-lg font-semibold text-foreground">
                  {course ? `${course.code} — ${course.title}` : 'Course'}
                </h2>
              </div>

              {weekKeys.map(wk => (
                <div key={wk} className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {wk === '__nolabel__' ? 'No week / topic' : wk}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {weeks[wk].map(mat => (
                      <MaterialCard
                        key={mat.id}
                        mat={mat}
                        course={course}
                        onEdit={() => openEdit(mat)}
                        onDelete={() => deleteMaterial(mat.id)}
                        onToggle={() => toggleMaterialVisibility(mat.id)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </section>
          );
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-foreground">
              {editing ? 'Edit material' : 'Add material'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Share a resource with students enrolled in the selected course.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="mat-course">Course</Label>
                <select
                  id="mat-course"
                  className={SELECT_CLASS}
                  value={form.courseId}
                  onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                  required
                >
                  <option value="">Select a course</option>
                  {myCourses.map(c => (
                    <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mat-type">Type</Label>
                <select
                  id="mat-type"
                  className={SELECT_CLASS}
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  {MATERIAL_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat-title">Title</Label>
              <Input
                id="mat-title"
                placeholder="e.g. Neural network fundamentals"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat-week">Week / topic label (optional)</Label>
              <Input
                id="mat-week"
                placeholder="e.g. Week 4"
                value={form.week}
                onChange={(e) => setForm({ ...form, week: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Source</Label>
              <SourceField
                idPrefix="mat"
                source={form.source}
                onSourceChange={(s) => setForm({ ...form, source: s })}
                url={form.url}
                onUrlChange={(v) => setForm({ ...form, url: v })}
                fileName={form.fileName}
                fileSize={form.fileSize}
                onFile={handleFile}
                onClearFile={clearFile}
                error={fileError}
                linkLabel="Preferred: a YouTube, Google Drive, or other public link."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mat-desc">Description (optional)</Label>
              <Textarea
                id="mat-desc"
                placeholder="Briefly describe what this material covers."
                className="min-h-[80px] resize-none"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 active:translate-y-px">
                {editing ? 'Save changes' : 'Add material'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MaterialCard({ mat, course, onEdit, onDelete, onToggle }) {
  const Icon = TYPE_ICONS[mat.type] || Link2;
  const hidden = mat.visible === false;
  const href = mat.fileData || mat.url || null;
  return (
    <Card className={`flex flex-col transition-colors hover:border-primary/40 ${hidden ? 'opacity-70' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <Badge variant="secondary" className="capitalize">{mat.type}</Badge>
          {hidden ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <EyeOff className="h-3 w-3" /> Hidden
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-success">
              <Eye className="h-3 w-3" /> Visible
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-base font-semibold leading-tight text-foreground">{mat.title}</h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {mat.fileData ? formatBytes(mat.fileSize) : 'External link'}
            </span>
          </div>
        </div>
        {mat.description && (
          <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">{mat.description}</p>
        )}
        <Separator className="mt-auto" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onEdit} aria-label="Edit material">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onToggle} aria-label={hidden ? 'Show to students' : 'Hide from students'}>
              {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label="Delete material">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {href ? (
            <Button variant="outline" size="sm" asChild>
              <a href={href} target="_blank" rel="noreferrer">
                {mat.fileData ? 'Open' : 'Open link'}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No source</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Past questions tab ──────────────────────────────────────────────────
function PastQuestionsTab({
  myCourses, myPastQuestions,
  addPastQuestion, updatePastQuestion, deletePastQuestion,
  togglePastQuestionVisibility, toggleAnswerSchemeVisibility,
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyPastQuestion);
  const [fileError, setFileError] = useState('');
  const [asError, setAsError] = useState('');

  const openCreate = () => {
    setEditing(null);
    setForm(emptyPastQuestion);
    setFileError('');
    setAsError('');
    setOpen(true);
  };

  const openEdit = (pq) => {
    setEditing(pq.id);
    const asSource = pq.answerSchemeData ? 'file' : (pq.answerSchemeUrl ? 'link' : 'none');
    setForm({
      courseCode: pq.courseCode || '',
      courseTitle: pq.courseTitle || '',
      year: pq.year || '',
      semester: pq.semester === '2nd' ? '2nd' : '1st',
      examType: pq.examType === 'mid' ? 'mid' : 'final',
      source: pq.fileData ? 'file' : 'link',
      url: pq.url || '',
      fileData: pq.fileData || null,
      fileName: pq.fileName || null,
      fileSize: pq.fileSize || null,
      asSource,
      answerSchemeUrl: pq.answerSchemeUrl || '',
      answerSchemeData: pq.answerSchemeData || null,
      answerSchemeName: pq.answerSchemeName || null,
      answerSchemeSize: pq.answerSchemeSize || null,
      answerSchemeVisible: !!pq.answerSchemeVisible,
    });
    setFileError('');
    setAsError('');
    setOpen(true);
  };

  const readFileTo = (e, setError, apply) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError(`That file is ${formatBytes(file.size)}. The limit is 1 MB — paste an external link instead.`);
      e.target.value = '';
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = () => apply(reader.result, file.name, file.size);
    reader.readAsDataURL(file);
  };

  const handleFile = (e) =>
    readFileTo(e, setFileError, (data, name, size) =>
      setForm(f => ({ ...f, fileData: data, fileName: name, fileSize: size }))
    );
  const clearFile = () => setForm(f => ({ ...f, fileData: null, fileName: null, fileSize: null }));

  const handleAsFile = (e) =>
    readFileTo(e, setAsError, (data, name, size) =>
      setForm(f => ({ ...f, answerSchemeData: data, answerSchemeName: name, answerSchemeSize: size }))
    );
  const clearAsFile = () =>
    setForm(f => ({ ...f, answerSchemeData: null, answerSchemeName: null, answerSchemeSize: null }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseCode.trim()) return;

    const payload = {
      courseCode: form.courseCode.trim(),
      courseTitle: form.courseTitle.trim(),
      year: form.year.trim(),
      semester: form.semester,
      examType: form.examType,
      answerSchemeVisible: form.answerSchemeVisible,
    };
    if (form.source === 'file' && form.fileData) {
      payload.url = null;
      payload.fileData = form.fileData;
      payload.fileName = form.fileName;
      payload.fileSize = form.fileSize;
    } else {
      payload.url = form.url.trim() || null;
      payload.fileData = null;
      payload.fileName = null;
      payload.fileSize = null;
    }

    if (form.asSource === 'file' && form.answerSchemeData) {
      payload.answerSchemeUrl = '';
      payload.answerSchemeData = form.answerSchemeData;
      payload.answerSchemeName = form.answerSchemeName;
      payload.answerSchemeSize = form.answerSchemeSize;
    } else if (form.asSource === 'link') {
      payload.answerSchemeUrl = form.answerSchemeUrl.trim();
      payload.answerSchemeData = null;
      payload.answerSchemeName = null;
      payload.answerSchemeSize = null;
    } else {
      payload.answerSchemeUrl = '';
      payload.answerSchemeData = null;
      payload.answerSchemeName = null;
      payload.answerSchemeSize = null;
      payload.answerSchemeVisible = false;
    }

    if (editing) updatePastQuestion(editing, payload);
    else addPastQuestion(payload);

    setOpen(false);
    setEditing(null);
    setForm(emptyPastQuestion);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground tabular-nums">{myPastQuestions.length}</span>{' '}
          past question{myPastQuestions.length === 1 ? '' : 's'} uploaded by you
        </p>
        <Button className="active:translate-y-px" onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add past question
        </Button>
      </div>

      {myPastQuestions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <FileQuestion className="h-10 w-10 text-muted-foreground" strokeWidth={1.5} />
            <p className="max-w-prose text-sm text-muted-foreground">
              No past questions yet. Upload a paper so students can practise. Past questions are visible
              across departments.
            </p>
            <Button className="active:translate-y-px" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Add past question
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {myPastQuestions.map(pq => (
            <PastQuestionCard
              key={pq.id}
              pq={pq}
              onEdit={() => openEdit(pq)}
              onDelete={() => deletePastQuestion(pq.id)}
              onToggle={() => togglePastQuestionVisibility(pq.id)}
              onToggleScheme={() => toggleAnswerSchemeVisibility(pq.id)}
            />
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-foreground">
              {editing ? 'Edit past question' : 'Add past question'}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Past questions are shared across departments. Optionally attach an answer scheme.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="pq-code">Course code</Label>
                <Input
                  id="pq-code"
                  list="pq-course-codes"
                  placeholder="e.g. CSC 101"
                  value={form.courseCode}
                  onChange={(e) => setForm({ ...form, courseCode: e.target.value })}
                  required
                />
                <datalist id="pq-course-codes">
                  {myCourses.map(c => <option key={c.id} value={c.code}>{c.title}</option>)}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pq-title">Course title (optional)</Label>
                <Input
                  id="pq-title"
                  placeholder="e.g. Introduction to Computer Science"
                  value={form.courseTitle}
                  onChange={(e) => setForm({ ...form, courseTitle: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="pq-year">Year</Label>
                <Input
                  id="pq-year"
                  inputMode="numeric"
                  placeholder="e.g. 2024"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pq-sem">Semester</Label>
                <select
                  id="pq-sem"
                  className={SELECT_CLASS}
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                >
                  <option value="1st">1st semester</option>
                  <option value="2nd">2nd semester</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pq-exam">Exam type</Label>
                <select
                  id="pq-exam"
                  className={SELECT_CLASS}
                  value={form.examType}
                  onChange={(e) => setForm({ ...form, examType: e.target.value })}
                >
                  <option value="mid">Mid-semester</option>
                  <option value="final">Final exam</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Question paper</Label>
              <SourceField
                idPrefix="pq"
                source={form.source}
                onSourceChange={(s) => setForm({ ...form, source: s })}
                url={form.url}
                onUrlChange={(v) => setForm({ ...form, url: v })}
                fileName={form.fileName}
                fileSize={form.fileSize}
                onFile={handleFile}
                onClearFile={clearFile}
                error={fileError}
                linkLabel="Preferred: a Google Drive or other public link to the paper."
              />
            </div>

            <div className="space-y-3 rounded-xl border border-border bg-muted/30 p-4">
              <Label>Answer scheme (optional)</Label>
              <SourceField
                idPrefix="pq-as"
                source={form.asSource}
                onSourceChange={(s) => setForm({ ...form, asSource: s })}
                url={form.answerSchemeUrl}
                onUrlChange={(v) => setForm({ ...form, answerSchemeUrl: v })}
                fileName={form.answerSchemeName}
                fileSize={form.answerSchemeSize}
                onFile={handleAsFile}
                onClearFile={clearAsFile}
                error={asError}
                linkLabel="A link or small file with the marking scheme."
                allowNone
              />
              {form.asSource !== 'none' && (
                <div className="flex items-center justify-between gap-3 pt-1">
                  <span className="text-sm text-foreground">Visible to students</span>
                  <ToggleSwitch
                    checked={form.answerSchemeVisible}
                    onChange={() => setForm({ ...form, answerSchemeVisible: !form.answerSchemeVisible })}
                    label="Answer scheme visible to students"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1 active:translate-y-px">
                {editing ? 'Save changes' : 'Add past question'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PastQuestionCard({ pq, onEdit, onDelete, onToggle, onToggleScheme }) {
  const hidden = pq.visible === false;
  const href = pq.fileData || pq.url || null;
  const asHref = pq.answerSchemeData || pq.answerSchemeUrl || null;
  const hasScheme = !!asHref;
  return (
    <Card className={`flex flex-col transition-colors hover:border-primary/40 ${hidden ? 'opacity-70' : ''}`}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-foreground">
          <FileQuestion className="h-5 w-5" strokeWidth={1.5} />
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <Badge variant="secondary">{pq.examType === 'mid' ? 'Mid-semester' : 'Final exam'}</Badge>
          {hidden ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <EyeOff className="h-3 w-3" /> Hidden
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs text-success">
              <Eye className="h-3 w-3" /> Visible
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col space-y-4">
        <div className="space-y-1.5">
          <h3 className="text-base font-semibold leading-tight text-foreground">{pq.courseCode}</h3>
          {pq.courseTitle && (
            <p className="line-clamp-1 text-sm text-muted-foreground">{pq.courseTitle}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {[pq.year, pq.semester === '2nd' ? '2nd semester' : '1st semester'].filter(Boolean).join(' · ')}
            {' · '}
            {pq.fileData ? formatBytes(pq.fileSize) : 'External link'}
          </p>
        </div>

        {hasScheme && (
          <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-muted/40 px-3 py-2">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              {pq.answerSchemeVisible
                ? <CheckCircle2 className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                : <EyeOff className="h-3.5 w-3.5" strokeWidth={1.5} />}
              Answer scheme {pq.answerSchemeVisible ? 'shown to students' : 'hidden'}
            </span>
            <ToggleSwitch
              checked={!!pq.answerSchemeVisible}
              onChange={onToggleScheme}
              label="Toggle answer scheme visibility"
            />
          </div>
        )}

        <Separator className="mt-auto" />
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onEdit} aria-label="Edit past question">
              <Pencil className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={onToggle} aria-label={hidden ? 'Show to students' : 'Hide from students'}>
              {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={onDelete} aria-label="Delete past question">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {href ? (
            <Button variant="outline" size="sm" asChild>
              <a href={href} target="_blank" rel="noreferrer">
                {pq.fileData ? 'Open' : 'Open link'}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">No source</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
