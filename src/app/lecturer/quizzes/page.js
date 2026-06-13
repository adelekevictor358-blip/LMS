"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { HelpCircle, Plus, X, Trash2, CheckCircle2, ClipboardList, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

export default function LecturerQuizzes() {
  const { user, courses, quizzes, quizResults, addQuiz } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myQuizzes = quizzes.filter(q => q.createdBy === user?.id);
  const [showForm, setShowForm] = useState(false);
  const [viewingResults, setViewingResults] = useState(null);
  const [form, setForm] = useState({
    courseId: '', title: '', description: '', timeLimit: 15,
    questions: [{ id: 1, type: 'mcq', question: '', options: ['', '', '', ''], correct: 0 }]
  });

  const addQuestion = () => {
    setForm(f => ({ ...f, questions: [...f.questions, { id: Date.now(), type: 'mcq', question: '', options: ['', '', '', ''], correct: 0 }] }));
  };

  const removeQuestion = (idx) => {
    setForm(f => ({ ...f, questions: f.questions.filter((_, i) => i !== idx) }));
  };

  const updateQuestion = (idx, field, value) => {
    setForm(f => {
      const qs = [...f.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      return { ...f, questions: qs };
    });
  };

  const updateOption = (qIdx, oIdx, value) => {
    setForm(f => {
      const qs = [...f.questions];
      const opts = [...qs[qIdx].options];
      opts[oIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...f, questions: qs };
    });
  };

  const handleCreate = (e) => {
    e.preventDefault();
    addQuiz({ ...form, courseId: parseInt(form.courseId), timeLimit: parseInt(form.timeLimit), createdBy: user.id });
    setForm({ courseId: '', title: '', description: '', timeLimit: 15, questions: [{ id: 1, type: 'mcq', question: '', options: ['', '', '', ''], correct: 0 }] });
    setShowForm(false);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Quizzes and assessments
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Create quizzes and review how your students are performing.
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus size={16} /> Create quiz
        </Button>
      </header>

      {/* Quiz create modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="flex items-center gap-2 text-lg font-semibold text-foreground">
                <HelpCircle size={18} className="text-muted-foreground" strokeWidth={1.5} />
                Create a new quiz
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setShowForm(false)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>

            <form onSubmit={handleCreate} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-course">Course</Label>
                  <select
                    id="quiz-course"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={form.courseId}
                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                    required
                  >
                    <option value="">Select course...</option>
                    {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="quiz-time">Time limit (minutes)</Label>
                  <Input id="quiz-time" type="number" min={5} max={120} value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: e.target.value })} required />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz-title">Quiz title</Label>
                <Input id="quiz-title" type="text" placeholder="e.g. Week 4 self-assessment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="quiz-desc">Description</Label>
                <Input id="quiz-desc" type="text" placeholder="Brief description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">Questions ({form.questions.length})</h4>
                  <Button type="button" variant="outline" size="sm" onClick={addQuestion}>
                    <Plus size={14} /> Add question
                  </Button>
                </div>

                {form.questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-xl border border-border bg-muted/40 p-4 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold tabular-nums">
                        {qIdx + 1}
                      </span>
                      <Input
                        type="text"
                        className="flex-1"
                        placeholder={`Question ${qIdx + 1}`}
                        value={q.question}
                        onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                        required
                      />
                      {form.questions.length > 1 && (
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
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {q.options.map((opt, oIdx) => (
                        <label
                          key={oIdx}
                          className={`flex items-center gap-2 rounded-md border px-3 transition-colors ${
                            q.correct === oIdx
                              ? 'border-success bg-success/10'
                              : 'border-border'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            className="accent-primary"
                            checked={q.correct === oIdx}
                            onChange={() => updateQuestion(qIdx, 'correct', oIdx)}
                          />
                          <input
                            type="text"
                            className="flex-1 bg-transparent py-2 text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                            required
                          />
                        </label>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Select the radio button next to the correct answer.</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit">Publish quiz</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results modal */}
      {viewingResults && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4"
          onClick={() => setViewingResults(null)}
        >
          <div
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-border bg-card text-card-foreground p-6 shadow-sm"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
              <h3 className="text-lg font-semibold text-foreground">
                Results — {myQuizzes.find(q => q.id === viewingResults)?.title}
              </h3>
              <Button variant="ghost" size="icon" onClick={() => setViewingResults(null)} aria-label="Close">
                <X size={18} />
              </Button>
            </div>

            <div className="mt-6 space-y-3">
              {quizResults.filter(r => r.quizId === viewingResults).length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
                  <ClipboardList size={40} className="text-muted-foreground" strokeWidth={1.5} />
                  <p className="text-sm text-muted-foreground">No students have taken this quiz yet.</p>
                </div>
              ) : (
                quizResults.filter(r => r.quizId === viewingResults).map(r => {
                  const quiz = myQuizzes.find(q => q.id === r.quizId);
                  const pct = Math.round((r.score / quiz?.questions.length) * 100);
                  return (
                    <div key={r.id} className="flex items-center gap-4 rounded-xl border border-border p-4">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                        {r.studentName?.charAt(0)}
                      </div>
                      <div className="flex flex-1 flex-col">
                        <strong className="text-sm font-semibold text-foreground">{r.studentName}</strong>
                        <span className="text-xs text-muted-foreground">{new Date(r.submittedAt).toLocaleString()}</span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`tabular-nums ${
                          pct >= 70
                            ? 'bg-success/10 text-success border-transparent'
                            : pct >= 50
                            ? 'bg-warning/10 text-warning border-transparent'
                            : 'bg-destructive/10 text-destructive border-transparent'
                        }`}
                      >
                        {r.score}/{quiz?.questions.length} ({pct}%)
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quizzes grid */}
      {myQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-border bg-card p-12 text-center">
          <HelpCircle size={40} className="text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">You haven&apos;t created any quizzes yet.</p>
          <Button onClick={() => setShowForm(true)}>
            <Plus size={16} /> Create quiz
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {myQuizzes.map(quiz => {
            const course = courses.find(c => c.id === quiz.courseId);
            const results = quizResults.filter(r => r.quizId === quiz.id);
            const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.score / quiz.questions.length) * 100, 0) / results.length) : null;
            return (
              <div key={quiz.id} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 shadow-sm transition-colors hover:border-primary/40">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <HelpCircle size={18} strokeWidth={1.5} />
                  </span>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {course && (
                      <Badge variant="outline" className="gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: course.color }} aria-hidden="true" />
                        {course.code}
                      </Badge>
                    )}
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                      <Clock size={14} strokeWidth={1.5} /> {quiz.timeLimit} min
                    </span>
                  </div>
                </div>

                <h4 className="text-base font-semibold text-foreground text-balance">{quiz.title}</h4>
                {quiz.description && <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{quiz.description}</p>}

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground tabular-nums">
                  <span>{quiz.questions.length} questions</span>
                  <span>{results.length} attempt{results.length !== 1 ? 's' : ''}</span>
                  {avgScore !== null && <span className="font-medium text-foreground">Avg {avgScore}%</span>}
                </div>

                <div className="mt-auto pt-1">
                  <Button variant="outline" size="sm" onClick={() => setViewingResults(quiz.id)}>
                    <CheckCircle2 size={14} /> View results
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
