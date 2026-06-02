"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';

export default function PastQuestions() {
  const { user, courses, pastQuestions } = useStore();
  const [filterCourse, setFilterCourse] = useState('all');
  const [expanded, setExpanded] = useState({});

  const myCourses = courses.filter(c => c.level === user?.level);
  const myCourseIds = myCourses.map(c => c.id);

  const filtered = (filterCourse === 'all' ? pastQuestions : pastQuestions.filter(p => p.courseId === parseInt(filterCourse)))
    .filter(pq => myCourseIds.includes(pq.courseId));

  const toggle = (id) => setExpanded(e => ({ ...e, [id]: !e[id] }));

  return (
    <div className="page-container animate-fade-in">
      <div className="page-header">
        <div>
          <h2>Past Questions</h2>
          <p>Review previous exam and test questions to prepare for your assessments.</p>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar glass-panel">
        <BookOpen size={15} />
        <span>Filter by Course:</span>
        <div className="filter-pills">
          <button className={`pill ${filterCourse === 'all' ? 'active' : ''}`} onClick={() => setFilterCourse('all')}>All Level Courses</button>
          {myCourses.map(c => (
            <button key={c.id} className={`pill ${filterCourse === String(c.id) ? 'active' : ''}`} onClick={() => setFilterCourse(String(c.id))} style={filterCourse === String(c.id) ? { background: c.color, borderColor: c.color } : {}}>
              {c.code}
            </button>
          ))}
        </div>
      </div>

      {/* Past Questions */}
      <div className="pq-list">
        {filtered.length === 0 ? (
          <div className="empty-full glass-panel"><Archive size={40} /><p>No past questions available for this course yet.</p></div>
        ) : (
          filtered.map(pq => {
            const course = courses.find(c => c.id === pq.courseId);
            const isOpen = expanded[pq.id];
            return (
              <div key={pq.id} className="pq-card glass-panel">
                <div className="pq-header" onClick={() => toggle(pq.id)}>
                  <div className="pq-header-left">
                    <div className="pq-accent" style={{ background: course?.color }}></div>
                    <div className="pq-meta">
                      {course && <span className="course-tag" style={{ background: course.color + '22', color: course.color }}>{course.code} — {course.title}</span>}
                      <div className="pq-details">
                        <span className="pq-year">📅 {pq.year}</span>
                        <span className="pq-semester">{pq.semester} Semester</span>
                        <span className={`pq-type ${pq.type.toLowerCase()}`}>{pq.type}</span>
                        <span className="pq-count">{pq.questions.length} question{pq.questions.length !== 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  </div>
                  <button className="expand-btn">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {isOpen && (
                  <div className="pq-body">
                    <ol className="question-list">
                      {pq.questions.map((q, idx) => (
                        <li key={idx} className="question-item">
                          <span className="q-num-badge">{idx + 1}</span>
                          <p>{q}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      <style jsx>{`
        .page-container { display: flex; flex-direction: column; gap: 1.5rem; }
        .page-header h2 { font-size: 1.4rem; color: var(--text-main); margin-bottom: 0.2rem; }
        .page-header p { color: var(--text-muted); font-size: 0.9rem; }

        .filter-bar { padding: 1rem 1.5rem; display: flex; align-items: center; gap: 0.85rem; flex-wrap: wrap; font-size: 0.85rem; font-weight: 600; color: var(--text-muted); }
        .filter-pills { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .pill { padding: 0.3rem 0.85rem; border-radius: 20px; border: 1px solid var(--card-border); background: transparent; color: var(--text-muted); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .pill.active { background: var(--primary); color: white; border-color: var(--primary); }
        .pill:hover:not(.active) { border-color: var(--primary); color: var(--primary); }

        .pq-list { display: flex; flex-direction: column; gap: 0.85rem; }
        .pq-card { overflow: hidden; }
        .pq-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; cursor: pointer; transition: background 0.2s; }
        .pq-header:hover { background: rgba(0,0,0,0.02); }
        [data-theme='dark'] .pq-header:hover { background: rgba(255,255,255,0.02); }
        .pq-header-left { display: flex; align-items: center; gap: 1rem; flex: 1; min-width: 0; }
        .pq-accent { width: 5px; height: 50px; border-radius: 3px; flex-shrink: 0; }
        .pq-meta { display: flex; flex-direction: column; gap: 0.4rem; }
        .course-tag { font-size: 0.78rem; font-weight: 700; padding: 0.15rem 0.55rem; border-radius: 4px; width: fit-content; }
        .pq-details { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }
        .pq-year, .pq-semester, .pq-count { font-size: 0.8rem; color: var(--text-muted); }
        .pq-type { font-size: 0.72rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 4px; }
        .pq-type.theory { background: rgba(15,82,186,0.1); color: #0f52ba; }
        .pq-type.practical { background: rgba(130,65,249,0.1); color: #8241f9; }
        .expand-btn { background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; flex-shrink: 0; }
        .expand-btn:hover { background: var(--nav-active); }

        .pq-body { padding: 0 1.5rem 1.5rem 1.5rem; border-top: 1px solid var(--card-border); padding-top: 1.25rem; animation: slideDown 0.2s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-8px); } to { opacity: 1; transform: translateY(0); } }
        .question-list { list-style: none; display: flex; flex-direction: column; gap: 1rem; }
        .question-item { display: flex; align-items: flex-start; gap: 1rem; }
        .q-num-badge { width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: white; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; flex-shrink: 0; margin-top: 0.1rem; }
        .question-item p { font-size: 0.92rem; color: var(--text-main); line-height: 1.6; flex: 1; }

        .empty-full { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; padding: 4rem; color: var(--text-muted); text-align: center; }
      `}</style>
    </div>
  );
}
