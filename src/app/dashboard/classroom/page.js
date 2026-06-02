"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Video, Users, Clock, ArrowRight, ShieldAlert, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function StudentClassroomHub() {
  const router = useRouter();
  const { user, liveSessions, courses } = useStore();

  const mySessions = liveSessions.filter(session => 
    user?.enrolledCourseIds?.includes(session.courseId)
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="hub-header">
        <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Video className="text-white h-6 w-6" />
          </div>
          Neural Class Hub
        </h1>
        <p className="text-muted-foreground mt-2 font-bold uppercase text-xs tracking-widest">MTU Virtual Auditorium • Institutional Access Layer</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8 space-y-6">
          {mySessions.length > 0 ? (
            mySessions.map((session) => (
              <Card key={session.id} className="border-2 border-blue-600/20 bg-blue-600/5 hover:border-blue-600/50 transition-all group overflow-hidden relative">
                 <div className="absolute top-0 right-0 p-4">
                    <Badge className="bg-red-500 animate-pulse border-none">⬤ LIVE NOW</Badge>
                 </div>
                 <CardHeader>
                    <div className="flex items-center gap-3 mb-2">
                       <Badge variant="outline" className="border-blue-600/30 text-blue-600 font-black tracking-tighter">
                          {courses.find(c => c.id === session.courseId)?.code || 'MTU-SESSION'}
                       </Badge>
                       <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Institutional Stream</span>
                    </div>
                    <CardTitle className="text-2xl font-black text-slate-900 dark:text-slate-100">{session.title}</CardTitle>
                    <CardDescription className="font-bold text-slate-500 flex items-center gap-2">
                       <Users className="h-4 w-4" /> {session.lecturerName} (Lead Academic)
                    </CardDescription>
                 </CardHeader>
                 <CardContent>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-2">
                       <div className="flex items-center gap-6">
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase">Commenced</span>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                             </span>
                          </div>
                          <div className="h-8 w-px bg-slate-200 dark:bg-slate-800" />
                          <div className="flex flex-col">
                             <span className="text-[10px] font-black text-slate-400 uppercase">Audience</span>
                             <span className="text-sm font-bold text-slate-700 dark:text-slate-300">12+ Synchronized</span>
                          </div>
                       </div>
                       <Button 
                         className="h-12 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-xl shadow-blue-600/30 group"
                         onClick={() => router.push(`/dashboard/classroom/${session.id}`)}
                       >
                         Secure Connect <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                       </Button>
                    </div>
                 </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed border-2 py-20 bg-slate-50 dark:bg-slate-900/50">
               <CardContent className="flex flex-col items-center justify-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                     <Clock className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black tracking-tight text-slate-900 dark:text-slate-100">No Active Engagements</h3>
                    <p className="text-sm text-slate-500 font-bold max-w-xs mt-1">There are currently no live sessions for your enrolled academic registry.</p>
                  </div>
                  <Button variant="outline" className="font-bold border-slate-200 dark:border-slate-800">Refresh Registry</Button>
               </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b">
                <CardTitle className="text-lg">Institutional Protocols</CardTitle>
             </CardHeader>
             <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                   <div className="h-8 w-8 rounded-lg bg-teal-500/10 flex items-center justify-center shrink-0">
                      <ShieldAlert className="h-4 w-4 text-teal-600" />
                   </div>
                   <p className="text-xs text-slate-500 font-bold leading-relaxed">
                      Virtual auditorium sessions are being recorded for institutional compliance and academic integrity. Unauthorized distribution of session links is strictly prohibited.
                   </p>
                </div>
             </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6">
           <Card className="bg-slate-900 text-white border-none shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 h-40 w-40 bg-blue-600/20 rounded-full blur-3xl" />
              <CardHeader>
                 <CardTitle className="flex items-center gap-2">
                    <Layers size={18} className="text-blue-500" /> System Integrity
                 </CardTitle>
                 <CardDescription className="text-slate-400">Class link infrastructure diagnostics.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="flex justify-between items-center text-xs font-black uppercase text-slate-400 tracking-widest">
                    <span>Signal Strength</span>
                    <span className="text-teal-400">Optimal</span>
                 </div>
                 <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 w-[94%]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                       <p className="text-[9px] font-black text-slate-500 uppercase">Latency</p>
                       <p className="text-lg font-black italic">14ms</p>
                    </div>
                    <div className="p-3 bg-slate-800/50 rounded-xl border border-slate-700">
                       <p className="text-[9px] font-black text-slate-500 uppercase">Sync</p>
                       <p className="text-lg font-black italic">100%</p>
                    </div>
                 </div>
                 <Button className="w-full bg-blue-600 hover:bg-blue-700 font-black h-12 shadow-lg shadow-blue-600/20">Recalibrate Signal</Button>
              </CardContent>
           </Card>
        </div>
      </div>
    </div>
  );
}
