"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useRef } from 'react';
import { HelpCircle, CheckCircle2, XCircle, Clock, Trophy, Play } from 'lucide-react';

export default function StudentQuizzes() {
  const { user, courses, quizzes, quizResults, submitQuizResult } = useStore();
  const [takingQuiz, setTakingQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const timerRef = useRef(null);

  const myResults = quizResults.filter(r => r.studentId === user?.id);
  const hasAttempted = (quizId) => myResults.some(r => r.quizId === quizId);
  const getResult = (quizId) => myResults.find(r => r.quizId === quizId);

  const myCourses = courses.filter(c => c.level === user?.level);
  const myCourseIds = myCourses.map(c => c.id);
  const myQuizzes = quizzes.filter(q => myCourseIds.includes(q.courseId));

  const startQuiz = (quiz) => {
    setTakingQuiz(quiz);
    setAnswers({});
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
    const score = takingQuiz.questions.reduce((acc, q, idx) => {
      return answers[idx] === q.correct ? acc + 1 : acc;
    }, 0);
    submitQuizResult(takingQuiz.id, answers, score);
    setResult({ score, total: takingQuiz.questions.length });
    setSubmitted(true);
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Quizzes & Self-Assessment</h2>
          <p>Test your knowledge and track your academic progress.</p>
        </div>
      </div>

      {/* Quiz in Progress */}
      {takingQuiz && (
        <div className="modal-overlay">
          <div className="quiz-modal glass-panel">
            <div className="quiz-modal-header">
              <div className="quiz-modal-title">
                <HelpCircle size={20} color="var(--primary)" />
                <div>
                  <h3>{takingQuiz.title}</h3>
                  <span>{takingQuiz.questions.length} questions</span>
                </div>
              </div>
              <div className={`quiz-timer ${timeLeft < 60 ? 'urgent' : ''}`}>
                <Clock size={16} /> {formatTime(timeLeft)}
              </div>
            </div>

            {!submitted ? (
              <div className="quiz-questions">
                {takingQuiz.questions.map((q, qIdx) => (
                  <div key={q.id} className="question-card">
                    <div className="q-label">Question {qIdx + 1} of {takingQuiz.questions.length}</div>
                    <p className="q-text">{q.question}</p>
                    <div className="options-list">
                      {q.options.map((opt, oIdx) => (
                        <label key={oIdx} className={`option-label ${answers[qIdx] === oIdx ? 'selected' : ''}`}>
                          <input type="radio" name={`q-${qIdx}`} checked={answers[qIdx] === oIdx} onChange={() => setAnswers(a => ({ ...a, [qIdx]: oIdx }))} />
                          <span className="opt-letter">{String.fromCharCode(65 + oIdx)}</span>
                          <span>{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <div className="quiz-submit-area">
                  <span className="answered-count">{Object.keys(answers).length}/{takingQuiz.questions.length} answered</span>
                  <button className="btn btn-primary" onClick={handleSubmitQuiz}>
                    <CheckCircle2 size={16} /> Submit Quiz
                  </button>
                </div>
              </div>
            ) : (
              <div className="quiz-result-screen">
                <div className={`result-circle ${(result.score / result.total) >= 0.7 ? 'pass' : 'fail'}`}>
                  <Trophy size={36} />
                  <span className="result-score">{result.score}/{result.total}</span>
                  <span className="result-pct">{Math.round((result.score / result.total) * 100)}%</span>
                </div>
                <h3>{(result.score / result.total) >= 0.7 ? '🎉 Great job!' : '📚 Keep studying!'}</h3>
                <p>You scored {result.score} out of {result.total} questions correctly.</p>
                <div className="result-breakdown">
                  {takingQuiz.questions.map((q, qIdx) => (
                    <div key={q.id} className={`result-row ${answers[qIdx] === q.correct ? 'correct' : 'wrong'}`}>
                      <div className="result-icon">{answers[qIdx] === q.correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}</div>
                      <div className="result-q">{q.question}</div>
                      <div className="result-ans">
                        {answers[qIdx] !== q.correct && <span className="your-ans">You: {q.options[answers[qIdx]] || 'N/A'}</span>}
                        <span className="correct-ans">✓ {q.options[q.correct]}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="btn btn-primary" onClick={() => setTakingQuiz(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="quizzes-grid">
        {myQuizzes.length === 0 ? (
          <div className="empty-full glass-panel"><HelpCircle size={40} /><p>No quizzes available for your level yet.</p></div>
        ) : (
          myQuizzes.map(quiz => {
            const course = courses.find(c => c.id === quiz.courseId);
            const attempted = hasAttempted(quiz.id);
            const myResult = getResult(quiz.id);
            const pct = myResult ? Math.round((myResult.score / quiz.questions.length) * 100) : null;
            return (
              <div key={quiz.id} className="quiz-card glass-panel">
                <div className="quiz-top">
                  <div className="quiz-icon-wrap">
                    <HelpCircle size={22} color="var(--primary)" />
                  </div>
                  {course && <span className="course-tag" style={{ background: course.color + '22', color: course.color }}>{course.code}</span>}
                </div>
                <h4>{quiz.title}</h4>
                <p className="quiz-desc">{quiz.description}</p>
                <div className="quiz-info">
                  <span><Clock size={13} /> {quiz.timeLimit} min</span>
                  <span>📝 {quiz.questions.length} questions</span>
                </div>
                {attempted && myResult && (
                  <div className={`result-badge ${pct >= 70 ? 'good' : pct >= 50 ? 'mid' : 'low'}`}>
                    <Trophy size={14} /> Score: {myResult.score}/{quiz.questions.length} ({pct}%)
                  </div>
                )}
                <button
                  className={`btn ${attempted ? 'btn-outline' : 'btn-primary'} start-btn`}
                  onClick={() => startQuiz(quiz)}
                >
                  <Play size={14} /> {attempted ? 'Retake Quiz' : 'Start Quiz'}
                </button>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header h2 { font-size: 1.4rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .page-header p { color: var(--text-muted); font-size: 0.9rem; }

        .quizzes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.25rem; }
        .quiz-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-top { display: flex; justify-content: space-between; align-items: center; }
        .quiz-icon-wrap { color: var(--primary); }
        .course-tag { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .quiz-card h4 { font-size: 1rem; color: var(--text-main); }
        .quiz-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; }
        .quiz-info { display: flex; gap: 1rem; font-size: 0.78rem; color: var(--text-muted); }
        .result-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 700; padding: 0.4rem 0.75rem; border-radius: 8px; }
        .result-badge.good { background: rgba(5,150,105,0.1); color: var(--success); }
        .result-badge.mid { background: rgba(217,119,6,0.1); color: var(--warning); }
        .result-badge.low { background: rgba(220,38,38,0.1); color: var(--danger); }
        .start-btn { display: flex; align-items: center; justify-content: center; gap: 0.4rem; margin-top: auto; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(8px); padding: 1rem; }
        .quiz-modal { width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto; padding: 0; display: flex; flex-direction: column; }
        .quiz-modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid var(--card-border); position: sticky; top: 0; background: var(--card-bg); z-index: 2; }
        .quiz-modal-title { display: flex; align-items: center; gap: 0.75rem; }
        .quiz-modal-title h3 { font-size: 1.05rem; color: var(--text-main); }
        .quiz-modal-title span { font-size: 0.78rem; color: var(--text-muted); display: block; }
        .quiz-timer { display: flex; align-items: center; gap: 0.4rem; font-size: 1.2rem; font-weight: 700; color: var(--primary); padding: 0.4rem 0.85rem; border-radius: 8px; background: rgba(0,121,107,0.08); }
        .quiz-timer.urgent { color: var(--danger); background: rgba(220,38,38,0.08); animation: pulse 1s infinite; }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }

        .quiz-questions { padding: 1.5rem 2rem; display: flex; flex-direction: column; gap: 1.5rem; }
        .question-card { background: rgba(0,0,0,0.02); border: 1px solid var(--card-border); border-radius: 10px; padding: 1.25rem; }
        [data-theme='dark'] .question-card { background: rgba(255,255,255,0.02); }
        .q-label { font-size: 0.72rem; font-weight: 700; color: var(--primary); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 0.5rem; }
        .q-text { font-size: 1rem; color: var(--text-main); font-weight: 500; margin-bottom: 1rem; line-height: 1.5; }
        .options-list { display: flex; flex-direction: column; gap: 0.5rem; }
        .option-label { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--card-border); cursor: pointer; transition: all 0.2s; font-size: 0.9rem; color: var(--text-main); }
        .option-label:hover { border-color: var(--primary); background: rgba(0,121,107,0.04); }
        .option-label.selected { border-color: var(--primary); background: rgba(0,121,107,0.08); font-weight: 500; }
        .option-label input { display: none; }
        .opt-letter { width: 24px; height: 24px; border-radius: 50%; border: 1.5px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
        .option-label.selected .opt-letter { background: var(--primary); color: white; border-color: var(--primary); }
        .quiz-submit-area { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--card-border); }
        .answered-count { font-size: 0.85rem; color: var(--text-muted); }
        .quiz-submit-area .btn { display: flex; align-items: center; gap: 0.4rem; }

        .quiz-result-screen { padding: 2rem; display: flex; flex-direction: column; align-items: center; gap: 1.25rem; }
        .result-circle { width: 140px; height: 140px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 4px solid; gap: 0.2rem; }
        .result-circle.pass { border-color: var(--success); color: var(--success); background: rgba(5,150,105,0.08); }
        .result-circle.fail { border-color: var(--danger); color: var(--danger); background: rgba(220,38,38,0.08); }
        .result-score { font-size: 1.4rem; font-weight: 700; }
        .result-pct { font-size: 0.85rem; font-weight: 600; }
        .quiz-result-screen h3 { font-size: 1.3rem; color: var(--text-main); }
        .quiz-result-screen > p { color: var(--text-muted); font-size: 0.9rem; }
        .result-breakdown { width: 100%; display: flex; flex-direction: column; gap: 0.6rem; max-height: 300px; overflow-y: auto; }
        .result-row { display: flex; align-items: flex-start; gap: 0.75rem; padding: 0.75rem; border-radius: 8px; border: 1px solid var(--card-border); font-size: 0.85rem; }
        .result-row.correct { border-color: rgba(5,150,105,0.3); background: rgba(5,150,105,0.05); }
        .result-row.wrong { border-color: rgba(220,38,38,0.3); background: rgba(220,38,38,0.05); }
        .result-icon { flex-shrink: 0; margin-top: 0.1rem; }
        .result-row.correct .result-icon { color: var(--success); }
        .result-row.wrong .result-icon { color: var(--danger); }
        .result-q { flex: 1; color: var(--text-main); line-height: 1.4; }
        .result-ans { display: flex; flex-direction: column; gap: 0.2rem; text-align: right; }
        .your-ans { color: var(--danger); font-size: 0.78rem; }
        .correct-ans { color: var(--success); font-size: 0.78rem; font-weight: 600; }

        .empty-full { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); text-align: center; grid-column: 1 / -1; }
      `}</style>
    </div>
  );
}
