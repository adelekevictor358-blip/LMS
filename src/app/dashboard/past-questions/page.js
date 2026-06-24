"use client";

import { useStore } from '@/store/useStore';
import { useMemo, useState } from 'react';
import { Archive, Search, Eye, Download, FileText, FilterX, ListChecks } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem } from '@/components/ui/select';

const SEMESTER_LABEL = { '1st': '1st semester', '2nd': '2nd semester' };
const EXAM_LABEL = { mid: 'Mid-semester', final: 'Final exam' };

// Resolve a usable href for a past-question resource: an external URL is
// preferred; otherwise fall back to an inline base64 data URL.
function resourceHref(url, data) {
  if (url && url.trim()) return url.trim();
  if (data) return data;
  return null;
}

export default function PastQuestions() {
  const getPastQuestions = useStore((s) => s.getPastQuestions);
  // Subscribe to the array itself so the view re-renders on visibility changes.
  const pastQuestions = useStore((s) => s.pastQuestions);

  const [search, setSearch] = useState('');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterYear, setFilterYear] = useState('all');
  const [filterSemester, setFilterSemester] = useState('all');
  const [filterExam, setFilterExam] = useState('all');

  // Cross-department: all visible records, newest-first. We read `pastQuestions`
  // so the memo recomputes whenever a record is added or its visibility flips.
  const all = useMemo(() => {
    void pastQuestions;
    return getPastQuestions();
  }, [getPastQuestions, pastQuestions]);

  // Distinct option lists derived from the live archive.
  const courseOptions = useMemo(() => {
    const map = new Map();
    all.forEach((p) => {
      if (p.courseCode && !map.has(p.courseCode)) map.set(p.courseCode, p.courseTitle || '');
    });
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [all]);

  const yearOptions = useMemo(
    () => [...new Set(all.map((p) => p.year).filter(Boolean))].sort().reverse(),
    [all]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return all.filter((p) => {
      if (filterCourse !== 'all' && p.courseCode !== filterCourse) return false;
      if (filterYear !== 'all' && p.year !== filterYear) return false;
      if (filterSemester !== 'all' && p.semester !== filterSemester) return false;
      if (filterExam !== 'all' && p.examType !== filterExam) return false;
      if (q) {
        const hay = `${p.courseCode || ''} ${p.courseTitle || ''}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [all, search, filterCourse, filterYear, filterSemester, filterExam]);

  const hasActiveFilters =
    search.trim() !== '' ||
    filterCourse !== 'all' ||
    filterYear !== 'all' ||
    filterSemester !== 'all' ||
    filterExam !== 'all';

  const clearFilters = () => {
    setSearch('');
    setFilterCourse('all');
    setFilterYear('all');
    setFilterSemester('all');
    setFilterExam('all');
  };

  // Group by year (desc) then by semester (1st before 2nd) for an archive feel.
  const grouped = useMemo(() => {
    const byYear = new Map();
    filtered.forEach((p) => {
      const year = p.year || 'Undated';
      if (!byYear.has(year)) byYear.set(year, new Map());
      const sem = byYear.get(year);
      const key = p.semester === '2nd' ? '2nd' : '1st';
      if (!sem.has(key)) sem.set(key, []);
      sem.get(key).push(p);
    });
    const years = [...byYear.keys()].sort((a, b) => String(b).localeCompare(String(a)));
    return years.map((year) => {
      const semMap = byYear.get(year);
      const semesters = ['1st', '2nd']
        .filter((k) => semMap.has(k))
        .map((k) => ({ key: k, items: semMap.get(k) }));
      return { year, semesters };
    });
  }, [filtered]);

  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <h2 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Past questions
        </h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
          Browse previous exams and tests from across every department. Preview or download a paper to
          prepare for your assessments.
        </p>
      </header>

      {/* Filters */}
      <section className="space-y-4 rounded-xl border border-border bg-card p-4 text-card-foreground sm:p-5">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.5}
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by course code or title"
            aria-label="Search past questions"
            className="h-11 pl-9"
          />
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Course</span>
            <Select value={filterCourse} onValueChange={setFilterCourse}>
              <SelectContent>
                <SelectItem value="all">All courses</SelectItem>
                {courseOptions.map(([code]) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Academic year</span>
            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectContent>
                <SelectItem value="all">All years</SelectItem>
                {yearOptions.map((y) => (
                  <SelectItem key={y} value={y}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Semester</span>
            <Select value={filterSemester} onValueChange={setFilterSemester}>
              <SelectContent>
                <SelectItem value="all">All semesters</SelectItem>
                <SelectItem value="1st">1st semester</SelectItem>
                <SelectItem value="2nd">2nd semester</SelectItem>
              </SelectContent>
            </Select>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Exam type</span>
            <Select value={filterExam} onValueChange={setFilterExam}>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                <SelectItem value="mid">Mid-semester</SelectItem>
                <SelectItem value="final">Final exam</SelectItem>
              </SelectContent>
            </Select>
          </label>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {filtered.length} paper{filtered.length !== 1 ? 's' : ''}
            {hasActiveFilters && all.length !== filtered.length ? ` of ${all.length}` : ''}
          </span>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters}>
              <FilterX size={16} strokeWidth={1.5} />
              Clear filters
            </Button>
          )}
        </div>
      </section>

      {/* Archive */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card px-6 py-16 text-center">
          <Archive size={40} strokeWidth={1.5} className="text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground max-w-prose text-pretty">
            {all.length === 0
              ? 'No past questions have been published yet. Check back soon.'
              : 'No past questions match your filters.'}
          </p>
          {hasActiveFilters && all.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map(({ year, semesters }) => (
            <section key={year} className="space-y-4">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-foreground tabular-nums">{year}</h3>
                <span className="h-px flex-1 bg-border" aria-hidden="true" />
              </div>

              {semesters.map(({ key, items }) => (
                <div key={key} className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {SEMESTER_LABEL[key]}
                  </p>
                  <ul className="grid grid-cols-1 gap-3 lg:grid-cols-2">
                    {items.map((pq) => (
                      <PastQuestionCard key={pq.id} pq={pq} />
                    ))}
                  </ul>
                </div>
              ))}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

function PastQuestionCard({ pq }) {
  const href = resourceHref(pq.url, pq.fileData);
  const schemeHref = resourceHref(pq.answerSchemeUrl, pq.answerSchemeData);
  const showScheme = pq.answerSchemeVisible && !!schemeHref;
  const downloadName = pq.fileName || `${pq.courseCode || 'past-question'}-${pq.year || ''}`.trim();
  const schemeName = pq.answerSchemeName || `${pq.courseCode || 'answer-scheme'}-scheme`;

  return (
    <li className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 text-card-foreground transition-colors hover:border-primary/40">
      <div className="flex items-start gap-3">
        <span
          className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
          aria-hidden="true"
        >
          <FileText size={18} strokeWidth={1.5} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">{pq.courseCode}</p>
          {pq.courseTitle && (
            <p className="mt-0.5 text-sm text-muted-foreground text-pretty">{pq.courseTitle}</p>
          )}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="rounded-md border-border bg-transparent text-muted-foreground">
              {pq.year}
            </Badge>
            <Badge variant="outline" className="rounded-md border-border bg-transparent text-muted-foreground">
              {SEMESTER_LABEL[pq.semester === '2nd' ? '2nd' : '1st']}
            </Badge>
            <Badge
              variant="outline"
              className={`rounded-md border-transparent ${
                pq.examType === 'mid' ? 'bg-info/10 text-info' : 'bg-brand-green-soft text-brand-green'
              }`}
            >
              {EXAM_LABEL[pq.examType === 'mid' ? 'mid' : 'final']}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {href ? (
          <>
            <Button asChild variant="outline" size="sm">
              <a href={href} target="_blank" rel="noopener noreferrer">
                <Eye size={16} strokeWidth={1.5} />
                Preview
              </a>
            </Button>
            <Button asChild size="sm">
              <a href={href} download={pq.fileData ? downloadName : undefined} target="_blank" rel="noopener noreferrer">
                <Download size={16} strokeWidth={1.5} />
                Download
              </a>
            </Button>
          </>
        ) : (
          <span className="text-xs text-muted-foreground">No file attached</span>
        )}

        {showScheme && (
          <Button asChild variant="ghost" size="sm">
            <a
              href={schemeHref}
              download={pq.answerSchemeData ? schemeName : undefined}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ListChecks size={16} strokeWidth={1.5} />
              Answer scheme
            </a>
          </Button>
        )}
      </div>
    </li>
  );
}
