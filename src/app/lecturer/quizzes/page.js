"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { HelpCircle, Plus, X, Trash2, CheckCircle2 } from 'lucide-react';

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
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Quizzes & Assessments</h2>
          <p>Create quizzes and view how your students are performing.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> Create Quiz
        </button>
      </div>

      {/* Quiz Create Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><HelpCircle size={18} /> Create New Quiz</h3>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Course</label>
                  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required>
                    <option value="">Select course...</option>
                    {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="form-field">
                  <label>Time Limit (minutes)</label>
                  <input type="number" min={5} max={120} value={form.timeLimit} onChange={e => setForm({ ...form, timeLimit: e.target.value })} required />
                </div>
              </div>
              <div className="form-field">
                <label>Quiz Title</label>
                <input type="text" placeholder="e.g. Week 4 Self-Assessment" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Description</label>
                <input type="text" placeholder="Brief description..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>

              <div className="questions-section">
                <div className="questions-header">
                  <h4>Questions ({form.questions.length})</h4>
                  <button type="button" className="btn btn-outline btn-sm" onClick={addQuestion}><Plus size={14} /> Add Question</button>
                </div>
                {form.questions.map((q, qIdx) => (
                  <div key={q.id} className="question-block">
                    <div className="q-header">
                      <span className="q-num">Q{qIdx + 1}</span>
                      <input
                        className="q-input"
                        type="text"
                        placeholder={`Question ${qIdx + 1}...`}
                        value={q.question}
                        onChange={e => updateQuestion(qIdx, 'question', e.target.value)}
                        required
                      />
                      {form.questions.length > 1 && (
                        <button type="button" className="icon-btn danger" onClick={() => removeQuestion(qIdx)}><Trash2 size={15} /></button>
                      )}
                    </div>
                    <div className="options-grid">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className={`option-row ${q.correct === oIdx ? 'correct' : ''}`}>
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correct === oIdx}
                            onChange={() => updateQuestion(qIdx, 'correct', oIdx)}
                          />
                          <input
                            type="text"
                            placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                            value={opt}
                            onChange={e => updateOption(qIdx, oIdx, e.target.value)}
                            required
                          />
                        </div>
                      ))}
                    </div>
                    <p className="q-hint">✓ Select the radio button next to the correct answer.</p>
                  </div>
                ))}
              </div>

              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Quiz</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Results Modal */}
      {viewingResults && (
        <div className="modal-overlay" onClick={() => setViewingResults(null)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Quiz Results — {myQuizzes.find(q => q.id === viewingResults)?.title}</h3>
              <button className="icon-btn" onClick={() => setViewingResults(null)}><X size={20} /></button>
            </div>
            <div className="results-list">
              {quizResults.filter(r => r.quizId === viewingResults).length === 0 ? (
                <p className="empty-state">No students have taken this quiz yet.</p>
              ) : (
                quizResults.filter(r => r.quizId === viewingResults).map(r => {
                  const quiz = myQuizzes.find(q => q.id === r.quizId);
                  const pct = Math.round((r.score / quiz?.questions.length) * 100);
                  return (
                    <div key={r.id} className="result-row">
                      <div className="sub-avatar">{r.studentName?.charAt(0)}</div>
                      <div className="result-info">
                        <strong>{r.studentName}</strong>
                        <span>{new Date(r.submittedAt).toLocaleString()}</span>
                      </div>
                      <div className="result-score">
                        <span className={`score-badge ${pct >= 70 ? 'good' : pct >= 50 ? 'mid' : 'low'}`}>
                          {r.score}/{quiz?.questions.length} ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Quizzes Grid */}
      <div className="quizzes-grid">
        {myQuizzes.length === 0 ? (
          <div className="empty-full glass-panel"><HelpCircle size={40} /><p>No quizzes created yet.</p></div>
        ) : (
          myQuizzes.map(quiz => {
            const course = courses.find(c => c.id === quiz.courseId);
            const results = quizResults.filter(r => r.quizId === quiz.id);
            const avgScore = results.length > 0 ? Math.round(results.reduce((a, r) => a + (r.score / quiz.questions.length) * 100, 0) / results.length) : null;
            return (
              <div key={quiz.id} className="quiz-card glass-panel">
                <div className="quiz-top">
                  <div className="quiz-icon"><HelpCircle size={22} /></div>
                  <div className="quiz-meta">
                    {course && <span className="course-tag" style={{ background: course.color + '22', color: course.color }}>{course.code}</span>}
                    <span className="time-tag">⏱ {quiz.timeLimit} min</span>
                  </div>
                </div>
                <h4>{quiz.title}</h4>
                <p className="quiz-desc">{quiz.description}</p>
                <div className="quiz-stats">
                  <span>{quiz.questions.length} questions</span>
                  <span>{results.length} attempt{results.length !== 1 ? 's' : ''}</span>
                  {avgScore !== null && <span className="avg-score">Avg: {avgScore}%</span>}
                </div>
                <div className="quiz-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setViewingResults(quiz.id)}>
                    <CheckCircle2 size={14} /> View Results
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
        .page-header h2 { font-size: 1.4rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .page-header p { color: var(--text-muted); font-size: 0.9rem; }

        .quizzes-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
        .quiz-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
        .quiz-top { display: flex; justify-content: space-between; align-items: center; }
        .quiz-icon { color: var(--primary); }
        .quiz-meta { display: flex; gap: 0.5rem; }
        .course-tag { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .time-tag { font-size: 0.72rem; color: var(--text-muted); padding: 0.15rem 0.5rem; border-radius: 4px; background: rgba(0,0,0,0.05); }
        [data-theme='dark'] .time-tag { background: rgba(255,255,255,0.07); }
        .quiz-card h4 { font-size: 1rem; color: var(--text-main); }
        .quiz-desc { font-size: 0.82rem; color: var(--text-muted); line-height: 1.5; }
        .quiz-stats { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted); }
        .avg-score { color: var(--primary); font-weight: 600; }
        .quiz-actions { margin-top: auto; }
        .btn-sm { font-size: 0.82rem; padding: 0.4rem 0.9rem; display: inline-flex; align-items: center; gap: 0.4rem; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
        .modal-card { width: 90%; max-width: 680px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--card-border); }
        .modal-header h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; }
        .modal-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-field label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .form-field input, .form-field select { padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.6); color: var(--text-main); font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s; }
        [data-theme='dark'] .form-field input, [data-theme='dark'] .form-field select { background: rgba(17,24,39,0.5); }
        .form-field input:focus, .form-field select:focus { outline: none; border-color: var(--primary); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

        .questions-section { display: flex; flex-direction: column; gap: 1rem; }
        .questions-header { display: flex; justify-content: space-between; align-items: center; }
        .questions-header h4 { font-size: 0.95rem; color: var(--text-main); }
        .question-block { background: rgba(0,0,0,0.03); border: 1px solid var(--card-border); border-radius: 10px; padding: 1rem; display: flex; flex-direction: column; gap: 0.75rem; }
        [data-theme='dark'] .question-block { background: rgba(255,255,255,0.03); }
        .q-header { display: flex; align-items: center; gap: 0.75rem; }
        .q-num { background: var(--primary); color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 0.72rem; font-weight: 700; flex-shrink: 0; }
        .q-input { flex: 1; padding: 0.6rem 0.85rem; border-radius: 8px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.6); color: var(--text-main); font-family: inherit; font-size: 0.88rem; }
        [data-theme='dark'] .q-input { background: rgba(17,24,39,0.5); }
        .q-input:focus { outline: none; border-color: var(--primary); }
        .options-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .option-row { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; border-radius: 6px; border: 1px solid var(--card-border); }
        .option-row.correct { border-color: var(--success); background: rgba(5,150,105,0.05); }
        .option-row input[type="text"] { flex: 1; border: none; background: transparent; color: var(--text-main); font-family: inherit; font-size: 0.85rem; padding: 0; }
        .option-row input[type="text"]:focus { outline: none; }
        .q-hint { font-size: 0.72rem; color: var(--text-muted); font-style: italic; }

        .results-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .result-row { display: flex; align-items: center; gap: 1rem; padding: 0.85rem; border-radius: 8px; border: 1px solid var(--card-border); }
        .sub-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; font-weight: 700; flex-shrink: 0; }
        .result-info { flex: 1; display: flex; flex-direction: column; }
        .result-info strong { font-size: 0.9rem; color: var(--text-main); }
        .result-info span { font-size: 0.76rem; color: var(--text-muted); }
        .score-badge { font-size: 0.82rem; font-weight: 700; padding: 0.3rem 0.75rem; border-radius: 20px; }
        .score-badge.good { background: rgba(5,150,105,0.1); color: var(--success); }
        .score-badge.mid { background: rgba(217,119,6,0.1); color: var(--warning); }
        .score-badge.low { background: rgba(220,38,38,0.1); color: var(--danger); }

        .empty-full { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); text-align: center; grid-column: 1 / -1; }
        .empty-state { text-align: center; color: var(--text-muted); padding: 2rem; }
        .icon-btn { background: transparent; border: none; cursor: pointer; padding: 0.4rem; border-radius: 6px; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; }
        .icon-btn.danger { color: var(--danger); }
        .icon-btn.danger:hover { background: rgba(220,38,38,0.08); }
      `}</style>
    </div>
  );
}
