"use client";

import { useStore } from '@/store/useStore';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  NotebookPen, X, Plus, Search, Pin, PinOff, Trash2, Printer,
  ArrowLeft, Check, Tag, StickyNote,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const AUTOSAVE_MS = 600;

function formatStamp(value) {
  const t = Date.parse(value);
  if (Number.isNaN(t)) return '';
  return new Date(t).toLocaleString(undefined, {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function countWords(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function safeHtml(s) {
  return String(s || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
}

// ── EDITOR ──────────────────────────────────────────────────────────────────
// Rendered with a `key={note.id}` so React remounts it on note switch; this
// resets the title/body buffers from props without a synchronizing effect.
function NoteEditor({ note, courseOptions, onBack, onUpdate, onTogglePin, onDelete, onExport }) {
  const [title, setTitle] = useState(note.title || '');
  const [body, setBody] = useState(note.body || '');
  const [saved, setSaved] = useState(true);
  const saveTimer = useRef(null);

  const scheduleSave = (nextTitle, nextBody) => {
    setSaved(false);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      onUpdate(note.id, { title: nextTitle, body: nextBody });
      setSaved(true);
    }, AUTOSAVE_MS);
  };

  // Flush any pending save on unmount (note switch / panel close).
  useEffect(() => () => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
  }, []);

  const wordCount = countWords(body);
  const charCount = (body || '').length;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back to all notes"
            onClick={onBack}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={18} />
          </Button>
          <span className="flex items-center gap-1 text-xs text-muted-foreground" aria-live="polite">
            {saved ? (
              <>
                <Check size={13} className="text-success" /> Saved
              </>
            ) : (
              'Saving…'
            )}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            aria-label={note.pinned ? 'Unpin note' : 'Pin note'}
            onClick={() => onTogglePin(note.id)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {note.pinned ? <PinOff size={16} /> : <Pin size={16} />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Export and print note"
            onClick={() => onExport(note, title, body)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Printer size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Delete note"
            onClick={() => onDelete(note.id)}
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
        <Input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            scheduleSave(e.target.value, body);
          }}
          placeholder="Note title"
          aria-label="Note title"
          className="h-11 border-0 px-0 text-base font-semibold shadow-none focus-visible:ring-0"
        />

        <div className="mt-2 flex items-center gap-2">
          <Tag size={14} className="shrink-0 text-muted-foreground" />
          {courseOptions.length > 0 ? (
            <select
              value={note.courseTag || ''}
              onChange={(e) => onUpdate(note.id, { courseTag: e.target.value || null })}
              aria-label="Course tag"
              className="h-8 flex-1 rounded-md border border-input bg-transparent px-2 text-xs text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="">No course tag</option>
              {courseOptions.map((c) => (
                <option key={c.id} value={c.code}>
                  {c.code} — {c.title}
                </option>
              ))}
            </select>
          ) : (
            <Input
              defaultValue={note.courseTag || ''}
              onBlur={(e) => onUpdate(note.id, { courseTag: e.target.value || null })}
              placeholder="Course tag (optional)"
              aria-label="Course tag"
              className="h-8 flex-1 text-xs"
            />
          )}
        </div>

        <Textarea
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            scheduleSave(title, e.target.value);
          }}
          placeholder="Start writing…"
          aria-label="Note body"
          className="mt-3 min-h-[16rem] resize-none border-0 px-0 text-sm leading-relaxed shadow-none focus-visible:ring-0"
        />
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-border px-4 py-2 text-xs text-muted-foreground">
        <span className="tabular-nums">
          {wordCount} word{wordCount === 1 ? '' : 's'} · {charCount} char{charCount === 1 ? '' : 's'}
        </span>
        <span>Updated {formatStamp(note.updatedAt)}</span>
      </footer>
    </div>
  );
}

