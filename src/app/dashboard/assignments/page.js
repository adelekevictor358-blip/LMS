"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { ClipboardList, Clock, CheckCircle2, AlertCircle, Send, X, Filter, BookOpen, GraduationCap, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

export default function StudentAssignments() {
  const { user, courses, assignments, submissions, submitAssignment } = useStore();
  const [submitting, setSubmitting] = useState(null);
  const [answerText, setAnswerText] = useState('');
  const [filter, setFilter] = useState('all');

  const mySubmissions = submissions.filter(s => s.studentId === user?.id);
  const hasSubmitted = (assignmentId) => mySubmissions.some(s => s.assignmentId === assignmentId);
  const getSubmission = (assignmentId) => mySubmissions.find(s => s.assignmentId === assignmentId);

  const levelCourses = courses.filter(c => c.level === user?.level);
  const levelCourseIds = levelCourses.map(c => c.id);
  const myAssignments = assignments.filter(a => levelCourseIds.includes(a.courseId));

  const activeAssignments = myAssignments.filter(a => a.status === 'active');
  const closedAssignments = myAssignments.filter(a => a.status !== 'active');
  const displayed = filter === 'active' ? activeAssignments : filter === 'closed' ? closedAssignments : myAssignments;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!answerText.trim() || !submitting) return;
    submitAssignment(submitting.id, answerText.trim());
    setSubmitting(null);
    setAnswerText('');
  };

  const getDaysLeft = (dueDate) => {
    const diff = new Date(dueDate) - new Date();
    if (diff < 0) return null;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return days > 0 ? `${days}d ${hours}h left` : `${hours}h left`;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-8 rounded-2xl border shadow-sm">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ClipboardList className="text-blue-600" /> Academic Assignments
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Manage your submissions and track your academic performance.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl border">
          {['all', 'active', 'closed'].map(f => (
            <button 
              key={f}
              className={`px-6 py-2 rounded-lg text-xs font-bold transition-all uppercase tracking-widest ${filter === f ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-500 hover:text-blue-600'}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard label="Total Assigned" value={myAssignments.length} color="slate" icon={<ClipboardList />} />
        <MetricCard label="Pending Tasks" value={activeAssignments.length} color="orange" icon={<Clock />} />
        <MetricCard label="Completed" value={mySubmissions.length} color="green" icon={<CheckCircle2 />} />
        <MetricCard label="Graded" value={mySubmissions.filter(s => s.score !== null).length} color="purple" icon={<GraduationCap />} />
      </div>

      {/* Assignment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {displayed.map(asgn => {
          const course = courses.find(c => c.id === asgn.courseId);
          const submitted = hasSubmitted(asgn.id);
          const sub = getSubmission(asgn.id);
          const isOverdue = new Date(asgn.dueDate) < new Date() && !submitted;
          const daysLeft = getDaysLeft(asgn.dueDate);

          return (
            <Card key={asgn.id} className={`group hover:shadow-lg transition-all rounded-xl border overflow-hidden flex flex-col ${isOverdue ? 'border-red-200 bg-red-50/20' : ''}`}>
               <div className="h-1.5 w-full" style={{ background: course?.color || '#3b82f6' }} />
               <CardHeader className="pb-4">
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="font-bold text-[10px] tracking-wide uppercase">{course?.code}</Badge>
                    {submitted ? (
                      <Badge className="bg-green-600 text-white border-none font-bold text-[8px]">SUBMITTED</Badge>
                    ) : isOverdue ? (
                      <Badge className="bg-red-600 text-white border-none font-bold text-[8px]">OVERDUE</Badge>
                    ) : (
                      <Badge className="bg-orange-600/10 text-orange-600 border-none font-bold text-[8px]">{daysLeft || 'DUE NOW'}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    {asgn.title}
                  </CardTitle>
               </CardHeader>
               <CardContent className="flex-1 pb-6">
                  <p className="text-sm text-slate-500 font-medium leading-relaxed line-clamp-3 mb-6">
                     {asgn.description}
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                     <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Max Score</span>
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{asgn.maxScore}</span>
                     </div>
                     <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border flex flex-col items-center">
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Your Grade</span>
                        <span className="text-lg font-bold text-blue-600">{sub?.score !== null ? sub?.score : '--'}</span>
                     </div>
                  </div>
               </CardContent>
               <CardFooter className="pt-0 p-6">
                 {submitted ? (
                    <Button variant="outline" className="w-full h-11 font-bold text-xs" onClick={() => alert("Submission details coming soon...")}>
                       Review Submission
                    </Button>
                 ) : !isOverdue ? (
                    <Button className="w-full h-11 bg-blue-600 hover:bg-blue-700 font-bold text-xs" onClick={() => setSubmitting(asgn)}>
                       Submit Now <Send size={14} className="ml-2" />
                    </Button>
                 ) : (
                    <Button variant="ghost" disabled className="w-full h-11 bg-red-50 text-red-600 font-bold text-xs opacity-50 cursor-not-allowed uppercase italic tracking-widest">
                       Portal Closed
                    </Button>
                 )}
               </CardFooter>
            </Card>
          );
        })}
      </div>

      {/* Submission Dialog */}
      <Dialog open={!!submitting} onOpenChange={(open) => !open && setSubmitting(null)}>
        <DialogContent className="max-w-2xl rounded-2xl p-0 overflow-hidden bg-white dark:bg-slate-900 border-none shadow-2xl">
          <DialogTitle className="sr-only">Submit Assignment: {submitting?.title}</DialogTitle>
          <DialogDescription className="sr-only">Provide your academic response to the assignment prompt below.</DialogDescription>
          {submitting && (
            <div className="flex flex-col">
              <div className="p-8 bg-slate-900 text-white">
                <Badge variant="outline" className="text-blue-400 border-blue-400/30 mb-2 font-bold text-[10px] uppercase">Official Assignment Submission</Badge>
                <h2 className="text-2xl font-bold uppercase">{submitting.title}</h2>
                <p className="text-slate-400 text-sm mt-1">{submitting.code} · Max Points: {submitting.maxScore}</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-l-4 border-blue-600 text-sm text-slate-500 font-medium leading-relaxed italic">
                    "{submitting.description}"
                 </div>
                 <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea 
                      rows={8} 
                      placeholder="Type your response here..." 
                      className="w-full rounded-xl border-2 p-5 text-base font-medium focus:border-blue-600 transition-all outline-none" 
                      value={answerText} 
                      onChange={e => setAnswerText(e.target.value)} 
                      required 
                    />
                    <div className="flex gap-3 pt-2">
                       <Button type="button" variant="ghost" className="flex-1 h-12 font-bold" onClick={() => setSubmitting(null)}>Discard</Button>
                       <Button type="submit" className="flex-[2] h-12 bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20">
                          Submit Final Response <ChevronRight size={18} className="ml-1" />
                       </Button>
                    </div>
                 </form>
              </div>
           </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MetricCard({ label, value, color, icon }) {
  const colorMap = {
    slate: 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-900 dark:text-slate-300',
    orange: 'bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
    green: 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:text-purple-400'
  }
  return (
    <Card className={`border shadow-sm ${colorMap[color]}`}>
      <CardContent className="p-6 flex items-center justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
          <p className="text-3xl font-black">{value}</p>
        </div>
        <div className="opacity-40">{icon}</div>
      </CardContent>
    </Card>
  );
}
