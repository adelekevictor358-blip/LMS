"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { 
  Users, Search, Filter, Download, MoreHorizontal, 
  Mail, Phone, GraduationCap, ChevronRight, CheckCircle2, 
  Clock, AlertCircle, TrendingUp, BookOpen 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function LecturerStudents() {
  const { getAllUsers, courses, user } = useStore();
  const allUsers = getAllUsers();
  const students = allUsers.filter(u => u.role === 'student');
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.matNo && s.matNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="text-blue-600" /> Cohort Management
           </h1>
           <p className="text-slate-500 mt-1 font-medium">Monitor student performance and manage academic records for your courses.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="font-bold">
              <Download size={16} className="mr-2" /> Export Roster
           </Button>
           <Button className="bg-blue-600 hover:bg-blue-700 font-bold">Register New Student</Button>
        </div>
      </div>

      {/* Analytics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Active Students" value={students.length} sub="Across all levels" icon={<Users />} />
         <MetricCard label="Average GPA" value="3.42" sub="Institutional cohort avg" icon={<TrendingUp />} />
         <MetricCard label="Program Sync" value="94%" sub="Enrollment completion" icon={<CheckCircle2 />} />
      </div>

      {/* Main Content */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-b">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full max-w-md">
                 <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                 <Input 
                   placeholder="Search by name or Matric No..." 
                   className="pl-10 h-10 rounded-xl"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex gap-2">
                 {['all', '100L', '200L', '300L'].map(lvl => (
                    <Button 
                      key={lvl} 
                      variant={levelFilter === lvl ? "default" : "outline"} 
                      size="sm"
                      className={`h-9 px-4 rounded-lg font-bold text-[10px] uppercase tracking-widest ${levelFilter === lvl ? 'bg-blue-600' : ''}`}
                      onClick={() => setLevelFilter(lvl)}
                    >
                      {lvl === 'all' ? 'All Levels' : lvl}
                    </Button>
                 ))}
              </div>
           </div>
        </CardHeader>
        <CardContent className="p-0">
           <Table>
              <TableHeader>
                 <TableRow className="bg-slate-50/50 dark:bg-slate-800/10">
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest py-4 pl-6">Student Identity</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Academic Level</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Matric Number</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Enrolled Courses</TableHead>
                    <TableHead className="font-bold text-[10px] uppercase tracking-widest">Performance</TableHead>
                    <TableHead className="text-right py-4 pr-6">Actions</TableHead>
                 </TableRow>
              </TableHeader>
              <TableBody>
                 {filteredStudents.length === 0 ? (
                    <TableRow>
                       <TableCell colSpan={6} className="h-64 text-center opacity-40 italic font-medium">No student records match the current filter.</TableCell>
                    </TableRow>
                 ) : (
                    filteredStudents.map((s, i) => (
                       <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                          <TableCell className="py-4 pl-6">
                             <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9 border border-slate-200">
                                   <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{s.avatar}</AvatarFallback>
                                </Avatar>
                                <span className="font-bold text-slate-900 dark:text-white">{s.name}</span>
                             </div>
                          </TableCell>
                          <TableCell>
                             <Badge variant="outline" className="font-bold bg-blue-50/50 border-blue-200 text-blue-600">{s.level}</Badge>
                          </TableCell>
                          <TableCell className="font-medium text-slate-500 uppercase text-xs">{s.matNo || 'MT-99420'}</TableCell>
                          <TableCell className="font-bold text-slate-900 dark:text-white">{(s.enrolledCourseIds?.length || 0) + 4}</TableCell>
                          <TableCell>
                             <div className="flex items-center gap-2">
                                <div className="h-2 w-16 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                   <div className="h-full bg-green-500 rounded-full" style={{ width: '85%' }} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-500">85%</span>
                             </div>
                          </TableCell>
                          <TableCell className="text-right py-4 pr-6">
                             <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50"><Mail size={16} /></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><MoreHorizontal size={16} /></Button>
                             </div>
                          </TableCell>
                       </TableRow>
                    ))
                 )}
              </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }) {
  return (
    <Card className="border shadow-sm overflow-hidden">
       <CardContent className="p-6">
          <div className="flex justify-between items-start">
             <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900 dark:text-white">{value}</p>
                <p className="text-[10px] font-medium text-slate-500 mt-2 italic">{sub}</p>
             </div>
             <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-blue-600 opacity-60">
                {icon}
             </div>
          </div>
       </CardContent>
    </Card>
  );
}