// ── PANEL ────────────────────────────────────────────────────────────────────
export default function NotePad() {
  const {
    user,
    notes,
    getMyNotes,
    addNote,
    updateNote,
    deleteNote,
    togglePinNote,
    getStudentCourses,
  } = useStore();

  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Re-derive whenever the underlying `notes` array changes. `getMyNotes` reads
  // it from the store; `notes` is listed so the memo recomputes on edits.
  const myNotes = useMemo(
    () => (mounted && user ? getMyNotes() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mounted, user, notes]
  );

  const selectedNote = useMemo(
    () => myNotes.find((n) => n.id === selectedId) || null,
    [myNotes, selectedId]
  );

  // Course options for the optional tag (students only; safe no-op otherwise).
  const courseOptions = useMemo(() => {
    if (!mounted || !user || user.role !== 'student') return [];
    try {
      return getStudentCourses(user) || [];
    } catch {
      return [];
    }
  }, [mounted, user, getStudentCourses]);

  const filteredNotes = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return myNotes;
    return myNotes.filter(
      (n) =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.body || '').toLowerCase().includes(q)
    );
  }, [myNotes, search]);

  const handleNewNote = () => {
    const note = addNote({ title: '', body: '' });
    if (note) {
      setSelectedId(note.id);
      setSearch('');
    }
  };

  const handleDelete = (id) => {
    if (typeof window !== 'undefined' && !window.confirm('Delete this note? This cannot be undone.')) {
      return;
    }
    deleteNote(id);
    if (selectedId === id) setSelectedId(null);
  };

  const handleExport = (note, title, body) => {
    if (typeof window === 'undefined') return;
    const win = window.open('', '_blank', 'width=720,height=900');
    if (!win) return;
    const tag = note.courseTag ? `<p class="meta">Course: ${safeHtml(note.courseTag)}</p>` : '';
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${safeHtml(title) || 'Untitled note'}</title>
      <style>
        body{font-family:Georgia,'Times New Roman',serif;max-width:42rem;margin:2.5rem auto;padding:0 1.5rem;color:#1a1a1a;line-height:1.6;}
        h1{font-size:1.6rem;margin-bottom:.25rem;}
        .meta{color:#666;font-size:.8rem;margin:.15rem 0;}
        hr{border:none;border-top:1px solid #ddd;margin:1.25rem 0;}
        pre{white-space:pre-wrap;font-family:inherit;font-size:1rem;}
      </style></head><body>
      <h1>${safeHtml(title) || 'Untitled note'}</h1>
      ${tag}
      <p class="meta">Created: ${formatStamp(note.createdAt)} · Updated: ${formatStamp(note.updatedAt)}</p>
      <hr/>
      <pre>${safeHtml(body)}</pre>
      </body></html>`);
    win.document.close();
    win.focus();
    win.print();
  };

  // Render nothing intrusive when there is no logged-in user.
  if (!mounted || !user) return null;

  return (
    <>
      {/* Floating launcher — bottom-left so it never overlaps the bottom-right ChatBot. */}
      <button
        type="button"
        aria-label="Open notepad"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className={`fixed bottom-6 left-6 z-[1000] flex h-14 w-14 items-center justify-center rounded-full border border-border bg-card text-foreground shadow-md transition-colors hover:border-primary/40 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:translate-y-px ${
          open ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <NotebookPen size={22} strokeWidth={1.75} />
      </button>

      {open && (
        <>
          {/* Scrim (mobile + click-away). */}
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-[1099] bg-foreground/20 sm:bg-transparent"
          />
          <aside
            role="dialog"
            aria-label="Notepad"
            className="fixed inset-y-0 left-0 z-[1100] flex w-full flex-col border-r border-border bg-card text-card-foreground shadow-lg animate-fade-in sm:w-[380px]"
          >
            <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <StickyNote size={18} className="text-muted-foreground" />
                <span className="text-sm font-semibold text-foreground">Notepad</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Close notepad"
                onClick={() => setOpen(false)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                <X size={18} />
              </Button>
            </header>

            {!selectedNote ? (
              /* ── LIST VIEW ── */
              <div className="flex min-h-0 flex-1 flex-col">
                <div className="space-y-2 border-b border-border p-3">
                  <div className="relative">
                    <Search
                      size={16}
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    />
                    <Input
                      type="search"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search notes"
                      aria-label="Search notes"
                      className="h-10 pl-9"
                    />
                  </div>
                  <Button onClick={handleNewNote} className="w-full justify-center">
                    <Plus size={16} /> New note
                  </Button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto">
                  {filteredNotes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                      <NotebookPen size={28} strokeWidth={1.5} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        {search ? 'No notes match your search.' : 'No notes yet. Create one to get started.'}
                      </p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-border">
                      {filteredNotes.map((n) => (
                        <li key={n.id}>
                          <div className="group flex items-start gap-2 px-3 py-3 transition-colors hover:bg-accent">
                            <button
                              type="button"
                              onClick={() => setSelectedId(n.id)}
                              className="min-w-0 flex-1 rounded-md text-left focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <span className="flex items-center gap-1.5">
                                {n.pinned && <Pin size={13} className="shrink-0 text-primary" />}
                                <span className="truncate text-sm font-medium text-foreground">
                                  {n.title?.trim() || 'Untitled note'}
                                </span>
                              </span>
                              <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                                {n.body?.trim() || 'No content'}
                              </span>
                              <span className="mt-1 flex items-center gap-2 text-[0.7rem] text-muted-foreground">
                                <span>{formatStamp(n.updatedAt)}</span>
                                {n.courseTag && (
                                  <span className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-muted-foreground">
                                    <Tag size={10} /> {n.courseTag}
                                  </span>
                                )}
                              </span>
                            </button>
                            <div className="flex shrink-0 flex-col gap-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={n.pinned ? 'Unpin note' : 'Pin note'}
                                onClick={() => togglePinNote(n.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-foreground"
                              >
                                {n.pinned ? <PinOff size={15} /> : <Pin size={15} />}
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label="Delete note"
                                onClick={() => handleDelete(n.id)}
                                className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 size={15} />
                              </Button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              /* ── EDITOR VIEW ── keyed so buffers reset on note switch ── */
              <NoteEditor
                key={selectedNote.id}
                note={selectedNote}
                courseOptions={courseOptions}
                onBack={() => setSelectedId(null)}
                onUpdate={updateNote}
                onTogglePin={togglePinNote}
                onDelete={handleDelete}
                onExport={handleExport}
              />
            )}
          </aside>
        </>
      )}
    </>
  );
}
