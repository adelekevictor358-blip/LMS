"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { BookOpen, User, MessageCircle, FileText, ChevronRight, X, Star, Calendar, Bookmark, Plus, Info, Filter, GraduationCap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export default function StudentCourses() {
  const { user, courses, getAllUsers, lecturerRatings, enrollInCourse, unenrollFromCourse } = useStore();
  const [view, setView] = useState('portfolio'); 
  const [semesterFilter, setSemesterFilter] = useState('1st'); 
  const [levelFilter, setLevelFilter] = useState(user?.level || '100L');
  const allUsers = getAllUsers();
  const router = useRouter();
  const [selectedCourse, setSelectedCourse] = useState(null);

  const levels = ['100L', '200L', '300L', '400L'];

  const levelCourses = courses.filter(c => {
    const matchesLevel = c.level === levelFilter;
    const matchesSemester = !c.semester || c.semester === semesterFilter;
    
    // Normalizing strings for matching (removing dots and spaces, lowercase)
    const normalize = (str) => str?.toLowerCase().replace(/[\s.]/g, '') || '';
    const courseProgram = normalize(c.program);
    const userProgram = normalize(user?.program);

    const isGeneral = courseProgram === 'general' || c.code.startsWith('GST') || c.code.startsWith('MTU') || c.code.startsWith('ENT');
    const matchesProgram = courseProgram === userProgram || courseProgram === '';
    
    return matchesLevel && matchesSemester && (isGeneral || matchesProgram);
  });

  const myCourses = levelCourses.filter(c => user?.enrolledCourseIds?.includes(c.id));
  const availableCourses = levelCourses.filter(c => !user?.enrolledCourseIds?.includes(c.id));
  
  const getLecturer = (lecturerId) => allUsers.find(u => u.id === lecturerId && u.role === 'lecturer');
  const getLecturerStats = (lecturerId) => {
    const ratings = lecturerRatings.filter(r => r.lecturerId === lecturerId);
    return ratings.length === 0 ? { avg: "0.0", count: 0 } : { avg: (ratings.reduce((a, r) => a + r.rating, 0) / ratings.length).toFixed(1), count: ratings.length };
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Curriculum Gateway
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Register and manage your academic modules for the 2025/2026 session.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             {levels.map(lvl => (
                <button 
                  key={lvl}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${levelFilter === lvl ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                  onClick={() => setLevelFilter(lvl)}
                >
                  {lvl}
                </button>
             ))}
          </div>
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
             {['1st', '2nd'].map(sem => (
                <button 
                  key={sem}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${semesterFilter === sem ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
                  onClick={() => setSemesterFilter(sem)}
                >
                  {sem} Sem
                </button>
             ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-8 px-2">
        <button 
          className={`pb-4 text-sm font-bold transition-all relative ${view === 'portfolio' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          onClick={() => setView('portfolio')}
        >
          My Portfolio ({myCourses.length})
          {view === 'portfolio' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
        <button 
          className={`pb-4 text-sm font-bold transition-all relative ${view === 'catalog' ? 'text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
          onClick={() => setView('catalog')}
        >
          Course Catalog ({availableCourses.length})
          {view === 'catalog' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full" />}
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {(view === 'portfolio' ? myCourses : availableCourses).map(course => {
          const lecturer = getLecturer(course.lecturerId);
          const isRegistered = user?.enrolledCourseIds?.includes(course.id);

          return (
            <Card key={course.id} className="group hover:shadow-lg transition-all rounded-xl border overflow-hidden">
               <div className="h-2 w-full" style={{ background: course.color }} />
               <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="secondary" className="font-bold text-[10px] tracking-wider uppercase">{course.code}</Badge>
                    <span className="text-xs font-bold text-slate-400">{course.units} Units</span>
                  </div>
                  <CardTitle className="text-xl font-bold group-hover:text-blue-600 transition-colors uppercase leading-tight">
                    {course.title}
                  </CardTitle>
               </CardHeader>
               <CardContent className="space-y-6">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-slate-100">
                      <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">
                        {lecturer?.name ? lecturer.name.split(' ').map(n=>n[0]).join('') : 'MT'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                       <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{lecturer?.title || 'Dr.'} {lecturer?.name || 'Assigned Staff'}</span>
                       <span className="text-[10px] font-medium text-slate-500 uppercase">Lead Instructor</span>
                    </div>
                  </div>
                  {isRegistered && (
                    <div className="space-y-2">
                       <div className="flex justify-between text-[10px] font-bold">
                          <span className="text-slate-500">Learning Progress</span>
                          <span className="text-blue-600">45%</span>
                       </div>
                       <Progress value={45} className="h-1.5" />
                    </div>
                  )}
               </CardContent>
               <CardFooter className="pt-0 flex gap-2">
                  {isRegistered ? (
                    <>
                      <Button className="flex-1 bg-blue-600 hover:bg-blue-700 font-bold text-xs" onClick={() => setSelectedCourse(course)}>
                         Open Details
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => {
                         if(confirm(`Unenroll from ${course.code}?`)) unenrollFromCourse(course.id);
                      }}>
                         <X size={18} />
                      </Button>
                    </>
                  ) : (
                    <Button className="w-full bg-slate-900 dark:bg-white dark:text-slate-950 font-bold text-xs" onClick={() => enrollInCourse(course.id)}>
                       Register Course <Plus size={16} className="ml-2" />
                    </Button>
                  )}
               </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Simple Details Dialog */}
      <Dialog open={!!selectedCourse} onOpenChange={(open) => !open && setSelectedCourse(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogTitle className="sr-only">{selectedCourse?.title || 'Course Details'}</DialogTitle>
          <DialogDescription className="sr-only">Detailed information regarding the selected academic module.</DialogDescription>
          {selectedCourse && (
            <div className="flex flex-col">
              <div className="p-10 text-white" style={{ background: selectedCourse.color }}>
                <div className="flex gap-2 mb-4">
                  <Badge className="bg-white/20 text-white border-none font-bold uppercase text-[10px]">{selectedCourse.code}</Badge>
                  <Badge className="bg-white/20 text-white border-none font-bold uppercase text-[10px]">{selectedCourse.units} Units</Badge>
                </div>
                <h2 className="text-3xl font-bold uppercase tracking-tight">{selectedCourse.title}</h2>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-2 gap-4">
                    <Button variant="outline" className="h-16 rounded-xl font-bold" onClick={() => router.push('/dashboard/library')}>Library Resources</Button>
                    <Button variant="outline" className="h-16 rounded-xl font-bold" onClick={() => router.push('/dashboard/assignments')}>Assignments</Button>
                 </div>
                 <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border flex gap-4 items-center">
                    <Info size={24} className="text-blue-600 shrink-0" />
                    <p className="text-sm font-medium text-slate-500 leading-relaxed italic">
                      This module is currently active for the {selectedCourse.semester} semester {selectedCourse.level} cycle.
                    </p>
                 </div>
              </div>
           </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
