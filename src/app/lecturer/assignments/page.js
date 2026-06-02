"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { ClipboardList, Plus, X, CheckCircle2, Clock, Eye, Star, MessageSquare } from 'lucide-react';

export default function LecturerAssignments() {
  const { user, courses, assignments, submissions, addAssignment, gradeSubmission } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myAssignments = assignments.filter(a => a.createdBy === user?.id);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('assignments');
  const [viewingSubmissions, setViewingSubmissions] = useState(null);
  const [gradingSubmission, setGradingSubmission] = useState(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });
  const [form, setForm] = useState({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 });

  const handleCreate = (e) => {
    e.preventDefault();
    addAssignment({ ...form, courseId: parseInt(form.courseId), maxScore: parseInt(form.maxScore), createdBy: user.id });
    setForm({ courseId: '', title: '', description: '', dueDate: '', maxScore: 100 });
    setShowForm(false);
  };

  const handleGrade = (e) => {
    e.preventDefault();
    gradeSubmission(gradingSubmission.id, parseInt(gradeForm.score), gradeForm.feedback);
    setGradingSubmission(null);
    setGradeForm({ score: '', feedback: '' });
  };

  const getAssignmentSubmissions = (assignmentId) => submissions.filter(s => s.assignmentId === assignmentId);

  const allSubmissions = submissions.filter(s => myAssignments.some(a => a.id === s.assignmentId));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Assignments</h2>
          <p>Create assignments, review submissions, and grade your students.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          <Plus size={16} /> New Assignment
        </button>
      </div>

      {/* Tabs */}
      <div className="tabs glass-panel">
        <button className={`tab ${activeTab === 'assignments' ? 'active' : ''}`} onClick={() => setActiveTab('assignments')}>
          <ClipboardList size={16} /> My Assignments ({myAssignments.length})
        </button>
        <button className={`tab ${activeTab === 'submissions' ? 'active' : ''}`} onClick={() => setActiveTab('submissions')}>
          <Eye size={16} /> All Submissions ({allSubmissions.length})
          {allSubmissions.filter(s => s.score === null).length > 0 && (
            <span className="tab-badge">{allSubmissions.filter(s => s.score === null).length} pending</span>
          )}
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><ClipboardList size={18} /> Create Assignment</h3>
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
                  <label>Max Score</label>
                  <input type="number" min={1} max={200} value={form.maxScore} onChange={e => setForm({ ...form, maxScore: e.target.value })} required />
                </div>
              </div>
              <div className="form-field">
                <label>Assignment Title</label>
                <input type="text" placeholder="e.g. Mid-Semester Project" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Instructions</label>
                <textarea rows={4} placeholder="Detailed instructions for students..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required />
              </div>
              <div className="form-field">
                <label>Due Date & Time</label>
                <input type="datetime-local" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Assignment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Modal */}
      {gradingSubmission && (
        <div className="modal-overlay" onClick={() => setGradingSubmission(null)}>
          <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3><Star size={18} /> Grade Submission — {gradingSubmission.studentName}</h3>
              <button className="icon-btn" onClick={() => setGradingSubmission(null)}><X size={20} /></button>
            </div>
            <div className="submission-preview">
              <div className="preview-label">Student's Answer:</div>
              <div className="preview-text">{gradingSubmission.content}</div>
            </div>
            <form onSubmit={handleGrade} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label>Score (max: {myAssignments.find(a => a.id === gradingSubmission.assignmentId)?.maxScore})</label>
                  <input type="number" min={0} max={myAssignments.find(a => a.id === gradingSubmission.assignmentId)?.maxScore} value={gradeForm.score} onChange={e => setGradeForm({ ...gradeForm, score: e.target.value })} required />
                </div>
              </div>
              <div className="form-field">
                <label>Feedback / Comments</label>
                <textarea rows={3} placeholder="Provide comments to help the student improve..." value={gradeForm.feedback} onChange={e => setGradeForm({ ...gradeForm, feedback: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-outline" onClick={() => setGradingSubmission(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary"><CheckCircle2 size={15} /> Submit Grade</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="assignments-list">
          {myAssignments.length === 0 ? (
            <div className="empty-full glass-panel"><ClipboardList size={40} /><p>No assignments created yet.</p></div>
          ) : (
            myAssignments.map(asgn => {
              const course = courses.find(c => c.id === asgn.courseId);
              const subs = getAssignmentSubmissions(asgn.id);
              const isOverdue = new Date(asgn.dueDate) < new Date();
              return (
                <div key={asgn.id} className="assignment-card glass-panel">
                  <div className="asgn-left">
                    <div className="asgn-course-dot" style={{ background: course?.color }}></div>
                    <div className="asgn-info">
                      <div className="asgn-meta">
                        <span className="asgn-course-tag" style={{ background: course?.color + '22', color: course?.color }}>{course?.code}</span>
                        <span className={`asgn-status ${isOverdue ? 'closed' : 'active'}`}>{isOverdue ? 'Closed' : 'Active'}</span>
                      </div>
                      <h4>{asgn.title}</h4>
                      <p className="asgn-desc">{asgn.description.slice(0, 120)}...</p>
                      <div className="asgn-stats">
                        <span><Clock size={13} /> Due: {new Date(asgn.dueDate).toLocaleDateString()}</span>
                        <span>Max: {asgn.maxScore} pts</span>
                        <span>{subs.length} submission{subs.length !== 1 ? 's' : ''}</span>
                        <span className="pending-count">{subs.filter(s => s.score === null).length} ungraded</span>
                      </div>
                    </div>
                  </div>
                  <button className="btn btn-outline" onClick={() => { setViewingSubmissions(asgn.id); setActiveTab('submissions'); }}>
                    View Submissions
                  </button>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Submissions Tab */}
      {activeTab === 'submissions' && (
        <div className="submissions-list">
          {allSubmissions.length === 0 ? (
            <div className="empty-full glass-panel"><Eye size={40} /><p>No submissions yet.</p></div>
          ) : (
            allSubmissions.map(sub => {
              const asgn = myAssignments.find(a => a.id === sub.assignmentId);
              const course = courses.find(c => c.id === asgn?.courseId);
              return (
                <div key={sub.id} className="submission-card glass-panel">
                  <div className="sub-avatar">{sub.studentName?.charAt(0)}</div>
                  <div className="sub-body">
                    <div className="sub-meta">
                      <strong>{sub.studentName}</strong>
                      {course && <span className="asgn-course-tag" style={{ background: course.color + '22', color: course.color }}>{course.code}</span>}
                    </div>
                    <p className="sub-asgn-title">{asgn?.title}</p>
                    <p className="sub-preview">{sub.content.slice(0, 100)}...</p>
                    <span className="sub-date"><Clock size={12} /> Submitted: {new Date(sub.submittedAt).toLocaleString()}</span>
                  </div>
                  <div className="sub-right">
                    {sub.score !== null ? (
                      <div className="graded-badge">
                        <CheckCircle2 size={15} />
                        <span>{sub.score}/{asgn?.maxScore}</span>
                      </div>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => { setGradingSubmission(sub); setGradeForm({ score: '', feedback: '' }); }}>
                        <Star size={14} /> Grade
                      </button>
                    )}
                    {sub.feedback && <p className="sub-feedback"><MessageSquare size={12} /> {sub.feedback}</p>}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <style jsx>{`
        .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; }
        .page-header h2 { font-size: 1.4rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .page-header p { color: var(--text-muted); font-size: 0.9rem; }

        .tabs { display: flex; gap: 0.5rem; padding: 0.75rem; }
        .tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.1rem; border-radius: 8px; border: none; background: transparent; color: var(--text-muted); font-size: 0.88rem; font-weight: 500; cursor: pointer; transition: all 0.2s; }
        .tab.active { background: var(--primary); color: white; }
        .tab:hover:not(.active) { background: var(--nav-active); color: var(--text-main); }
        .tab-badge { background: var(--warning); color: white; font-size: 0.65rem; font-weight: 700; padding: 0.1rem 0.45rem; border-radius: 10px; }

        .assignments-list, .submissions-list { display: flex; flex-direction: column; gap: 1rem; }
        .assignment-card { padding: 1.5rem; display: flex; align-items: center; gap: 1.25rem; justify-content: space-between; flex-wrap: wrap; }
        .asgn-left { display: flex; align-items: flex-start; gap: 1rem; flex: 1; min-width: 0; }
        .asgn-course-dot { width: 12px; height: 12px; border-radius: 4px; flex-shrink: 0; margin-top: 0.3rem; }
        .asgn-info { flex: 1; min-width: 0; }
        .asgn-meta { display: flex; gap: 0.5rem; align-items: center; margin-bottom: 0.4rem; }
        .asgn-course-tag { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .asgn-status { font-size: 0.7rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 10px; }
        .asgn-status.active { background: rgba(5,150,105,0.1); color: var(--success); }
        .asgn-status.closed { background: rgba(107,114,128,0.1); color: var(--text-muted); }
        .asgn-info h4 { font-size: 1rem; color: var(--text-main); margin-bottom: 0.3rem; }
        .asgn-desc { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.6rem; line-height: 1.5; }
        .asgn-stats { display: flex; gap: 1rem; flex-wrap: wrap; font-size: 0.78rem; color: var(--text-muted); }
        .pending-count { color: var(--warning); font-weight: 600; }

        .submission-card { padding: 1.25rem; display: flex; align-items: flex-start; gap: 1rem; }
        .sub-avatar { width: 40px; height: 40px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 700; flex-shrink: 0; }
        .sub-body { flex: 1; min-width: 0; }
        .sub-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.3rem; }
        .sub-meta strong { font-size: 0.95rem; color: var(--text-main); }
        .sub-asgn-title { font-size: 0.85rem; color: var(--primary); font-weight: 500; margin-bottom: 0.3rem; }
        .sub-preview { font-size: 0.82rem; color: var(--text-muted); margin-bottom: 0.4rem; line-height: 1.5; }
        .sub-date { font-size: 0.75rem; color: var(--text-muted); display: flex; align-items: center; gap: 0.3rem; }
        .sub-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0.5rem; flex-shrink: 0; }
        .graded-badge { display: flex; align-items: center; gap: 0.3rem; background: rgba(5,150,105,0.1); color: var(--success); padding: 0.35rem 0.75rem; border-radius: 8px; font-weight: 700; font-size: 0.9rem; }
        .sub-feedback { font-size: 0.76px; color: var(--text-muted); max-width: 200px; text-align: right; display: flex; align-items: center; gap: 0.3rem; }
        .btn-sm { font-size: 0.82rem; padding: 0.4rem 0.9rem; }

        .submission-preview { background: rgba(0,0,0,0.03); border: 1px solid var(--card-border); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem; }
        [data-theme='dark'] .submission-preview { background: rgba(255,255,255,0.03); }
        .preview-label { font-size: 0.78rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 0.5rem; }
        .preview-text { font-size: 0.9rem; color: var(--text-main); line-height: 1.6; }

        .empty-full { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); text-align: center; }

        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.55); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(6px); }
        .modal-card { width: 90%; max-width: 620px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; padding-bottom: 1rem; border-bottom: 1px solid var(--card-border); }
        .modal-header h3 { display: flex; align-items: center; gap: 0.5rem; font-size: 1.1rem; }
        .modal-form { display: flex; flex-direction: column; gap: 1rem; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-field label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .form-field input, .form-field select, .form-field textarea { padding: 0.7rem 0.9rem; border-radius: 8px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.6); color: var(--text-main); font-family: inherit; font-size: 0.9rem; transition: border-color 0.2s; }
        [data-theme='dark'] .form-field input, [data-theme='dark'] .form-field select, [data-theme='dark'] .form-field textarea { background: rgba(17,24,39,0.5); }
        .form-field input:focus, .form-field select:focus, .form-field textarea:focus { outline: none; border-color: var(--primary); }
        .modal-actions { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 0.5rem; }

        .icon-btn { background: transparent; border: none; cursor: pointer; padding: 0.4rem; border-radius: 6px; color: var(--text-muted); transition: all 0.2s; display: flex; align-items: center; }
        .icon-btn:hover { background: rgba(0,0,0,0.05); }
      `}</style>
    </div>
  );
}
