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

export default function LecturerStudents() {
  const { getAllUsers, courses, user } = useStore();
  const allUsers = getAllUsers();
  const myCourseIds = courses.filter(c => c.lecturerId === user?.id).map(c => c.id);
  const students = allUsers.filter(u => u.role === 'student' && u.enrolledCourseIds?.some(id => myCourseIds.includes(id)));
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || (s.matNo && s.matNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesLevel = levelFilter === 'all' || s.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

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
          <Button variant="outline">
            <Download size={16} /> Export roster
          </Button>
          <Button>Register new student</Button>
        </div>
      </header>

      {/* Analytics Row */}
      <section className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <MetricCard label="Active students" value={students.length} sub="Across all levels" icon={<Users size={18} strokeWidth={1.5} />} />
        <MetricCard label="Average GPA" value="3.42" sub="Institutional cohort avg" icon={<TrendingUp size={18} strokeWidth={1.5} />} />
        <MetricCard label="Program sync" value="94%" sub="Enrollment completion" icon={<CheckCircle2 size={18} strokeWidth={1.5} />} />
      </section>

      {/* Main Content */}
      <Card className="overflow-hidden border-border shadow-sm">
        <CardHeader className="border-b border-border bg-muted/40 p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative w-full max-w-md">
              <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or matric number"
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {['all', '100L', '200L', '300L'].map(lvl => (
                <Button
                  key={lvl}
                  variant={levelFilter === lvl ? "default" : "outline"}
                  size="sm"
                  onClick={() => setLevelFilter(lvl)}
                >
                  {lvl === 'all' ? 'All levels' : lvl}
                </Button>
              ))}
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
                    </TableCell>
                    <TableCell className="text-xs font-medium uppercase tabular-nums text-muted-foreground">{s.matNo || 'MT-99420'}</TableCell>
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
