"use client";

import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import {
  BookOpen, FileText, Layers, Download, ExternalLink, Search,
  MonitorPlay, FileCheck, BookMarked, Library as LibraryIcon, Eye, Sparkles,
} from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";

// Canonical material types (store: _normalizeMaterialType):
// note | slide | assignment | reference | video | other
const TYPE_META = {
  note:       { label: 'Note',       icon: FileText },
  slide:      { label: 'Slides',     icon: Layers },
  assignment: { label: 'Assignment', icon: FileCheck },
  reference:  { label: 'Reference',  icon: BookMarked },
  video:      { label: 'Video',      icon: MonitorPlay },
  other:      { label: 'Resource',   icon: BookOpen },
};

const NEW_WINDOW_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

function typeMeta(type) {
  return TYPE_META[type] || TYPE_META.other;
}

// A material is "previewable" if it points at a real link or an inline data URL.
function getOpenTarget(mat) {
  if (mat.fileData) return mat.fileData;
  if (mat.url && mat.url !== '#') return mat.url;
  return null;
}

// Sort week/topic labels so "Week 2" precedes "Week 10", with un-weeked last.
function weekSortKey(label) {
  if (!label) return Number.MAX_SAFE_INTEGER;
  const m = String(label).match(/\d+/);
  return m ? parseInt(m[0], 10) : Number.MAX_SAFE_INTEGER - 1;
}

