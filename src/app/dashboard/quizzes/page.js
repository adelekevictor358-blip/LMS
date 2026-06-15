"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  HelpCircle, CheckCircle2, XCircle, Clock, FileText, Play, Flag,
  ChevronLeft, ChevronRight, ShieldAlert, ListChecks, CalendarClock,
  Award, ArrowLeft, AlertTriangle, Hourglass,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';

/* ─── helpers ─────────────────────────────────────────────────────── */

function fmtClock(secs) {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, '0')}`;
}

function fmtWindow(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  });
}

const STATUS_META = {
  upcoming: { label: 'Upcoming', cls: 'bg-info/10 text-info', icon: CalendarClock },
  active: { label: 'Active', cls: 'bg-success/10 text-success', icon: Play },
  closed: { label: 'Closed', cls: 'bg-muted text-muted-foreground', icon: XCircle },
};

const TF_LABEL = (v) => (v ? 'True' : 'False');

/* ─── page ────────────────────────────────────────────────────────── */

export default function StudentQuizzes() {
  const {
    user, courses, quizzes, quizAttempts,
    getStudentCourseIds, getCourseAssignedLecturer, getQuizStatus,
    startQuizAttempt, saveAttemptProgress, recordTabSwitch, submitQuizAttempt,
    getMyQuizAttempt,
  } = useStore();

  // view: 'list' | 'confirm' | 'take' | 'result'
  const [view, setView] = useState('list');
  const [activeQuizId, setActiveQuizId] = useState(null);
  const [attemptId, setAttemptId] = useState(null);

  const myCourseIds = useMemo(() => getStudentCourseIds(user), [getStudentCourseIds, user]);

  const myQuizzes = useMemo(
    () => quizzes.filter(q => myCourseIds.includes(q.courseId) && q.status === 'published'),
    [quizzes, myCourseIds]
  );

  const activeQuiz = useMemo(
    () => quizzes.find(q => q.id === activeQuizId) || null,
    [quizzes, activeQuizId]
  );

  const [beginError, setBeginError] = useState('');

  // Live attempt object straight from the store so auto-submit (timer / tab
  // switches) reactively flips us into the result view.
  const liveAttempt = useMemo(
    () => quizAttempts.find(a => a.id === attemptId) || null,
    [quizAttempts, attemptId]
  );

  const openConfirm = (quizId) => {
    setActiveQuizId(quizId);
    setBeginError('');
    setView('confirm');
  };

  const begin = () => {
    const res = startQuizAttempt(activeQuizId);
    if (res?.error) {
      // Surface the block inline on the confirm screen.
      setBeginError(res.error);
      return;
    }
    setAttemptId(res.id);
    setView('take');
  };

  const backToList = () => {
    setView('list');
    setActiveQuizId(null);
    setAttemptId(null);
    setBeginError('');
  };

  /* ── render ──
     The "take" view is gated on the live attempt still being in-progress.
     When the store auto-submits (timer hits 0 or 3 tab switches), the live
     attempt's status changes and this guard fails, so we fall through to the
     result view below — no effect/setState needed. */
  if (view === 'take' && activeQuiz && liveAttempt?.status === 'in-progress') {
    return (
      <TakeQuiz
        quiz={activeQuiz}
        attempt={liveAttempt}
        saveAttemptProgress={saveAttemptProgress}
        recordTabSwitch={recordTabSwitch}
        submitQuizAttempt={submitQuizAttempt}
        onSubmitted={() => setView('result')}
      />
    );
  }

  // Auto-submitted while taking, or explicitly submitted: show the result.
  if ((view === 'result' || (view === 'take' && liveAttempt && liveAttempt.status !== 'in-progress')) && activeQuiz) {
    const attempt = liveAttempt || getMyQuizAttempt(activeQuizId);
    return (
      <QuizResult
        quiz={activeQuiz}
        attempt={attempt}
        course={courses.find(c => c.id === activeQuiz.courseId)}
        onBack={backToList}
      />
    );
  }

  if (view === 'confirm' && activeQuiz) {
    return (
      <StartConfirm
        quiz={activeQuiz}
        course={courses.find(c => c.id === activeQuiz.courseId)}
        error={beginError}
        onBegin={begin}
        onCancel={backToList}
      />
    );
  }

  // ── LIST ──
  const grouped = { active: [], upcoming: [], closed: [] };
  myQuizzes.forEach(q => {
    const s = getQuizStatus(q);
    (grouped[s] || grouped.closed).push(q);
  });
  const order = [
    ['active', 'Active'],
    ['upcoming', 'Upcoming'],
    ['closed', 'Closed'],
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <header className="space-y-1">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Quizzes and self-assessment
        </h2>
        <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
          Timed assessments for the courses you are registered for. Once you begin, the timer runs
          continuously and your answers save automatically.
        </p>
      </header>

      {myQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <HelpCircle size={40} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            No quizzes have been published for your registered courses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {order.map(([key, label]) => {
            const items = grouped[key];
            if (!items.length) return null;
            const Meta = STATUS_META[key];
            return (
              <section key={key} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-foreground">{label}</h3>
                  <Badge variant="outline" className="tabular-nums text-muted-foreground">
                    {items.length}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(quiz => (
                    <QuizCard
                      key={quiz.id}
                      quiz={quiz}
                      status={key}
                      course={courses.find(c => c.id === quiz.courseId)}
                      lecturer={getCourseAssignedLecturer(quiz.courseId)}
                      attempt={getMyQuizAttempt(quiz.id)}
                      onStart={() => openConfirm(quiz.id)}
                      onReview={() => { setActiveQuizId(quiz.id); setAttemptId(null); setView('result'); }}
                      MetaIcon={Meta.icon}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── list card ───────────────────────────────────────────────────── */

function QuizCard({ quiz, status, course, lecturer, attempt, onStart, onReview, MetaIcon }) {
  const meta = STATUS_META[status];
  const attemptsLeft = (quiz.attemptsAllowed || 1) - (attempt ? 1 : 0);
  const submitted = attempt && attempt.status !== 'in-progress';
  const pct = submitted && attempt.maxScore > 0
    ? Math.round((attempt.totalScore / attempt.maxScore) * 100)
    : null;
  const pending = submitted && attempt.status === 'submitted';

  const canStart = status === 'active' && attemptsLeft > 0 && !(attempt && attempt.status === 'in-progress');
  const resuming = attempt && attempt.status === 'in-progress' && status === 'active';

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-primary/40">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <HelpCircle size={18} />
        </span>
        <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${meta.cls}`}>
          <MetaIcon size={12} />
          {meta.label}
        </div>
      </div>

      <div className="space-y-1">
        <h4 className="text-base font-semibold leading-snug text-foreground">{quiz.title}</h4>
        {course && (
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: course.color }}
              aria-hidden="true"
            />
            {course.code} · {course.title}
          </span>
        )}
      </div>

      {quiz.instructions && (
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty line-clamp-2">
          {quiz.instructions}
        </p>
      )}

      <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <ListChecks size={14} />
          <span className="tabular-nums">{quiz.questions.length} questions</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award size={14} />
          <span className="tabular-nums">{quiz.totalMarks} marks</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={14} />
          <span className="tabular-nums">{quiz.timeLimit} min</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CalendarClock size={14} />
          <span className="tabular-nums">{quiz.attemptsAllowed} attempt{quiz.attemptsAllowed === 1 ? '' : 's'}</span>
        </div>
      </dl>

      <p className="text-xs text-muted-foreground">
        Window: {fmtWindow(quiz.startAt)} – {fmtWindow(quiz.endAt)}
      </p>

      {lecturer && (
        <p className="text-xs font-medium text-muted-foreground">
          By {lecturer.title || 'Dr.'} {lecturer.name}
        </p>
      )}

      {submitted && (
        <div
          className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-medium ${
            pending
              ? 'bg-warning/10 text-warning'
              : pct >= 70
                ? 'bg-success/10 text-success'
                : pct >= 50
                  ? 'bg-warning/10 text-warning'
                  : 'bg-destructive/10 text-destructive'
          }`}
        >
          {pending ? (
            <span className="flex items-center gap-1.5"><Hourglass size={14} /> Awaiting review</span>
          ) : (
            <>
              <span>Your score</span>
              <span className="tabular-nums">{attempt.totalScore}/{attempt.maxScore} ({pct}%)</span>
            </>
          )}
        </div>
      )}

      <div className="mt-auto pt-1">
        {canStart ? (
          <Button className="w-full active:translate-y-px" onClick={onStart}>
            <Play size={16} /> Start quiz
          </Button>
        ) : resuming ? (
          <Button className="w-full active:translate-y-px" onClick={onStart}>
            <Play size={16} /> Resume quiz
          </Button>
        ) : submitted ? (
          <Button variant="outline" className="w-full active:translate-y-px" onClick={onReview}>
            <FileText size={16} /> View result
          </Button>
        ) : status === 'closed' ? (
          <Button variant="outline" className="w-full" disabled>
            <XCircle size={16} /> This quiz is closed
          </Button>
        ) : status === 'upcoming' ? (
          <Button variant="outline" className="w-full" disabled>
            <CalendarClock size={16} /> Opens {fmtWindow(quiz.startAt)}
          </Button>
        ) : (
          <Button variant="outline" className="w-full" disabled>
            No attempts remaining
          </Button>
        )}
      </div>
    </div>
  );
}

/* ─── start confirm ───────────────────────────────────────────────── */

function StartConfirm({ quiz, course, error, onBegin, onCancel }) {
  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <button
        type="button"
        onClick={onCancel}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to quizzes
      </button>

      <div className="space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <header className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
            <HelpCircle size={20} />
          </span>
          <div className="space-y-1">
            <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">
              {quiz.title}
            </h2>
            {course && (
              <span className="text-sm text-muted-foreground">{course.code} · {course.title}</span>
            )}
          </div>
        </header>

        <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: 'Questions', value: quiz.questions.length, icon: ListChecks },
            { label: 'Total marks', value: quiz.totalMarks, icon: Award },
            { label: 'Time limit', value: `${quiz.timeLimit} min`, icon: Clock },
            { label: 'Attempts', value: quiz.attemptsAllowed, icon: CalendarClock },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-md border border-border bg-muted/30 p-3">
              <dt className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Icon size={14} /> {label}
              </dt>
              <dd className="mt-1 text-lg font-semibold tabular-nums text-foreground">{value}</dd>
            </div>
          ))}
        </dl>

        {quiz.instructions && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">Instructions</h3>
            <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{quiz.instructions}</p>
          </div>
        )}

        <div className="flex items-start gap-2 rounded-md bg-warning/10 px-3 py-2.5 text-sm text-warning">
          <ShieldAlert size={16} className="mt-0.5 shrink-0" />
          <p className="text-pretty">
            Once you begin, the timer starts immediately and cannot be paused. Leaving the quiz tab is
            logged — three switches will automatically submit your attempt.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 rounded-md bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            <AlertTriangle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button className="active:translate-y-px" onClick={onBegin}>
            <Play size={16} /> Begin
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── take quiz ───────────────────────────────────────────────────── */

function TakeQuiz({ quiz, attempt, saveAttemptProgress, recordTabSwitch, submitQuizAttempt, onSubmitted }) {
  // Answers keyed by question id (rich model), seeded from any resumed attempt.
  const [answers, setAnswers] = useState(() => ({ ...(attempt.answers || {}) }));
  const [flags, setFlags] = useState({}); // local-only "flag for review", by question id
  const [idx, setIdx] = useState(0); // for displayMode 'one'
  const [remaining, setRemaining] = useState(0);
  const [warning, setWarning] = useState('');
  const [confirming, setConfirming] = useState(false);

  const answersRef = useRef(answers);
  const submittedRef = useRef(false);
  const warnTimer = useRef(null);

  // Keep the ref in sync with state for use inside timers / event listeners.
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // Ordered questions for this student.
  const orderedQuestions = useMemo(() => {
    const byId = new Map(quiz.questions.map(q => [q.id, q]));
    const ids = attempt.questionOrder?.length ? attempt.questionOrder : quiz.questions.map(q => q.id);
    return ids.map(id => byId.get(id)).filter(Boolean);
  }, [quiz.questions, attempt.questionOrder]);

  const totalSecs = (quiz.timeLimit || 0) * 60;

  const doSubmit = useCallback(() => {
    if (submittedRef.current) return;
    submittedRef.current = true;
    submitQuizAttempt(attempt.id, answersRef.current);
    onSubmitted();
  }, [attempt.id, submitQuizAttempt, onSubmitted]);

  // Countdown derived from startedAt + timeLimit; auto-submit at 0.
  useEffect(() => {
    const startMs = Date.parse(attempt.startedAt);
    const tick = () => {
      const elapsed = (Date.now() - startMs) / 1000;
      const left = Math.max(0, totalSecs - elapsed);
      setRemaining(left);
      if (left <= 0) doSubmit();
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [attempt.startedAt, totalSecs, doSubmit]);

  // Autosave every 30s.
  useEffect(() => {
    const t = setInterval(() => {
      if (!submittedRef.current) saveAttemptProgress(attempt.id, answersRef.current);
    }, 30000);
    return () => clearInterval(t);
  }, [attempt.id, saveAttemptProgress]);

  // Anti-cheat: log tab/visibility switches.
  useEffect(() => {
    const onHidden = () => {
      if (document.visibilityState === 'hidden' && !submittedRef.current) {
        // Persist current answers before counting the switch (store may auto-submit at 3).
        saveAttemptProgress(attempt.id, answersRef.current);
        recordTabSwitch(attempt.id);
        setWarning('Warning: leaving the quiz is logged. 3 switches will auto-submit your attempt.');
        clearTimeout(warnTimer.current);
        warnTimer.current = setTimeout(() => setWarning(''), 6000);
      }
    };
    document.addEventListener('visibilitychange', onHidden);
    return () => {
      document.removeEventListener('visibilitychange', onHidden);
      clearTimeout(warnTimer.current);
    };
  }, [attempt.id, recordTabSwitch, saveAttemptProgress]);

  const setAnswer = (qid, value) => {
    setAnswers(prev => {
      const next = { ...prev, [qid]: value };
      answersRef.current = next;
      return next;
    });
  };

  const toggleFlag = (qid) => setFlags(prev => ({ ...prev, [qid]: !prev[qid] }));

  const answeredCount = orderedQuestions.filter(q => answers[q.id] !== undefined && answers[q.id] !== '').length;
  const oneAtATime = quiz.displayMode === 'one';
  const visible = oneAtATime ? [orderedQuestions[idx]].filter(Boolean) : orderedQuestions;
  const lowTime = remaining <= 60;

  return (
    <div
      className="animate-fade-in space-y-6 select-none"
      onCopy={(e) => e.preventDefault()}
    >
      {/* sticky header with timer */}
      <div className="sticky top-0 z-20 -mx-4 border-b border-border bg-background/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:-mx-6 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-foreground">{quiz.title}</h2>
            <p className="text-xs text-muted-foreground tabular-nums">
              {answeredCount}/{orderedQuestions.length} answered
            </p>
          </div>
          <div
            role="timer"
            aria-live="off"
            aria-label={`Time remaining ${fmtClock(remaining)}`}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums ${
              lowTime ? 'bg-destructive/10 text-destructive' : 'bg-muted text-foreground'
            }`}
          >
            <Clock size={16} className={lowTime ? 'animate-pulse' : ''} />
            {fmtClock(remaining)}
          </div>
        </div>
      </div>

      {/* anti-cheat banner */}
      {warning && (
        <div
          role="alert"
          className="flex items-center gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2.5 text-sm font-medium text-warning"
        >
          <ShieldAlert size={16} className="shrink-0" />
          {warning}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
        <div className="space-y-5">
          {visible.map((q) => {
            const number = orderedQuestions.findIndex(item => item.id === q.id) + 1;
            return (
              <QuestionCard
                key={q.id}
                q={q}
                number={number}
                total={orderedQuestions.length}
                value={answers[q.id]}
                flagged={!!flags[q.id]}
                optionOrder={attempt.optionOrders?.[q.id]}
                onAnswer={(v) => setAnswer(q.id, v)}
                onToggleFlag={() => toggleFlag(q.id)}
              />
            );
          })}

          {/* one-at-a-time nav */}
          {oneAtATime && (
            <div className="flex items-center justify-between gap-3">
              <Button
                variant="outline"
                disabled={idx === 0}
                onClick={() => setIdx(i => Math.max(0, i - 1))}
              >
                <ChevronLeft size={16} /> Previous
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {idx + 1} / {orderedQuestions.length}
              </span>
              {idx < orderedQuestions.length - 1 ? (
                <Button variant="outline" onClick={() => setIdx(i => Math.min(orderedQuestions.length - 1, i + 1))}>
                  Next <ChevronRight size={16} />
                </Button>
              ) : (
                <Button onClick={() => setConfirming(true)}>
                  <CheckCircle2 size={16} /> Submit
                </Button>
              )}
            </div>
          )}

          {/* all-on-one-page submit */}
          {!oneAtATime && (
            <div className="flex items-center justify-between gap-3 border-t border-border pt-4">
              <span className="text-sm text-muted-foreground tabular-nums">
                {answeredCount}/{orderedQuestions.length} answered
              </span>
              <Button className="active:translate-y-px" onClick={() => setConfirming(true)}>
                <CheckCircle2 size={16} /> Submit quiz
              </Button>
            </div>
          )}
        </div>

        {/* question navigator */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-3 rounded-xl border border-border bg-card p-4">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Navigator</h3>
            <div className="grid grid-cols-5 gap-2">
              {orderedQuestions.map((q, i) => {
                const done = answers[q.id] !== undefined && answers[q.id] !== '';
                const isCurrent = oneAtATime && i === idx;
                const flagged = flags[q.id];
                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => { if (oneAtATime) setIdx(i); }}
                    aria-label={`Question ${i + 1}${done ? ', answered' : ''}${flagged ? ', flagged' : ''}`}
                    className={`relative flex h-9 items-center justify-center rounded-md border text-xs font-semibold tabular-nums transition-colors ${
                      isCurrent
                        ? 'border-primary bg-primary text-primary-foreground'
                        : done
                          ? 'border-success/40 bg-success/10 text-success'
                          : 'border-border bg-muted/40 text-muted-foreground hover:border-primary/40'
                    } ${oneAtATime ? 'cursor-pointer' : 'cursor-default'}`}
                  >
                    {i + 1}
                    {flagged && (
                      <span
                        className="absolute -right-1 -top-1 flex h-3 w-3 items-center justify-center rounded-full bg-warning text-warning-foreground"
                        aria-hidden="true"
                      >
                        <Flag size={8} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 pt-1 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-success/30" /> Answered
              </span>
              <span className="flex items-center gap-1.5">
                <Flag size={11} className="text-warning" /> Flagged for review
              </span>
            </div>
          </div>
        </aside>
      </div>

      {/* submit confirmation */}
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-lg">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <CheckCircle2 size={18} />
              </span>
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-foreground">Submit your quiz?</h3>
                <p className="text-sm text-muted-foreground text-pretty">
                  You have answered {answeredCount} of {orderedQuestions.length} questions. You can’t
                  change your answers after submitting.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirming(false)}>Keep working</Button>
              <Button className="active:translate-y-px" onClick={doSubmit}>Submit quiz</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── one question (take view) ────────────────────────────────────── */

function QuestionCard({ q, number, total, value, flagged, optionOrder, onAnswer, onToggleFlag }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <span className="text-xs font-medium text-muted-foreground">
          Question {number} of {total}
          <span className="ml-2 tabular-nums">· {q.marks} mark{q.marks === 1 ? '' : 's'}</span>
        </span>
        <button
          type="button"
          onClick={onToggleFlag}
          aria-pressed={flagged}
          className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            flagged
              ? 'bg-warning/15 text-warning'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          <Flag size={13} /> {flagged ? 'Flagged' : 'Flag for review'}
        </button>
      </div>

      <p className="mb-4 text-sm font-medium leading-relaxed text-foreground text-pretty">{q.text}</p>

      {q.type === 'mcq' && (
        <fieldset className="flex flex-col gap-2">
          <legend className="sr-only">Choose one answer</legend>
          {(optionOrder?.length ? optionOrder : q.options.map((_, i) => i)).map((optIdx, displayPos) => {
            const selected = value === optIdx;
            return (
              <label
                key={optIdx}
                className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors focus-within:ring-1 focus-within:ring-ring ${
                  selected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-foreground hover:border-primary/40 hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={selected}
                  onChange={() => onAnswer(optIdx)}
                  className="sr-only"
                />
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                    selected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-border text-muted-foreground'
                  }`}
                >
                  {String.fromCharCode(65 + displayPos)}
                </span>
                <span>{q.options[optIdx]}</span>
              </label>
            );
          })}
        </fieldset>
      )}

      {q.type === 'tf' && (
        <fieldset className="flex flex-col gap-2 sm:flex-row">
          <legend className="sr-only">Choose true or false</legend>
          {[true, false].map((boolVal) => {
            const selected = value === boolVal;
            return (
              <label
                key={String(boolVal)}
                className={`flex flex-1 cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors focus-within:ring-1 focus-within:ring-ring ${
                  selected
                    ? 'border-primary bg-primary/5 text-foreground'
                    : 'border-border text-foreground hover:border-primary/40 hover:bg-accent'
                }`}
              >
                <input
                  type="radio"
                  name={`q-${q.id}`}
                  checked={selected}
                  onChange={() => onAnswer(boolVal)}
                  className="sr-only"
                />
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                    selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
                  }`}
                >
                  {selected && <CheckCircle2 size={12} />}
                </span>
                {TF_LABEL(boolVal)}
              </label>
            );
          })}
        </fieldset>
      )}

      {q.type === 'short' && (
        <Textarea
          value={value ?? ''}
          onChange={(e) => onAnswer(e.target.value)}
          placeholder="Type your answer…"
          className="min-h-[120px]"
        />
      )}
    </div>
  );
}

/* ─── result ──────────────────────────────────────────────────────── */

function QuizResult({ quiz, attempt, course, onBack }) {
  if (!attempt) {
    return (
      <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Back to quizzes
        </button>
        <div className="rounded-xl border border-border bg-card p-8 text-center text-sm text-muted-foreground">
          No attempt found for this quiz.
        </div>
      </div>
    );
  }

  const pendingReview = attempt.status === 'submitted';
  const hasShort = quiz.questions.some(q => q.type === 'short');
  const autoMax = quiz.questions
    .filter(q => q.type !== 'short')
    .reduce((s, q) => s + (q.marks || 0), 0);
  const pct = attempt.maxScore > 0 ? Math.round((attempt.totalScore / attempt.maxScore) * 100) : 0;
  const good = !pendingReview && pct >= 70;

  // Order the breakdown the way the student saw the quiz.
  const byId = new Map(quiz.questions.map(q => [q.id, q]));
  const orderedIds = attempt.questionOrder?.length ? attempt.questionOrder : quiz.questions.map(q => q.id);
  const ordered = orderedIds.map(id => byId.get(id)).filter(Boolean);

  return (
    <div className="animate-fade-in mx-auto max-w-3xl space-y-6">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to quizzes
      </button>

      {/* summary */}
      <div className="space-y-5 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm">
        <div className="space-y-1">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-foreground text-balance">
            {quiz.title}
          </h2>
          {course && <p className="text-sm text-muted-foreground">{course.code} · {course.title}</p>}
        </div>

        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">
          <div
            className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center gap-0.5 rounded-full border ${
              pendingReview
                ? 'border-warning/30 bg-warning/10 text-warning'
                : good
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-warning/30 bg-warning/10 text-warning'
            }`}
          >
            <span className="text-2xl font-semibold tabular-nums">
              {attempt.totalScore}/{attempt.maxScore}
            </span>
            <span className="text-sm font-medium tabular-nums">{pct}%</span>
          </div>

          <div className="space-y-2 text-center sm:text-left">
            {pendingReview ? (
              <>
                <h3 className="flex items-center justify-center gap-2 text-base font-semibold text-foreground sm:justify-start">
                  <Hourglass size={16} className="text-warning" /> Partially graded
                </h3>
                <p className="max-w-prose text-sm text-muted-foreground text-pretty">
                  Your auto-graded questions are scored below. Short-answer questions are pending
                  lecturer review — your final mark may rise once they are graded.
                </p>
              </>
            ) : (
              <>
                <h3 className="text-base font-semibold text-foreground">
                  {good ? 'Well done' : 'Keep studying'}
                </h3>
                <p className="max-w-prose text-sm text-muted-foreground text-pretty">
                  You scored {attempt.totalScore} out of {attempt.maxScore} marks.
                </p>
              </>
            )}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground sm:justify-start">
              <span className="tabular-nums">Auto-graded: {attempt.autoScore}/{autoMax}</span>
              {hasShort && (
                <span className="tabular-nums">
                  Manual: {attempt.manualScore == null ? 'pending' : attempt.manualScore}
                </span>
              )}
              {attempt.timeTakenSec != null && (
                <span className="tabular-nums">Time taken: {fmtClock(attempt.timeTakenSec)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* breakdown */}
      <section className="space-y-3">
        <h3 className="text-lg font-semibold text-foreground">Answer breakdown</h3>
        <div className="space-y-3">
          {ordered.map((q, i) => (
            <ResultRow key={q.id} q={q} number={i + 1} attempt={attempt} />
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft size={16} /> Back to quizzes
        </Button>
      </div>
    </div>
  );
}

/* ─── one result row ──────────────────────────────────────────────── */

function ResultRow({ q, number, attempt }) {
  const ans = attempt.answers?.[q.id];

  if (q.type === 'short') {
    const reviewed = attempt.status === 'graded';
    const earned = attempt.shortMarks?.[q.id];
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-card-foreground">
        <RowHeader number={number} marks={q.marks} q={q}
          state={reviewed ? 'graded' : 'pending'}
          earned={reviewed ? earned : null}
        />
        <p className="mb-3 text-sm font-medium leading-relaxed text-foreground text-pretty">{q.text}</p>
        <div className="space-y-2">
          <div>
            <span className="text-xs font-medium text-muted-foreground">Your answer</span>
            <p className="mt-0.5 whitespace-pre-wrap rounded-md bg-muted/40 px-3 py-2 text-sm text-foreground">
              {ans ? String(ans) : <span className="text-muted-foreground">No answer</span>}
            </p>
          </div>
          {!reviewed && (
            <p className="flex items-center gap-1.5 text-xs font-medium text-warning">
              <Hourglass size={13} /> Pending lecturer review
            </p>
          )}
        </div>
      </div>
    );
  }

  // mcq / tf — auto-graded
  const correct = ans === q.correct;
  const yourLabel = q.type === 'tf'
    ? (ans === undefined ? null : TF_LABEL(ans))
    : (ans === undefined ? null : q.options[ans]);
  const correctLabel = q.type === 'tf' ? TF_LABEL(q.correct) : q.options[q.correct];

  return (
    <div className={`rounded-xl border p-4 ${correct ? 'border-success/30 bg-success/5' : 'border-destructive/30 bg-destructive/5'}`}>
      <RowHeader
        number={number}
        marks={q.marks}
        q={q}
        state={correct ? 'correct' : 'incorrect'}
        earned={correct ? q.marks : 0}
      />
      <p className="mb-3 text-sm font-medium leading-relaxed text-foreground text-pretty">{q.text}</p>
      <div className="space-y-1.5 text-sm">
        <div className="flex items-start gap-2">
          <span className={`mt-0.5 shrink-0 ${correct ? 'text-success' : 'text-destructive'}`}>
            {correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
          </span>
          <span className={correct ? 'text-success' : 'text-destructive'}>
            Your answer: <span className="font-medium text-foreground">{yourLabel ?? 'No answer'}</span>
          </span>
        </div>
        {!correct && (
          <div className="flex items-start gap-2 pl-[1.4rem]">
            <span className="text-xs font-medium text-success">
              Correct answer: <span className="font-semibold">{correctLabel}</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function RowHeader({ number, marks, q, state, earned }) {
  const stateMeta = {
    correct: { text: 'Correct', cls: 'bg-success/10 text-success' },
    incorrect: { text: 'Incorrect', cls: 'bg-destructive/10 text-destructive' },
    graded: { text: 'Graded', cls: 'bg-success/10 text-success' },
    pending: { text: 'Pending review', cls: 'bg-warning/10 text-warning' },
  }[state];
  return (
    <div className="mb-2 flex items-center justify-between gap-2">
      <span className="text-xs font-medium text-muted-foreground">
        Question {number}
        <span className="ml-2 tabular-nums">
          · {earned == null ? '—' : earned}/{marks} mark{marks === 1 ? '' : 's'}
        </span>
      </span>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${stateMeta.cls}`}>
        {stateMeta.text}
      </span>
    </div>
  );
}
