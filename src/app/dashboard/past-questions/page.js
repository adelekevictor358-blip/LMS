"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

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
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground">Past questions</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
          Review previous exam and test questions to prepare for your assessments.
        </p>
      </header>

      {/* Filter */}
      <section className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4 text-card-foreground">
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <BookOpen size={16} strokeWidth={1.5} />
          Filter by course
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilterCourse('all')}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
              filterCourse === 'all'
                ? 'border-transparent bg-primary text-primary-foreground'
                : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
            }`}
          >
            All level courses
          </button>
          {myCourses.map(c => {
            const active = filterCourse === String(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setFilterCourse(String(c.id))}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                  active
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border bg-transparent text-muted-foreground hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} aria-hidden="true" />
                {c.code}
              </button>
            );
          })}
        </div>
      </section>

      {/* Past Questions */}
      <section className="space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
            <Archive size={40} strokeWidth={1.5} className="text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No past questions available for this course yet.</p>
          </div>
        ) : (
          filtered.map(pq => {
            const course = courses.find(c => c.id === pq.courseId);
            const isOpen = expanded[pq.id];
            return (
              <div key={pq.id} className="overflow-hidden rounded-xl border border-border bg-card text-card-foreground transition-colors hover:border-primary/40">
                <button
                  type="button"
                  onClick={() => toggle(pq.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <div className="flex min-w-0 flex-1 items-center gap-4">
                    <span className="h-12 w-1.5 flex-shrink-0 rounded-full" style={{ background: course?.color }} aria-hidden="true" />
                    <div className="flex min-w-0 flex-col gap-2">
                      {course && (
                        <span className="flex w-fit items-center gap-1.5 text-sm font-semibold text-foreground">
                          <span className="h-2 w-2 flex-shrink-0 rounded-full" style={{ background: course.color }} aria-hidden="true" />
                          {course.code} — {course.title}
                        </span>
                      )}
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                        <span className="tabular-nums">{pq.year}</span>
                        <span>{pq.semester} semester</span>
                        <Badge
                          variant="outline"
                          className={`rounded-md border-transparent ${
                            pq.type === 'Practical'
                              ? 'bg-brand-purple-soft text-brand-purple'
                              : 'bg-info/10 text-info'
                          }`}
                        >
                          {pq.type}
                        </Badge>
                        <span className="tabular-nums">
                          {pq.questions.length} question{pq.questions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="flex flex-shrink-0 items-center text-muted-foreground" aria-hidden="true">
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </span>
                </button>

                {isOpen && (
                  <div className="border-t border-border px-5 pb-5 pt-5">
                    <ol className="flex flex-col gap-4">
                      {pq.questions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold tabular-nums text-primary-foreground">
                            {idx + 1}
                          </span>
                          <p className="flex-1 text-sm leading-relaxed text-foreground text-pretty">{q}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}
