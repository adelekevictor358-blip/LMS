"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Megaphone, Send, Clock, AlertTriangle, CheckCircle2, Users, Layers, ShieldAlert, History, MessageSquarePlus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function LecturerBroadcast() {
  const { user, courses, broadcasts, sendLecturerBroadcast } = useStore();
  const myCourses = courses.filter(c => c.lecturerId === user?.id);
  const myBroadcasts = broadcasts.filter(b => b.from === user?.id);
  const [form, setForm] = useState({ title: '', message: '', courseId: 'all', isUrgent: false });
  const [sent, setSent] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) return;
    sendLecturerBroadcast({ ...form, courseId: form.courseId === 'all' ? null : parseInt(form.courseId) });
    setForm({ title: '', message: '', courseId: 'all', isUrgent: false });
    setSent(true);
    setTimeout(() => setSent(false), 4000);
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Institutional Broadcast Hub</h1>
          <p className="text-muted-foreground mt-1 text-lg">Dispatch critical announcements and academic directives to student cohorts.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1.5 border-blue-500/30 text-blue-600 bg-blue-500/5 font-black tracking-widest uppercase">
             Faculty Authorization Active
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="compose" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl mb-8">
          <TabsTrigger value="compose" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
             <MessageSquarePlus className="mr-2 h-4 w-4" /> Dispatch Directive
          </TabsTrigger>
          <TabsTrigger value="history" className="rounded-lg font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm">
             <History className="mr-2 h-4 w-4" /> Transmission Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compose" className="space-y-6 animate-in slide-in-from-left-4 duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-7">
              <Card className="border-none shadow-2xl bg-card overflow-hidden">
                <div className="h-1.5 w-full bg-blue-600"></div>
                <CardHeader>
                  <CardTitle className="text-xl font-black">Composition Portal</CardTitle>
                  <CardDescription>Configure your broadcast parameters and message content.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSend} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Cohort</label>
                        <div className="relative">
                           <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground z-10" />
                           <select 
                             className="flex h-10 w-full rounded-xl border border-input bg-background pl-10 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-600"
                             value={form.courseId} 
                             onChange={e => setForm({ ...form, courseId: e.target.value })}
                           >
                              <option value="all">Global Student Population</option>
                              {myCourses.map(c => <option key={c.id} value={c.id}>{c.code} — {c.title}</option>)}
                           </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Directive Header</label>
                        <Input 
                          placeholder="e.g. Session Commencement Notice" 
                          className="h-10 rounded-xl focus-visible:ring-blue-600"
                          value={form.title} 
                          onChange={e => setForm({ ...form, title: e.target.value })} 
                          required 
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Transmission Content</label>
                      <Textarea 
                        rows={8} 
                        placeholder="Detail your institutional announcement here..." 
                        className="rounded-xl focus-visible:ring-blue-600 resize-none p-4"
                        value={form.message} 
                        onChange={e => setForm({ ...form, message: e.target.value })} 
                        required 
                      />
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border flex items-center justify-between">
                       <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg transition-colors ${form.isUrgent ? 'bg-red-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
                             <ShieldAlert className="h-5 w-5" />
                          </div>
                          <div>
                             <p className="text-xs font-black uppercase tracking-wider">Priority Governance</p>
                             <p className="text-[10px] text-muted-foreground text-bold">Elevate this transmission for immediate attention.</p>
                          </div>
                       </div>
                       <Button 
                         type="button" 
                         variant={form.isUrgent ? "destructive" : "outline"}
                         className="font-black text-[10px] uppercase tracking-widest h-8 px-4 rounded-xl transition-all"
                         onClick={() => setForm(f => ({ ...f, isUrgent: !f.isUrgent }))}
                       >
                          {form.isUrgent ? 'Urgent Protocol On' : 'Standard Priority'}
                       </Button>
                    </div>

                    {sent && (
                      <div className="p-4 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 flex items-center gap-3 animate-in zoom-in-95 duration-300">
                         <CheckCircle2 className="h-5 w-5" />
                         <span className="text-sm font-bold">Broadcast dispatched successfully to institutional terminals.</span>
                      </div>
                    )}
                  </form>
                </CardContent>
                <CardFooter className="bg-slate-50/50 dark:bg-slate-900/10 p-6">
                   <Button onClick={handleSend} className="w-full h-14 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-600/20 rounded-2xl font-black text-lg">
                      Dispatch Transmission <Send className="ml-2 h-5 w-5" />
                   </Button>
                </CardFooter>
              </Card>
            </div>

            <div className="lg:col-span-5 space-y-6">
               <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
                  <div className="p-8 space-y-4">
                     <div className="p-3 bg-white/10 rounded-2xl w-fit">
                        <Megaphone className="h-8 w-8 text-blue-400" />
                     </div>
                     <h3 className="text-2xl font-black tracking-tighter">Broadcast Protocol</h3>
                     <p className="text-slate-400 text-sm leading-relaxed">
                        Authorized faculty broadcasts are logged and distributed via the Global Academic Network. 
                        Targeted cohorts will receive push notifications and persistent inbox alerts.
                     </p>
                     <Separator className="bg-white/10" />
                     <div className="space-y-3">
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                           <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Multi-channel distribution
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                           <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Non-repudiation logging
                        </div>
                        <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                           <div className="h-1.5 w-1.5 rounded-full bg-blue-500" /> Audit trail integration
                        </div>
                     </div>
                  </div>
                  <div className="h-32 bg-gradient-to-t from-blue-600/20 to-transparent relative">
                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                         <Users className="h-48 w-48" />
                      </div>
                  </div>
               </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="history" className="animate-in slide-in-from-right-4 duration-500">
          <Card className="border-none shadow-2xl bg-card">
             <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <div>
                   <CardTitle className="text-xl font-black">Transmission Audit Log</CardTitle>
                   <CardDescription>Archive of recent institutional broadcasts dispatched by your identity.</CardDescription>
                </div>
                <Badge variant="secondary" className="h-8 px-4 font-black text-xs uppercase tracking-tighter">
                   {myBroadcasts.length} LOGGED
                </Badge>
             </CardHeader>
             <CardContent className="space-y-4">
                {myBroadcasts.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border-2 border-dashed">
                     <Megaphone className="h-16 w-16 text-slate-300 mb-4" />
                     <p className="text-lg font-bold text-slate-500 italic">No recorded transmissions found.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                     {myBroadcasts.map(b => {
                        const course = b.courseId ? courses.find(c => c.id === b.courseId) : null;
                        return (
                           <div key={b.id} className={`group relative p-6 rounded-2xl border transition-all hover:shadow-lg ${b.isUrgent ? 'bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900' : 'bg-slate-50/30 dark:bg-slate-900/10 hover:border-blue-500/30'}`}>
                              <div className="flex justify-between items-start gap-6">
                                 <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                       <h4 className="text-lg font-black tracking-tight">{b.title}</h4>
                                       {b.isUrgent && (
                                          <Badge variant="destructive" className="animate-pulse px-2 h-5 text-[9px] font-black uppercase tracking-widest">Urgent Directive</Badge>
                                       )}
                                    </div>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-3xl">{b.message}</p>
                                    <div className="flex flex-wrap items-center gap-6 pt-2">
                                       <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                          <Users className="h-3.5 w-3.5 text-blue-600" /> {course ? course.code : 'Global Audience'}
                                       </div>
                                       <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                          <Clock className="h-3.5 w-3.5" /> {new Date(b.timestamp).toLocaleString()}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-red-500 hover:text-white">
                                       <ShieldAlert className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
                )}
             </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
