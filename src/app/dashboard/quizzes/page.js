"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Clock, FileText, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function StudentQuizzes() {
  const { user, courses, quizzes, quizResults, submitQuizResult, getStudentCourses, getCourseAssignedLecturer } = useStore();
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);
  const answersRef = useRef({});

  const myResults = quizResults.filter(r => r.studentId === user?.id);
  const hasAttempted = (quizId) => myResults.some(r => r.quizId === quizId);
  const getResult = (quizId) => myResults.find(r => r.quizId === quizId);

  const myCourses = getStudentCourses(user);
  const myCourseIds = myCourses.map(c => c.id);
  const myQuizzes = quizzes.filter(q => myCourseIds.includes(q.courseId));

  const startQuiz = (quiz) => {
    setTakingQuiz(quiz);
    setAnswers({}); answersRef.current = {};
    setSubmitted(false);
    setResult(null);
    setTimeLeft(quiz.timeLimit * 60);
  };

  useEffect(() => {
    if (takingQuiz && !submitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) { handleSubmitQuiz(); return 0; }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [takingQuiz, submitted]);

  const handleSubmitQuiz = () => {
    clearInterval(timerRef.current);
    if (!takingQuiz) return;
    const latest = answersRef.current;
    const score = takingQuiz.questions.reduce((acc, q, idx) => {
      return latest[idx] === q.correct ? acc + 1 : acc;
    }, 0);
    submitQuizResult(takingQuiz.id, latest, score);
    setResult({ score, total: takingQuiz.questions.length });
    setSubmitted(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Quizzes and self-assessment
        </h2>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
          Test your knowledge and track your academic progress.
        </p>
      </header>

      {/* Quiz in progress */}
      {takingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-y-auto rounded-xl border border-border bg-card text-card-foreground shadow-lg">
            <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-border bg-card px-6 py-5">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <HelpCircle size={18} />
                </span>
                <div>
                  <h3 className="text-lg font-semibold leading-tight text-foreground">{takingQuiz.title}</h3>
                  <span className="text-xs text-muted-foreground">{takingQuiz.questions.length} questions</span>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-semibold tabular-nums ${
                  timeLeft < 60
                    ? 'bg-destructive/10 text-destructive animate-pulse'
                    : 'bg-muted text-foreground'
                }`}
              >
                <Clock size={16} /> {formatTime(timeLeft)}
              </div>
            </header>

            {!submitted ? (
              <div className="flex flex-col gap-6 px-6 py-6">
                {takingQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-xl border border-border bg-muted/30 p-5">
                    <div className="mb-2 text-xs font-medium text-muted-foreground">
                      Question {qIdx + 1} of {takingQuiz.questions.length}
                    </div>
                    <p className="mb-4 text-sm font-medium leading-relaxed text-foreground text-pretty">{q.question}</p>
                    <div className="flex flex-col gap-2">
                      {q.options.map((opt, oIdx) => {
                        const selected = answers[qIdx] === oIdx;
                        return (
                          <label
                            key={oIdx}
                            className={`flex cursor-pointer items-center gap-3 rounded-md border p-3 text-sm transition-colors focus-within:ring-1 focus-within:ring-ring ${
                              selected
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border text-foreground hover:border-primary/40 hover:bg-accent'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`q-${qIdx}`}
                              checked={selected}
                              onChange={() => setAnswers(a => { const next = { ...a, [qIdx]: oIdx }; answersRef.current = next; return next; })}
                              className="sr-only"
                            />
                            <span
                              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                                selected
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border text-muted-foreground'
                              }`}
                            >
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span>{opt}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div className="flex items-center justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground tabular-nums">
                    {Object.keys(answers).length}/{takingQuiz.questions.length} answered
                  </span>
                  <Button onClick={handleSubmitQuiz}>
                    <CheckCircle2 size={16} /> Submit quiz
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-5 px-6 py-8">
                {(() => {
                  const passed = (result.score / result.total) >= 0.7;
                  return (
                    <>
                      <div
                        className={`flex h-32 w-32 flex-col items-center justify-center gap-0.5 rounded-full border ${
                          passed
                            ? 'border-success/30 bg-success/10 text-success'
                            : 'border-warning/30 bg-warning/10 text-warning'
                        }`}
                      >
                        <span className="text-2xl font-semibold tabular-nums">{result.score}/{result.total}</span>
                        <span className="text-sm font-medium tabular-nums">
                          {Math.round((result.score / result.total) * 100)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-center">
                        <h3 className="text-lg font-semibold text-foreground">
                          {passed ? 'Well done' : 'Keep studying'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          You scored {result.score} out of {result.total} questions correctly.
                        </p>
                      </div>
                    </>
                  );
                })()}
                <div className="flex max-h-72 w-full flex-col gap-2 overflow-y-auto">
                  {takingQuiz.questions.map((q, qIdx) => {
                    const correct = answers[qIdx] === q.correct;
                    return (
                      <div
                        key={q.id}
                        className={`flex items-start gap-3 rounded-md border p-3 text-sm ${
                          correct
                            ? 'border-success/30 bg-success/5'
                            : 'border-destructive/30 bg-destructive/5'
                        }`}
                      >
                        <span className={`mt-0.5 shrink-0 ${correct ? 'text-success' : 'text-destructive'}`}>
                          {correct ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </span>
                        <div className="flex-1 leading-snug text-foreground text-pretty">{q.question}</div>
                        <div className="flex flex-col gap-0.5 text-right">
                          {!correct && (
                            <span className="text-xs text-destructive">
                              You: {q.options[answers[qIdx]] || 'N/A'}
                            </span>
                          )}
                          <span className="text-xs font-medium text-success">
                            {q.options[q.correct]}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" onClick={() => setTakingQuiz(null)}>Close</Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quizzes grid */}
      {myQuizzes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <HelpCircle size={40} strokeWidth={1.5} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No quizzes are available for your level yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {myQuizzes.map(quiz => {
            const course = courses.find(c => c.id === quiz.courseId);
            const lecturer = getCourseAssignedLecturer(quiz.courseId);
            const attempted = hasAttempted(quiz.id);
            const myResult = getResult(quiz.id);
            const pct = myResult ? Math.round((myResult.score / quiz.questions.length) * 100) : null;
            return (
              <div
                key={quiz.id}
                className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-sm transition-colors hover:border-primary/40"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <HelpCircle size={18} />
                  </span>
                  {course && (
                    <Badge variant="outline" className="gap-1.5 font-medium">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: course.color }}
                        aria-hidden="true"
                      />
                      {course.code}
                    </Badge>
                  )}
                </div>
                <h4 className="text-base font-semibold leading-snug text-foreground">{quiz.title}</h4>
                <p className="text-sm leading-relaxed text-muted-foreground text-pretty">{quiz.description}</p>
                {lecturer && (
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    By: {lecturer.title || 'Dr.'} {lecturer.name}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-xs text-muted-foreground mt-2">
                  <span className="flex items-center gap-1.5"><Clock size={14} /> {quiz.timeLimit} min</span>
                  <span className="flex items-center gap-1.5"><FileText size={14} /> {quiz.questions.length} questions</span>
                </div>
                {attempted && myResult && (
                  <div
                    className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${
                      pct >= 70
                        ? 'bg-success/10 text-success'
                        : pct >= 50
                          ? 'bg-warning/10 text-warning'
                          : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    Score: {myResult.score}/{quiz.questions.length} ({pct}%)
                  </div>
                )}
                <Button
                  variant={attempted ? 'outline' : 'default'}
                  className="mt-auto w-full active:translate-y-px"
                  onClick={() => startQuiz(quiz)}
                >
                  <Play size={16} /> {attempted ? 'Retake quiz' : 'Start quiz'}
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
