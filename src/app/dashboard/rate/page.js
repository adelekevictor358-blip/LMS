"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Star, MessageSquare, CheckCircle2 } from 'lucide-react';

export default function RateLecturer() {
  const { user, courses, lecturerRatings, submitRating, getAllUsers } = useStore();
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(u => u.role === 'lecturer');
  const [selected, setSelected] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const getLecturerCourses = (lecturerId) => courses.filter(c => c.lecturerId === lecturerId);
  const getAvgRating = (lecturerId) => {
    const ratings = lecturerRatings.filter(r => r.lecturerId === lecturerId);
    if (ratings.length === 0) return null;
    return (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1);
  };
  const hasRated = (lecturerId, courseId) =>
    lecturerRatings.some(r => r.lecturerId === lecturerId && r.studentId === user?.id && r.courseId === parseInt(courseId));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected || !selectedCourse || rating === 0) return;
    submitRating(selected.id, parseInt(selectedCourse), rating, comment);
    setSubmitted(true);
    setTimeout(() => { setSubmitted(false); setSelected(null); setRating(0); setComment(''); setSelectedCourse(''); }, 3000);
  };

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Rate Your Lecturers</h2>
          <p>Your feedback helps improve the quality of teaching. All ratings are anonymous.</p>
        </div>
      </div>

      <div className="rate-layout">
        {/* Lecturers List */}
        <div className="lecturers-col">
          {lecturers.map(lecturer => {
            const avg = getAvgRating(lecturer.id);
            const lecturerCourses = getLecturerCourses(lecturer.id);
            return (
              <div
                key={lecturer.id}
                className={`lecturer-card glass-panel ${selected?.id === lecturer.id ? 'active' : ''}`}
                onClick={() => { setSelected(lecturer); setSelectedCourse(''); setRating(0); setComment(''); setSubmitted(false); }}
              >
                <div className="lec-avatar">{lecturer.avatar}</div>
                <div className="lec-body">
                  <strong>{lecturer.title} {lecturer.name}</strong>
                  <span className="lec-dept">{lecturer.department}</span>
                  <div className="lec-meta">
                    <span className="lec-courses">{lecturerCourses.length} course{lecturerCourses.length !== 1 ? 's' : ''}</span>
                    {avg && (
                      <span className="lec-avg">
                        {'★'.repeat(Math.round(parseFloat(avg)))}{'☆'.repeat(5 - Math.round(parseFloat(avg)))} {avg}
                      </span>
                    )}
                  </div>
                </div>
                {selected?.id === lecturer.id && <div className="selected-indicator"></div>}
              </div>
            );
          })}
        </div>

        {/* Rating Form */}
        <div className="rating-col glass-panel">
          {!selected ? (
            <div className="select-prompt">
              <Star size={48} />
              <h3>Select a lecturer to rate</h3>
              <p>Click on any lecturer from the left to submit your feedback.</p>
            </div>
          ) : submitted ? (
            <div className="success-screen">
              <CheckCircle2 size={56} color="var(--success)" />
              <h3>Thank you for your feedback!</h3>
              <p>Your rating for {selected.title} {selected.name} has been recorded.</p>
            </div>
          ) : (
            <>
              <div className="form-header">
                <div className="form-lec-info">
                  <div className="lec-avatar large">{selected.avatar}</div>
                  <div>
                    <h3>{selected.title} {selected.name}</h3>
                    <span>{selected.department} · {selected.office}</span>
                  </div>
                </div>
              </div>
              <form onSubmit={handleSubmit} className="rating-form">
                <div className="form-field">
                  <label>Course</label>
                  <select value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)} required>
                    <option value="">Select the course you're rating for...</option>
                    {getLecturerCourses(selected.id).map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="star-rating-section">
                  <label>Your Rating</label>
                  <div className="stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        className={`star-btn ${s <= (hovered || rating) ? 'active' : ''}`}
                        onMouseEnter={() => setHovered(s)}
                        onMouseLeave={() => setHovered(0)}
                        onClick={() => setRating(s)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <span className="rating-label">
                      {rating === 1 ? 'Poor' : rating === 2 ? 'Below Average' : rating === 3 ? 'Average' : rating === 4 ? 'Good' : 'Excellent'}
                    </span>
                  )}
                </div>

                <div className="form-field">
                  <label>Comments (optional)</label>
                  <textarea rows={5} placeholder="Share your experience, what you liked, or suggestions for improvement..." value={comment} onChange={e => setComment(e.target.value)} />
                </div>

                {selectedCourse && hasRated(selected.id, selectedCourse) && (
                  <div className="already-rated-notice">
                    ⚠️ You've already rated this lecturer for this course. Submitting will update your previous rating.
                  </div>
                )}

                <button type="submit" className="btn btn-primary submit-btn" disabled={rating === 0 || !selectedCourse}>
                  <Star size={16} /> Submit Rating
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header h2 { font-size: 1.4rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .page-header p { color: var(--text-muted); font-size: 0.9rem; }

        .rate-layout { display: grid; grid-template-columns: 320px 1fr; gap: 1.5rem; min-height: 400px; }

        .lecturers-col { display: flex; flex-direction: column; gap: 0.75rem; }
        .lecturer-card { padding: 1.25rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: all 0.2s; position: relative; overflow: hidden; }
        .lecturer-card:hover { transform: translateY(-2px); }
        .lecturer-card.active { border-color: var(--primary); background: rgba(0,121,107,0.04); }
        .lec-avatar { width: 42px; height: 42px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 700; flex-shrink: 0; }
        .lec-avatar.large { width: 52px; height: 52px; font-size: 1rem; }
        .lec-body { flex: 1; min-width: 0; }
        .lec-body strong { font-size: 0.9rem; color: var(--text-main); display: block; }
        .lec-dept { font-size: 0.76rem; color: var(--primary); font-weight: 600; }
        .lec-meta { display: flex; gap: 0.75rem; align-items: center; margin-top: 0.25rem; }
        .lec-courses { font-size: 0.75rem; color: var(--text-muted); }
        .lec-avg { font-size: 0.75rem; color: #f0b429; font-weight: 600; }
        .selected-indicator { position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: var(--primary); border-radius: 0 12px 12px 0; }

        .rating-col { padding: 2rem; display: flex; flex-direction: column; }
        .select-prompt, .success-screen { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); text-align: center; padding: 2rem; }
        .select-prompt h3, .success-screen h3 { font-size: 1.2rem; color: var(--text-main); }
        .select-prompt p, .success-screen p { font-size: 0.9rem; }

        .form-header { margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid var(--card-border); }
        .form-lec-info { display: flex; align-items: center; gap: 1rem; }
        .form-lec-info h3 { font-size: 1.15rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .form-lec-info span { font-size: 0.82rem; color: var(--text-muted); }

        .rating-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-field { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-field label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .form-field select, .form-field textarea { padding: 0.75rem 1rem; border-radius: 8px; border: 1px solid var(--card-border); background: rgba(255,255,255,0.6); color: var(--text-main); font-family: inherit; font-size: 0.9rem; resize: none; transition: border-color 0.2s; }
        [data-theme='dark'] .form-field select, [data-theme='dark'] .form-field textarea { background: rgba(17,24,39,0.5); }
        .form-field select:focus, .form-field textarea:focus { outline: none; border-color: var(--primary); }

        .star-rating-section { display: flex; flex-direction: column; gap: 0.6rem; }
        .star-rating-section label { font-size: 0.85rem; font-weight: 600; color: var(--text-main); }
        .stars { display: flex; gap: 0.25rem; }
        .star-btn { background: transparent; border: none; font-size: 2rem; cursor: pointer; color: #d1d5db; transition: all 0.15s; line-height: 1; padding: 0 0.1rem; }
        .star-btn.active { color: #f0b429; transform: scale(1.1); }
        .rating-label { font-size: 0.88rem; font-weight: 600; color: var(--primary); }

        .already-rated-notice { font-size: 0.83rem; color: var(--warning); background: rgba(217,119,6,0.08); border-left: 3px solid var(--warning); padding: 0.75rem 1rem; border-radius: 4px; }

        .submit-btn { display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; font-size: 1rem; }
        .submit-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        @media (max-width: 900px) { .rate-layout { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
