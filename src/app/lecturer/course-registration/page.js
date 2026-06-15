"use client";

import { useStore } from '@/store/useStore';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BookOpen, CheckCircle, Clock, AlertTriangle, Search,
  Send, RotateCcw, Info, X, ChevronRight, Filter, Layers
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// ─── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(endDate) {
  const calc = useCallback(() => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - Date.now();
    if (diff <= 0) return { expired: true, label: 'Registration closed' };
    const d = Math.floor(diff / 86400000);
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    const label =
      d > 0 ? `${d}d ${h}h ${m}m remaining`
      : h > 0 ? `${h}h ${m}m ${s}s remaining`
      : `${m}m ${s}s remaining`;
    return { expired: false, label, urgent: diff < 3600000 * 24 };
  }, [endDate]);

  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);
  return tick;
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function LecturerCourseRegistration() {
  const user = useStore(s => s.user);
  const courses = useStore(s => s.courses);
  const win = useStore(s => s.lecturerCourseRegWindow);
  const registrations = useStore(s => s.lecturerCourseRegistrations);
  const isLecturerRegEditable = useStore(s => s.isLecturerRegEditable);
  const saveLecturerCourseSelection = useStore(s => s.saveLecturerCourseSelection);
  const submitLecturerCourseRegistration = useStore(s => s.submitLecturerCourseRegistration);

  const lecturerId = user?.id;
  const myReg = registrations[lecturerId] || { courseIds: [], submittedAt: null };
  const editable = isLecturerRegEditable(lecturerId);
  const countdown = useCountdown(win.endDate);

  // local selection mirrors store draft
  const [selected, setSelected] = useState(new Set(myReg.courseIds));
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [semFilter, setSemFilter] = useState(win.semester || 'all');
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitted, setSubmitted] = useState(!!myReg.submittedAt);

  // Sync if registration changes externally (override re-open)
  useEffect(() => {
    setSelected(new Set(myReg.courseIds));
    setSubmitted(!!myReg.submittedAt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lecturerId, registrations]);

  // Browseable courses — all in the catalog (lecturer picks what they offer)
  const browseable = useMemo(() => {
    return courses.filter(c => {
      if (levelFilter !== 'all' && c.level !== levelFilter) return false;
      if (semFilter !== 'all' && c.semester !== semFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!c.title.toLowerCase().includes(q) && !c.code.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [courses, levelFilter, semFilter, search]);

  const selectedCourses = useMemo(
    () => courses.filter(c => selected.has(c.id)),
    [courses, selected]
  );

  const totalUnits = selectedCourses.reduce((s, c) => s + (Number(c.units) || 0), 0);

  function toggle(courseId) {
    if (!editable) return;
    setSelected(prev => {
      const next = new Set(prev);
      next.has(courseId) ? next.delete(courseId) : next.add(courseId);
      return next;
    });
    setSubmitted(false);
  }

  function handleSaveDraft() {
    saveLecturerCourseSelection(lecturerId, [...selected]);
  }

  function handleSubmit() {
    submitLecturerCourseRegistration(lecturerId, [...selected]);
    setSubmitted(true);
    setShowConfirm(false);
  }

  // ─── Status Banner ───────────────────────────────────────────────────────────
  function StatusBanner() {
    if (!win.open && !isLecturerRegEditable(lecturerId)) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Course registration is closed</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Contact the admin for assistance or to request a registration extension.
            </p>
          </div>
        </div>
      );
    }

    if (!editable && win.open && countdown?.expired) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4">
          <AlertTriangle size={18} className="mt-0.5 shrink-0 text-destructive" />
          <div>
            <p className="text-sm font-semibold text-destructive">Registration deadline has passed</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Your selections are now read-only. Contact the admin for assistance.
            </p>
          </div>
        </div>
      );
    }

    if (submitted) {
      return (
        <div className="flex items-start gap-3 rounded-xl border border-success/20 bg-success/5 p-4">
          <CheckCircle size={18} className="mt-0.5 shrink-0 text-success" />
          <div className="flex-1">
            <p className="text-sm font-semibold text-success">Registration submitted</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Submitted {myReg.submittedAt ? new Date(myReg.submittedAt).toLocaleString() : ''}
              {editable && ' · You can still make changes until the deadline.'}
            </p>
          </div>
        </div>
      );
    }

    if (editable && countdown) {
      const colorClass = countdown.urgent ? 'text-warning' : 'text-info';
      const bgClass = countdown.urgent ? 'bg-warning/5 border-warning/20' : 'bg-info/5 border-info/20';
      return (
        <div className={`flex items-start gap-3 rounded-xl border ${bgClass} p-4`}>
          <Clock size={18} className={`mt-0.5 shrink-0 ${colorClass}`} />
          <div>
            <p className={`text-sm font-semibold ${colorClass}`}>{countdown.label}</p>
            {win.endDate && (
              <p className="mt-0.5 text-xs text-muted-foreground">
                Deadline: {new Date(win.endDate).toLocaleString()}
                {win.semester && ` · ${win.semester} semester`}
                {win.session && ` · ${win.session}`}
              </p>
            )}
          </div>
        </div>
      );
    }

    return null;
  }

  return (
    <main className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
            Course Registration
          </h1>
          <p className="text-sm text-muted-foreground">
            Select the courses you intend to offer this semester.
          </p>
        </div>

        {/* Stats pill */}
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
            <BookOpen size={13} />
            {selected.size} course{selected.size !== 1 ? 's' : ''} selected
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground">
            <Layers size={13} />
            {totalUnits} credit units
          </span>
        </div>
      </header>

      {/* Status Banner */}
      <StatusBanner />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ── Left: Course Catalog ─────────────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search title or code…"
                className="pl-9 h-10"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <Select value={levelFilter} onValueChange={setLevelFilter}>
              <SelectTrigger className="w-[110px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All levels</SelectItem>
                {['100L','200L','300L','400L'].map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={semFilter} onValueChange={setSemFilter}>
              <SelectTrigger className="w-[120px] h-10"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All sems</SelectItem>
                <SelectItem value="1st">1st sem</SelectItem>
                <SelectItem value="2nd">2nd sem</SelectItem>
              </SelectContent>
            </Select>
            {(search || levelFilter !== 'all' || semFilter !== 'all') && (
              <Button variant="ghost" size="sm" className="h-10 gap-1.5 text-muted-foreground"
                onClick={() => { setSearch(''); setLevelFilter('all'); setSemFilter('all'); }}>
                <X size={14}/> Clear
              </Button>
            )}
          </div>

          {/* Course list */}
          <div className="space-y-2">
            {browseable.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-card py-16 text-center">
                <Filter size={36} strokeWidth={1.5} className="text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No courses match your filters.</p>
              </div>
            ) : browseable.map(course => {
              const isSelected = selected.has(course.id);
              return (
                <div
                  key={course.id}
                  onClick={() => toggle(course.id)}
                  className={`group flex items-center gap-4 rounded-xl border p-4 transition-all ${
                    editable ? 'cursor-pointer hover:border-primary/40' : 'cursor-default'
                  } ${isSelected
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border bg-card'
                  }`}
                >
                  {/* Color dot */}
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold text-white"
                    style={{ backgroundColor: course.color || '#3b82f6' }}
                  >
                    {course.code?.split(' ')[0]?.substring(0,3) || '?'}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">{course.title}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span>{course.code}</span>
                      <span>{course.units ?? '?'} units</span>
                      {course.level && <Badge variant="outline" className="h-4 text-[10px] px-1.5">{course.level}</Badge>}
                      {course.semester && <span className="capitalize">{course.semester} sem</span>}
                    </div>
                  </div>

                  {/* Check */}
                  <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${
                    isSelected ? 'bg-primary text-primary-foreground scale-110' : 'bg-muted text-transparent'
                  }`}>
                    <CheckCircle size={14} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Right: Summary / Actions ─────────────────────────────────────── */}
        <div className="space-y-4">
          <Card className="sticky top-4 border-border bg-card shadow-sm">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-base font-semibold">My Registration</CardTitle>
              <CardDescription className="text-xs">
                {win.semester && win.session
                  ? `${win.semester} semester · ${win.session}`
                  : 'No active registration window'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {selectedCourses.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-6 text-center">
                  <BookOpen size={28} strokeWidth={1.5} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">No courses selected yet.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {selectedCourses.map(c => (
                    <div key={c.id} className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-foreground">{c.title}</p>
                        <p className="text-[10px] text-muted-foreground">{c.code} · {c.units} units</p>
                      </div>
                      {editable && (
                        <button
                          onClick={(e) => { e.stopPropagation(); toggle(c.id); }}
                          className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
                          aria-label={`Remove ${c.code}`}
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
                <span className="text-xs text-muted-foreground">Total credit units</span>
                <span className="text-sm font-semibold tabular-nums text-foreground">{totalUnits}</span>
              </div>

              {editable && (
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-2"
                    onClick={handleSaveDraft}
                    disabled={selected.size === 0}
                  >
                    <RotateCcw size={14} /> Save draft
                  </Button>
                  <Button
                    size="sm"
                    className="w-full gap-2"
                    onClick={() => setShowConfirm(true)}
                    disabled={selected.size === 0}
                  >
                    <Send size={14} /> Submit registration
                  </Button>
                </div>
              )}

              {!editable && (
                <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3">
                  <Info size={14} className="mt-0.5 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    Registration is closed. Your selections are view-only. Contact admin for assistance.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Confirmation Dialog ─────────────────────────────────────────────── */}
      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl font-semibold tracking-tight">
              Confirm Registration
            </DialogTitle>
            <DialogDescription>
              You are about to register {selected.size} course{selected.size !== 1 ? 's' : ''} for{' '}
              {win.semester && <strong>{win.semester} semester</strong>}
              {win.session && <> ({win.session})</>}.
              Students will see these courses once submitted.
            </DialogDescription>
          </DialogHeader>

          <div className="max-h-56 space-y-2 overflow-y-auto py-2">
            {selectedCourses.map((c, i) => (
              <div key={c.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 px-3 py-2.5">
                <span className="tabular-nums text-xs text-muted-foreground w-5 text-right">{i + 1}.</span>
                <div
                  className="h-6 w-6 shrink-0 rounded-md flex items-center justify-center text-[9px] font-bold text-white"
                  style={{ backgroundColor: c.color || '#3b82f6' }}
                >
                  {c.code?.split(' ')[0]?.substring(0,3)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">{c.title}</p>
                  <p className="text-[10px] text-muted-foreground">{c.code} · {c.units} units</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2">
            <span className="text-xs text-muted-foreground">Total units</span>
            <span className="text-sm font-semibold">{totalUnits}</span>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancel</Button>
            <Button className="gap-2" onClick={handleSubmit}>
              <CheckCircle size={15} /> Confirm & submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
