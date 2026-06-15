"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, FileText, Layers, Download, ExternalLink, Filter, MonitorPlay, FileCheck, Bookmark, ChevronRight, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TYPE_ICONS = {
  pdf: <FileText size={18} strokeWidth={1.75} />,
  video: <MonitorPlay size={18} strokeWidth={1.75} />,
  link: <ExternalLink size={18} strokeWidth={1.75} />,
  textbook: <BookOpen size={18} strokeWidth={1.75} />,
  document: <FileText size={18} strokeWidth={1.75} />,
  image: <BookOpen size={18} strokeWidth={1.75} />,
  slides: <Layers size={18} strokeWidth={1.75} />,
};

export default function StudentLibrary() {
  const { user, courses, materials, library, getStudentCourses, getCourseAssignedLecturer } = useStore();
  const [activeTab, setActiveTab] = useState('materials');
  const [filterCourse, setFilterCourse] = useState('all');

  const myCourses = getStudentCourses(user);
  const myCourseIds = myCourses.map(c => c.id);

  const filteredMaterials = (filterCourse === 'all' ? materials : materials.filter(m => m.courseId === parseInt(filterCourse)))
    .filter(m => myCourseIds.includes(m.courseId));

  const filteredLibrary = (filterCourse === 'all' ? library : library.filter(b => b.courseId === parseInt(filterCourse)))
    .filter(b => myCourseIds.includes(b.courseId));

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1.5">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-foreground md:text-3xl text-balance">
            Library
          </h1>
          <p className="max-w-prose text-sm leading-relaxed text-muted-foreground text-pretty">
            Course materials, textbooks, and reading resources for your level.
          </p>
        </div>
        <Badge variant="outline" className="w-fit gap-1.5 rounded-full text-xs font-medium text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true" />
          Signed in
        </Badge>
      </header>

      <Tabs defaultValue="materials" className="w-full" onValueChange={setActiveTab}>
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="materials">
              <FileCheck size={16} className="mr-2" /> Materials
            </TabsTrigger>
            <TabsTrigger value="textbooks">
              <Bookmark size={16} className="mr-2" /> Textbooks
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-72">
            <Filter size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              value={filterCourse}
              onChange={e => setFilterCourse(e.target.value)}
              aria-label="Filter by course"
            >
              <option value="all">All courses</option>
              {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
            </select>
          </div>
        </div>

        <TabsContent value="materials">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filteredMaterials.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
                <Layers size={32} strokeWidth={1.5} className="mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No materials available for this view yet.</p>
              </div>
            ) : (
              filteredMaterials.map(mat => {
                const course = courses.find(c => c.id === mat.courseId);
                const lecturer = getCourseAssignedLecturer(mat.courseId);
                return (
                  <Card key={mat.id} className="flex flex-col overflow-hidden transition-colors hover:border-primary/40">
                    <CardHeader className="flex flex-row items-center justify-between gap-3 pb-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                        {TYPE_ICONS[mat.type]}
                      </div>
                      <Badge variant="secondary" className="rounded-md text-xs font-medium capitalize">
                        {mat.type}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-3 pt-0">
                      <div className="space-y-1.5">
                        <h2 className="text-base font-semibold leading-tight text-foreground line-clamp-1">{mat.title}</h2>
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: course?.color }} aria-hidden="true" />
                          <span className="text-xs font-medium text-muted-foreground">{course?.code} — {course?.title}</span>
                        </div>
                        {lecturer && (
                          <span className="text-xs font-medium text-muted-foreground block mt-1">Uploaded by: {lecturer.title || 'Dr.'} {lecturer.name}</span>
                        )}
                      </div>
                      {mat.description && (
                        <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2 text-pretty">
                          {mat.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Download size={14} /> {mat.size || 'N/A'}</span>
                        <span className="flex items-center gap-1.5"><History size={14} /> {mat.date}</span>
                      </div>
                    </CardContent>
                    <Separator />
                    <CardFooter className="pt-4">
                      <Button variant="outline" className="w-full" asChild>
                        <a href={mat.url} target="_blank" rel="noreferrer">
                          {mat.type === 'video' ? <MonitorPlay size={16} className="mr-2" /> : <ExternalLink size={16} className="mr-2" />}
                          {mat.type === 'video' ? 'Watch' : 'Open file'}
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })
            )}
          </section>
        </TabsContent>

        <TabsContent value="textbooks">
          <section className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredLibrary.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3 xl:col-span-4 flex flex-col items-center justify-center rounded-xl border border-border bg-card py-20 text-center">
                <BookOpen size={32} strokeWidth={1.5} className="mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No textbooks match this filter yet.</p>
              </div>
            ) : (
              filteredLibrary.map(book => {
                const course = courses.find(c => c.id === book.courseId);
                return (
                  <Card key={book.id} className="flex flex-col overflow-hidden transition-colors hover:border-primary/40">
                    <div className="h-1 w-full" style={{ backgroundColor: course?.color }} aria-hidden="true" />
                    <CardHeader className="pb-2">
                      <Badge variant="secondary" className="w-fit rounded-md text-xs font-medium">
                        {course?.code || 'GEN'}
                      </Badge>
                    </CardHeader>
                    <CardContent className="flex flex-1 flex-col justify-between gap-4 pt-0">
                      <div className="space-y-1.5">
                        <h2 className="text-base font-semibold leading-tight text-foreground line-clamp-3">{book.title}</h2>
                        <p className="text-sm text-muted-foreground">by {book.author}</p>
                      </div>
                      <div className="space-y-3">
                        {book.edition && (
                          <p className="text-xs font-medium text-muted-foreground">{book.edition}</p>
                        )}
                        <Button variant="outline" className="w-full" asChild>
                          <a href={book.url} target="_blank" rel="noreferrer">
                            Open textbook <ChevronRight size={16} className="ml-2" />
                          </a>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </section>
        </TabsContent>
      </Tabs>
    </main>
  );
}
