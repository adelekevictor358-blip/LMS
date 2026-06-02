"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, FileText, Video, Link2, Filter, Layers, Download, ExternalLink, Bookmark, MonitorPlay, FileCheck, Search, ChevronRight, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

const TYPE_ICONS = { 
  pdf: <FileText className="h-5 w-5" />, 
  video: <MonitorPlay className="h-5 w-5" />, 
  link: <ExternalLink className="h-5 w-5" />, 
  textbook: <BookOpen className="h-5 w-5" />,
  document: <FileText className="h-5 w-5" />,
  image: <BookOpen className="h-5 w-5" />,
  slides: <Layers className="h-5 w-5" />
};

const TYPE_COLORS = { 
  pdf: 'crimson', 
  video: 'indigo', 
  link: 'cyan', 
  textbook: 'emerald',
  document: 'blue', 
  image: 'pink', 
  slides: 'orange'
};

export default function StudentLibrary() {
  const { user, courses, materials, library } = useStore();
  const [activeTab, setActiveTab] = useState('materials');
  const [filterCourse, setFilterCourse] = useState('all');

  const myCourses = courses.filter(c => c.level === user?.level);
  const myCourseIds = myCourses.map(c => c.id);

  const filteredMaterials = (filterCourse === 'all' ? materials : materials.filter(m => m.courseId === parseInt(filterCourse)))
    .filter(m => myCourseIds.includes(m.courseId));
    
  const filteredLibrary = (filterCourse === 'all' ? library : library.filter(b => b.courseId === parseInt(filterCourse)))
    .filter(b => myCourseIds.includes(b.courseId));

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institutional Knowledge Vault</h1>
          <p className="text-muted-foreground mt-1 text-lg">Central destination for curriculum resources, digital publications, and multimedia assets.</p>
        </div>
        <div className="flex items-center gap-3">
           <Badge variant="outline" className="px-4 py-1.5 border-teal-500/30 text-teal-600 bg-teal-500/5 font-black tracking-widest uppercase">
              Authenticated Access
           </Badge>
        </div>
      </div>

      <Tabs defaultValue="materials" className="w-full" onValueChange={setActiveTab}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
           <TabsList className="grid w-fit grid-cols-2 h-12 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
              <TabsTrigger value="materials" className="rounded-lg font-bold px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                 <FileCheck className="mr-2 h-4 w-4" /> Curriculum Assets
              </TabsTrigger>
              <TabsTrigger value="textbooks" className="rounded-lg font-bold px-6 h-10 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800">
                 <Bookmark className="mr-2 h-4 w-4" /> Scholarly Publications
              </TabsTrigger>
           </TabsList>

           <div className="relative w-full sm:w-72">
              <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
              <select 
                className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm font-bold ring-offset-background transition-all focus:ring-2 focus:ring-teal-600 outline-none"
                value={filterCourse} 
                onChange={e => setFilterCourse(e.target.value)}
              >
                <option value="all">Global Level Overview</option>
                {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
              </select>
           </div>
        </div>

        <TabsContent value="materials" className="animate-in slide-in-from-left-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMaterials.length === 0 ? (
                <div className="md:col-span-3 flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed">
                   <Layers className="h-16 w-16 text-slate-300 mb-4" />
                   <p className="text-xl font-bold text-slate-500 italic">No academic materials registered in this view.</p>
                </div>
              ) : (
                filteredMaterials.map(mat => {
                  const course = courses.find(c => c.id === mat.courseId);
                  return (
                    <Card key={mat.id} className="group hover:border-teal-500/40 transition-all duration-500 shadow-sm hover:shadow-2xl border-none bg-card overflow-hidden">
                       <CardHeader className="flex flex-row items-center justify-between p-6 pb-2">
                          <div className="p-3 rounded-2xl transition-all duration-500 group-hover:scale-110" style={{ backgroundColor: `${TYPE_COLORS[mat.type]}15`, color: TYPE_COLORS[mat.type] }}>
                             {TYPE_ICONS[mat.type]}
                          </div>
                          <Badge variant="outline" className="font-black text-[9px] uppercase tracking-widest border-slate-200 dark:border-slate-800">
                             {mat.type} Asset
                          </Badge>
                       </CardHeader>
                       <CardContent className="p-6 space-y-4">
                          <div className="space-y-1">
                             <h4 className="text-lg font-black tracking-tight leading-tight line-clamp-1">{mat.title}</h4>
                             <div className="flex items-center gap-2">
                                <div className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: course?.color }}></div>
                                <span className="text-[10px] font-black uppercase tracking-widest leading-none" style={{ color: course?.color }}>{course?.code} — {course?.title}</span>
                             </div>
                          </div>
                          {mat.description && (
                             <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed font-medium">
                                {mat.description}
                             </p>
                          )}
                          <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                             <span className="flex items-center gap-1.5"><Download className="h-3 w-3" /> {mat.size || 'N/A'}</span>
                             <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> {mat.date}</span>
                          </div>
                       </CardContent>
                       <Separator className="bg-slate-50 dark:bg-slate-900" />
                       <CardFooter className="p-4">
                          <Button className="w-full bg-teal-600 hover:bg-teal-700 h-10 rounded-xl font-bold transition-all" asChild>
                             <a href={mat.url} target="_blank" rel="noreferrer">
                                {mat.type === 'video' ? <MonitorPlay className="mr-2 h-4 w-4" /> : <ExternalLink className="mr-2 h-4 w-4" />}
                                {mat.type === 'video' ? 'Stream Resource' : 'Access Digital File'}
                             </a>
                          </Button>
                       </CardFooter>
                    </Card>
                  );
                })
              )}
           </div>
        </TabsContent>

        <TabsContent value="textbooks" className="animate-in slide-in-from-right-4 duration-500">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredLibrary.length === 0 ? (
                <div className="md:col-span-4 flex flex-col items-center justify-center py-32 bg-slate-50 dark:bg-slate-900/50 rounded-3xl border-2 border-dashed">
                   <BookOpen className="h-16 w-16 text-slate-300 mb-4" />
                   <p className="text-xl font-bold text-slate-500 italic">Institutional library contains no matched publications.</p>
                </div>
              ) : (
                filteredLibrary.map(book => {
                  const course = courses.find(c => c.id === book.courseId);
                  return (
                    <Card key={book.id} className="group h-[280px] hover:border-teal-500/40 transition-all duration-500 border-none shadow-sm hover:shadow-2xl bg-card overflow-hidden flex flex-col">
                       <div className="h-2 w-full" style={{ backgroundColor: course?.color || '#1e293b' }}></div>
                       <CardHeader className="p-6 pb-2">
                          <Badge variant="secondary" className="w-fit font-black text-[9px] uppercase tracking-tighter" style={{ backgroundColor: `${course?.color}15`, color: course?.color }}>
                             {course?.code || 'GEN'}
                          </Badge>
                       </CardHeader>
                       <CardContent className="px-6 flex-1 flex flex-col justify-between">
                          <div className="space-y-2">
                             <h4 className="text-base font-black leading-tight line-clamp-3">{book.title}</h4>
                             <p className="text-xs text-muted-foreground font-bold italic">by {book.author}</p>
                          </div>
                          <div className="space-y-4">
                             <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-0 border-none text-teal-600">
                                {book.edition}
                             </Badge>
                             <Button variant="outline" className="w-full border-2 font-bold h-10 group-hover:bg-teal-600 group-hover:text-white transition-all" asChild>
                                <a href={book.url} target="_blank" rel="noreferrer">
                                   Access Publication <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                </a>
                             </Button>
                          </div>
                       </CardContent>
                    </Card>
                  );
                })
              )}
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
