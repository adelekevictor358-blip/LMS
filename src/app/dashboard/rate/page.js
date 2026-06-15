"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Star, AlertTriangle, CheckCircle2, UserSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function RateLecturer() {
  const { user, courses, getAllUsers, lecturerRatings, submitRating, getStudentCourseIds, getLecturerRegisteredCourses } = useStore();
  const allUsers = getAllUsers();
  const lecturers = allUsers.filter(u => u.role === 'lecturer');
  const [selected, setSelected] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const getLecturerCourses = (lecturerId) => getLecturerRegisteredCourses(lecturerId);
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

  const ratingLabel = (value) =>
    value === 1 ? 'Poor' : value === 2 ? 'Below average' : value === 3 ? 'Average' : value === 4 ? 'Good' : 'Excellent';

  return (
    <main className="flex flex-col gap-8 animate-fade-in">
      <header>
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Rate your lecturers
        </h1>
        <p className="mt-1 max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
          Your feedback helps improve the quality of teaching. All ratings are anonymous.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[320px_1fr]">
        {/* Lecturers list */}
        <section aria-label="Lecturers" className="flex flex-col gap-3">
          {lecturers.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card p-8 text-center">
              <UserSquare size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No lecturers are available to rate right now.</p>
            </div>
          ) : (
            lecturers.map(lecturer => {
              const avg = getAvgRating(lecturer.id);
              const lecturerCourses = getLecturerCourses(lecturer.id);
              const isActive = selected?.id === lecturer.id;
              return (
                <button
                  key={lecturer.id}
                  type="button"
                  aria-pressed={isActive}
                  className={`group relative flex items-center gap-4 overflow-hidden rounded-xl border bg-card p-4 text-left shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${
                    isActive ? 'border-primary/60' : 'border-border hover:border-primary/40'
                  }`}
                  onClick={() => { setSelected(lecturer); setSelectedCourse(''); setRating(0); setComment(''); setSubmitted(false); }}
                >
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                    {lecturer.avatar}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-card-foreground">
                      {lecturer.title || 'Dr.'} {lecturer.name}
                    </span>
                    <span className="block truncate text-xs font-medium text-brand-green">{lecturer.department}</span>
                    <span className="mt-1 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">
                        {lecturerCourses.length} course{lecturerCourses.length !== 1 ? 's' : ''}
                      </span>
                      {avg && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gold tabular-nums">
                          <Star size={12} className="fill-current" strokeWidth={0} aria-hidden="true" />
                          {avg}
                        </span>
                      )}
                    </span>
                  </span>
                  {isActive && (
                    <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1 rounded-l-none rounded-r-xl bg-primary" />
                  )}
                </button>
              );
            })
          )}
        </section>

        {/* Rating form */}
        <section aria-label="Rating form" className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {!selected ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
              <Star size={40} strokeWidth={1.5} className="text-muted-foreground" />
              <h2 className="text-lg font-semibold text-foreground">Select a lecturer to rate</h2>
              <p className="max-w-prose text-sm text-muted-foreground">
                Choose any lecturer from the list to submit your feedback.
              </p>
            </div>
          ) : submitted ? (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
              <CheckCircle2 size={44} strokeWidth={1.5} className="text-success" />
              <h2 className="text-lg font-semibold text-foreground">Thanks for your feedback</h2>
              <p className="max-w-prose text-sm text-muted-foreground">
                Your rating for {selected.title || 'Dr.'} {selected.name} has been recorded.
              </p>
            </div>
          ) : (
            <>
              <header className="flex items-center gap-4 border-b border-border pb-5">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary text-base font-semibold text-primary-foreground">
                  {selected.avatar}
                </span>
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold text-foreground">{selected.title || 'Dr.'} {selected.name}</h2>
                  <p className="truncate text-sm text-muted-foreground">{[selected.department, selected.office].filter(Boolean).join(' · ')}</p>
                </div>
              </header>

              <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="rate-course" className="text-sm font-medium text-foreground">Course</label>
                  <select
                    id="rate-course"
                    value={selectedCourse}
                    onChange={e => setSelectedCourse(e.target.value)}
                    required
                    className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="">Select the course you&apos;re rating for</option>
                    {getLecturerCourses(selected.id).map(c => (
                      <option key={c.id} value={c.id}>{c.code} — {c.title}</option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-foreground">Your rating</label>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map(s => {
                      const filled = s <= (hovered || rating);
                      return (
                        <button
                          key={s}
                          type="button"
                          aria-label={`${s} star${s !== 1 ? 's' : ''}`}
                          className="rounded-md p-1 transition-transform focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring active:translate-y-px"
                          onMouseEnter={() => setHovered(s)}
                          onMouseLeave={() => setHovered(0)}
                          onClick={() => setRating(s)}
                        >
                          <Star
                            size={28}
                            strokeWidth={1.5}
                            className={filled ? 'text-gold fill-current' : 'text-muted-foreground/40'}
                          />
                        </button>
                      );
                    })}
                  </div>
                  {rating > 0 && (
                    <span className="text-sm font-medium text-brand-green">{ratingLabel(rating)}</span>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="rate-comment" className="text-sm font-medium text-foreground">Comments (optional)</label>
                  <Textarea
                    id="rate-comment"
                    rows={5}
                    placeholder="Share your experience, what you liked, or suggestions for improvement"
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                  />
                </div>

                {selectedCourse && hasRated(selected.id, selectedCourse) && (
                  <div className="flex items-start gap-2 rounded-md border border-transparent bg-warning/10 px-3 py-2.5 text-sm text-warning">
                    <AlertTriangle size={16} strokeWidth={2} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <span>You&apos;ve already rated this lecturer for this course. Submitting will update your previous rating.</span>
                  </div>
                )}

                <Button type="submit" className="active:translate-y-px" disabled={rating === 0 || !selectedCourse}>
                  <Star size={16} aria-hidden="true" /> Submit rating
                </Button>
              </form>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
