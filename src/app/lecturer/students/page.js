"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import {
  Users, Search, Download, MoreHorizontal,
  Mail, CheckCircle2, TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LecturerStudents() {
  const { getAllUsers, courses, user, currentSession, currentSemester, getLecturerRegisteredCourses } = useStore();
  const allUsers = getAllUsers();
  const myCourses = getLecturerRegisteredCourses(user?.id);
  
  const [selectedCourseId, setSelectedCourseId] = useState('all');
  const targetCourseIds = selectedCourseId === 'all' ? myCourses.map(c => c.id) : [selectedCourseId];
  const students = allUsers.filter(u => u.role === 'student' && u.enrolledCourseIds?.some(id => targetCourseIds.some(tid => String(tid) === String(id))));

  const departments = [...new Set(students.map(s => s.program).filter(Boolean))];

  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [showAttendanceDialog, setShowAttendanceDialog] = useState(false);
  const [weeksCount, setWeeksCount] = useState(15);

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.matNo && s.matNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    const matchesDept = departmentFilter === 'all' || s.program === departmentFilter;
    return matchesSearch && matchesLevel && matchesDept;
  });

  const handleExportExcel = () => {
    if (selectedCourseId === 'all') {
      alert("Please select a specific course to generate an attendance sheet.");
      return;
    }
    const course = myCourses.find(c => String(c.id) === String(selectedCourseId));
    
    if (!course) {
      alert("Could not find the selected course.");
      return;
    }
    
    let tableStr = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head><meta charset="utf-8" /><style>table { border-collapse: collapse; } th, td { border: 1px solid black; padding: 5px; }</style></head>
    <body>
      <table>
        <tr><th colspan="${5 + Number(weeksCount) + 1}" style="font-size: 20px; font-weight: bold; text-align: center;">MOUNTAIN TOP UNIVERSITY</th></tr>
        <tr><th colspan="${5 + Number(weeksCount) + 1}" style="font-size: 16px; font-weight: bold; text-align: center;">Attendance Sheet - ${course.title} (${course.code})</th></tr>
        <tr>
          <th colspan="3" style="text-align: left;">Semester: ${currentSemester}</th>
          <th colspan="2" style="text-align: left;">Session: ${currentSession}</th>
          <th colspan="${Number(weeksCount) + 1}" style="text-align: left;">Lecturer: ${user.name}</th>
        </tr>
        <tr></tr>
        <tr>
          <th style="background-color: #2980b9; color: white;">S/N</th>
          <th style="background-color: #2980b9; color: white;">Matric Number</th>
          <th style="background-color: #2980b9; color: white;">Student Full Name</th>
          <th style="background-color: #2980b9; color: white;">Department</th>
          <th style="background-color: #2980b9; color: white;">Level</th>`;
          
    for (let i = 1; i <= weeksCount; i++) {
      tableStr += `<th style="background-color: #2980b9; color: white;">Week ${i}</th>`;
    }
    tableStr += `<th style="background-color: #2980b9; color: white;">Signature</th></tr>`;

    filteredStudents.forEach((student, idx) => {
      tableStr += `<tr>
        <td>${idx + 1}</td>
        <td>${student.matNo || 'N/A'}</td>
        <td>${student.name}</td>
        <td>${student.program || 'N/A'}</td>
        <td>${student.level || 'N/A'}</td>`;
      for (let i = 1; i <= weeksCount + 1; i++) {
        tableStr += `<td></td>`;
      }
      tableStr += `</tr>`;
    });

    tableStr += `</table></body></html>`;
    
    const blob = new Blob([tableStr], { type: 'application/vnd.ms-excel' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${course.code}_Attendance.xls`;
    a.click();
    URL.revokeObjectURL(url);
    setShowAttendanceDialog(false);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="space-y-1">
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Cohort management
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground text-pretty">
            Monitor student performance and manage academic records for your courses.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setShowAttendanceDialog(true)}>
            <Download size={16} className="mr-2" /> Generate Attendance Sheet
          </Button>
          <Button>Register new student</Button>
        </div>
      </header>

      {/* Analytics Row */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricCard label="Active students" value={students.length} sub={selectedCourseId === 'all' ? "Across all courses" : `Registered for this course`} icon={<Users size={18} strokeWidth={1.5} />} />
        <MetricCard label="Average GPA" value="3.42" sub="Institutional cohort avg" icon={<TrendingUp size={18} strokeWidth={1.5} />} />
        <MetricCard label="Program sync" value="94%" sub="Enrollment completion" icon={<CheckCircle2 size={18} strokeWidth={1.5} />} />
      </section>

      {/* Main Content */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or matric number"
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger className="w-[180px] h-10"><SelectValue placeholder="All Courses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {myCourses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.code}</SelectItem>)}
                </SelectContent>
              </Select>
              
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[160px] h-10"><SelectValue placeholder="All Departments" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>

              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-[120px] h-10"><SelectValue placeholder="All Levels" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {['100L', '200L', '300L', '400L'].map(lvl => <SelectItem key={lvl} value={lvl}>{lvl}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="py-3 pl-6 text-xs font-medium text-muted-foreground">Student</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Academic level</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Matric number</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Enrolled courses</TableHead>
                <TableHead className="text-xs font-medium text-muted-foreground">Performance</TableHead>
                <TableHead className="py-3 pr-6 text-right text-xs font-medium text-muted-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={6} className="h-64">
                    <div className="flex flex-col items-center justify-center gap-3 text-center">
                      <Users size={28} strokeWidth={1.5} className="text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">No student records match the current filter.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((s, i) => (
                  <TableRow key={i} className="transition-colors hover:bg-muted/50">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-border">
                          <AvatarFallback className="bg-muted text-xs font-medium text-muted-foreground">{s.avatar}</AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-foreground">{s.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-medium">{s.level}</Badge>
                      <div className="text-[10px] text-muted-foreground mt-1">{s.program || 'N/A'}</div>
                    </TableCell>
                    <TableCell className="text-xs font-medium uppercase tabular-nums text-muted-foreground">{s.matNo || 'N/A'}</TableCell>
                    <TableCell className="font-medium tabular-nums text-foreground">{(s.enrolledCourseIds?.length || 0) + 4}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-16 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-success" style={{ width: '85%' }} />
                        </div>
                        <span className="text-xs font-medium tabular-nums text-muted-foreground">85%</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 pr-6 text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <Mail size={16} />
                          <span className="sr-only">Email {s.name}</span>
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                          <MoreHorizontal size={16} />
                          <span className="sr-only">More actions for {s.name}</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Attendance Generator Dialog */}
      <Dialog open={showAttendanceDialog} onOpenChange={setShowAttendanceDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-xl">Generate Attendance Sheet</DialogTitle>
            <DialogDescription>
              Export a styled Excel sheet with student details and week columns for tracking attendance.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Course</label>
              <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                <SelectTrigger><SelectValue placeholder="Choose a course" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">-- Please select a specific course --</SelectItem>
                  {myCourses.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.code} - {c.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Number of Weeks</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={weeksCount}
                onChange={(e) => setWeeksCount(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAttendanceDialog(false)}>Cancel</Button>
            <Button onClick={handleExportExcel} disabled={selectedCourseId === 'all'}>
              Download .xls
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }) {
  return (
    <Card className="border-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">{label}</p>
            <p className="text-2xl font-semibold tabular-nums text-foreground">{value}</p>
            <p className="text-xs text-muted-foreground">{sub}</p>
          </div>
          <div className="rounded-md bg-muted p-2.5 text-muted-foreground">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
