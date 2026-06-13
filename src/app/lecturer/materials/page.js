"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Upload, Trash2, FileText, Link2, Plus, BookOpen, Layers, MonitorPlay, ExternalLink, FileCode, Clock } from 'lucide-react';
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

const TYPE_ICONS = {
  pdf: <FileText className="h-5 w-5" strokeWidth={1.5} />,
  video: <MonitorPlay className="h-5 w-5" strokeWidth={1.5} />,
  link: <ExternalLink className="h-5 w-5" strokeWidth={1.5} />,
  document: <FileText className="h-5 w-5" strokeWidth={1.5} />,
  image: <BookOpen className="h-5 w-5" strokeWidth={1.5} />,
  slides: <Layers className="h-5 w-5" strokeWidth={1.5} />,
};

export default function LecturerMaterials() {
  const { user, courses, materials, addMaterial, deleteMaterial } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myMaterials = materials.filter(m => m.uploadedBy === user?.id);
  const [showForm, setShowForm] = useState(false);
  const [filterCourse, setFilterCourse] = useState('all');
  const [selectedFile, setSelectedFile] = useState(null);
  const [form, setForm] = useState({
    courseId: '', title: '', type: 'pdf', url: '#', size: '', description: ''
  });

  const filteredMaterials = filterCourse === 'all' ? myMaterials : myMaterials.filter(m => m.courseId === parseInt(filterCourse));

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      const fileUrl = URL.createObjectURL(file);
      setForm({ ...form, title: file.name.split('.')[0], size: sizeStr, url: fileUrl });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.courseId) return;
    addMaterial({ ...form, courseId: parseInt(form.courseId), uploadedBy: user.id, date: new Date().toLocaleDateString() });
    setForm({ courseId: '', title: '', type: 'pdf', url: '#', size: '', description: '' });
    setSelectedFile(null);
    setShowForm(false);
  };

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">Course materials</h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty max-w-prose">Upload and manage lecture materials, readings, and resources for your courses.</p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button className="active:translate-y-px">
              <Plus className="mr-2 h-4 w-4" /> Add material
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="font-serif text-xl font-semibold tracking-tight text-foreground">Add new material</DialogTitle>
              <DialogDescription className="text-sm text-muted-foreground">Share a resource with students enrolled in the selected course.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label htmlFor="mat-course">Course</Label>
                  <select
                    id="mat-course"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    value={form.courseId}
                    onChange={e => setForm({ ...form, courseId: e.target.value })}
                    required
                  >
                    <option value="">Select a course</option>
                    {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mat-type">Type</Label>
                  <select
                    id="mat-type"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background"
                    value={form.type}
                    onChange={e => setForm({ ...form, type: e.target.value })}
                  >
                    <option value="pdf">PDF</option>
                    <option value="document">Document</option>
                    <option value="slides">Slides</option>
                    <option value="video">Video</option>
                    <option value="link">Web link</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mat-title">Title</Label>
                <Input
                  id="mat-title"
                  placeholder="e.g. Week 4: neural network fundamentals"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fac-file-upload">File</Label>
                <input type="file" id="fac-file-upload" onChange={handleFileChange} className="hidden" />
                <label
                  htmlFor="fac-file-upload"
                  className="flex flex-col items-center justify-center gap-3 p-8 border border-dashed border-border rounded-xl cursor-pointer bg-muted/40 transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
                  <div className="text-center space-y-1">
                    <p className="text-sm font-medium text-foreground">{selectedFile ? selectedFile.name : 'Choose a file to upload'}</p>
                    <p className="text-xs text-muted-foreground">{selectedFile ? `Size: ${form.size}` : 'Most common formats supported'}</p>
                  </div>
                </label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mat-desc">Description (optional)</Label>
                <Textarea
                  id="mat-desc"
                  placeholder="Briefly describe what this material covers."
                  className="resize-none min-h-[80px]"
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-1">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
                <Button type="submit" className="flex-1 active:translate-y-px">Add material</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </header>

      <section aria-label="Filter by course" className="flex items-center gap-2 flex-wrap overflow-x-auto pb-1">
        <Button
          variant={filterCourse === 'all' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setFilterCourse('all')}
        >
          All materials ({myMaterials.length})
        </Button>
        {myCourses.map(c => (
          <Button
            key={c.id}
            variant={filterCourse === String(c.id) ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilterCourse(String(c.id))}
          >
            {c.code} ({myMaterials.filter(m => m.courseId === c.id).length})
          </Button>
        ))}
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredMaterials.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center text-center py-24 bg-card border border-border rounded-xl">
            <FileCode className="h-10 w-10 text-muted-foreground mb-4" strokeWidth={1.5} />
            <p className="text-sm text-muted-foreground max-w-prose">No materials match this filter yet. Add one to share it with your students.</p>
            <Button className="mt-5 active:translate-y-px" onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add material
            </Button>
          </div>
        ) : (
          filteredMaterials.map(mat => {
            const course = courses.find(c => c.id === mat.courseId);
            return (
              <Card key={mat.id} className="flex flex-col transition-colors hover:border-primary/40">
                <CardHeader className="flex flex-row items-start justify-between space-y-0 gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-md bg-secondary text-foreground">
                    {TYPE_ICONS[mat.type] || <Link2 className="h-5 w-5" strokeWidth={1.5} />}
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant="secondary" className="capitalize">{mat.type}</Badge>
                    <span className="text-xs text-muted-foreground tabular-nums">{mat.size || '—'}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col space-y-4">
                  <div className="space-y-1.5">
                    <h2 className="text-base font-semibold leading-tight text-foreground line-clamp-1">{mat.title}</h2>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: course?.color }} aria-hidden="true"></span>
                      <span className="text-xs text-muted-foreground line-clamp-1">{course?.code} — {course?.title}</span>
                    </div>
                  </div>
                  {mat.description && (
                    <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
                      {mat.description}
                    </p>
                  )}
                  <Separator className="mt-auto" />
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.5} /> Added {mat.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteMaterial(mat.id)}
                        aria-label="Delete material"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a href={mat.url} target="_blank" rel="noreferrer">Preview</a>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>
    </main>
  );
}