export default function StudentLibrary() {
  const { user, getStudentCourses, getCourseMaterials, getCourseAssignedLecturer } = useStore();
  const [query, setQuery] = useState('');

  const myCourses = getStudentCourses(user);
  // Lazy initializer runs once at mount: a stable "now" for the "New" window
  // that keeps render pure (no Date.now() during render).
  const [now] = useState(() => Date.now());

  // Build the per-course view: visible materials only, grouped by week/topic.
  const courseGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    return myCourses
      .map((course) => {
        const lecturer = getCourseAssignedLecturer(course.id);
        const all = getCourseMaterials(course.id); // visible-only by default

        const matched = q
          ? all.filter((m) =>
              [m.title, m.description, m.week]
                .filter(Boolean)
                .some((field) => String(field).toLowerCase().includes(q))
            )
          : all;

        // Group by week/topic; preserve a stable, human order.
        const byWeek = new Map();
        for (const mat of matched) {
          const key = mat.week || 'General resources';
          if (!byWeek.has(key)) byWeek.set(key, []);
          byWeek.get(key).push(mat);
        }

        const weeks = [...byWeek.entries()]
          .sort((a, b) => weekSortKey(a[0]) - weekSortKey(b[0]))
          .map(([label, items]) => ({
            label,
            items: [...items].sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            ),
          }));

        return { course, lecturer, weeks, count: matched.length };
      })
      .filter((g) => g.count > 0 || !q); // when searching, drop empty courses
  }, [myCourses, getCourseMaterials, getCourseAssignedLecturer, query]);

  const totalMatches = courseGroups.reduce((sum, g) => sum + g.count, 0);
  const newCount = courseGroups.reduce(
    (sum, g) =>
      sum +
      g.weeks.reduce(
        (s, w) =>
          s +
          w.items.filter(
            (m) => m.createdAt && now - new Date(m.createdAt).getTime() < NEW_WINDOW_MS
          ).length,
        0
      ),
    0
  );

  const hasAnyCourses = myCourses.length > 0;
  const searching = query.trim().length > 0;

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-balance">
            Library
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            Notes, slides, and reading resources shared by your lecturers, organized by course and week.
          </p>
        </div>
        {newCount > 0 && (
          <Badge
            variant="outline"
            className="w-fit gap-1.5 rounded-full border-transparent bg-success/10 text-xs font-medium text-success"
          >
            <Sparkles size={13} strokeWidth={2} aria-hidden="true" />
            {newCount} new {newCount === 1 ? 'item' : 'items'} this week
          </Badge>
        )}
      </header>

      {/* Search */}
      <div className="relative w-full max-w-md">
        <Search
          size={16}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by title, topic, or keyword"
          aria-label="Search materials"
          className="h-10 pl-9"
        />
      </div>

      {/* No registered courses at all */}
      {!hasAnyCourses ? (
        <EmptyState
          icon={LibraryIcon}
          title="No courses yet"
          message="Once you register for courses, the materials your lecturers upload will appear here."
        />
      ) : searching && totalMatches === 0 ? (
        <EmptyState
          icon={Search}
          title="No matches"
          message={`Nothing matched "${query.trim()}". Try a different title or topic.`}
        />
      ) : (
        <div className="space-y-10">
          {courseGroups.map(({ course, lecturer, weeks, count }) => (
            <section key={course.id} className="space-y-5">
              {/* Course header */}
              <div className="flex items-center gap-3">
                <span
                  className="h-8 w-1 rounded-full"
                  style={{ backgroundColor: course.color }}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <h2 className="text-lg font-semibold text-foreground">
                      {course.code}
                    </h2>
                    <span className="truncate text-sm text-muted-foreground">
                      {course.title}
                    </span>
                  </div>
                  {lecturer && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {lecturer.title || 'Dr.'} {lecturer.name}
                    </p>
                  )}
                </div>
                <Badge variant="secondary" className="rounded-md text-xs font-medium tabular-nums">
                  {count} {count === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              {count === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-muted/30 px-5 py-10 text-center">
                  <p className="text-sm text-muted-foreground">
                    No materials shared for this course yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-7">
                  {weeks.map((wk) => (
                    <div key={wk.label} className="space-y-3">
                      <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {wk.label}
                      </h3>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {wk.items.map((mat) => (
                          <MaterialCard key={mat.id} mat={mat} now={now} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

function MaterialCard({ mat, now }) {
  const meta = typeMeta(mat.type);
  const Icon = meta.icon;
  const target = getOpenTarget(mat);
  const isNew =
    mat.createdAt && now - new Date(mat.createdAt).getTime() < NEW_WINDOW_MS;
  const downloadName = mat.fileName || mat.title || 'material';

  return (
    <Card className="flex flex-col overflow-hidden transition-colors hover:border-primary/40">
      <CardContent className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground"
            aria-hidden="true"
          >
            <Icon size={18} strokeWidth={1.75} />
          </div>
          <div className="flex items-center gap-1.5">
            {isNew && (
              <Badge
                variant="outline"
                className="rounded-full border-transparent bg-success/10 px-2 text-[11px] font-medium text-success"
              >
                New
              </Badge>
            )}
            <Badge variant="secondary" className="rounded-md text-xs font-medium">
              {meta.label}
            </Badge>
          </div>
        </div>

        <div className="flex-1 space-y-1.5">
          <h4 className="text-base font-semibold leading-tight text-foreground line-clamp-2">
            {mat.title}
          </h4>
          {mat.description ? (
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 text-pretty">
              {mat.description}
            </p>
          ) : null}
        </div>

        {(mat.size || mat.fileName) && (
          <p className="text-xs text-muted-foreground tabular-nums truncate">
            {mat.fileName ? mat.fileName : null}
            {mat.fileName && mat.size ? ' · ' : null}
            {mat.size ? mat.size : null}
          </p>
        )}
      </CardContent>

      <Separator />

      <div className="flex items-center gap-2 p-3">
        {target ? (
          <Button variant="outline" size="sm" className="flex-1" asChild>
            <a href={target} target="_blank" rel="noreferrer">
              {mat.type === 'video' ? (
                <MonitorPlay size={16} className="mr-1.5" />
              ) : (
                <Eye size={16} className="mr-1.5" />
              )}
              {mat.type === 'video' ? 'Watch' : 'Preview'}
            </a>
          </Button>
        ) : (
          <Button variant="outline" size="sm" className="flex-1" disabled>
            <Eye size={16} className="mr-1.5" />
            No preview
          </Button>
        )}

        {target ? (
          <Button variant="ghost" size="sm" className="flex-1" asChild>
            <a
              href={target}
              download={mat.fileData ? downloadName : undefined}
              target={mat.fileData ? undefined : '_blank'}
              rel="noreferrer"
            >
              {mat.fileData ? (
                <>
                  <Download size={16} className="mr-1.5" />
                  Download
                </>
              ) : (
                <>
                  <ExternalLink size={16} className="mr-1.5" />
                  Open link
                </>
              )}
            </a>
          </Button>
        ) : null}
      </div>
    </Card>
  );
}

function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-card px-6 py-20 text-center">
      <Icon size={32} strokeWidth={1.5} className="mb-3 text-muted-foreground" aria-hidden="true" />
      <p className="text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground text-pretty">{message}</p>
    </div>
  );
}
