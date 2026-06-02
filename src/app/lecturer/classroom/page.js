"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Video, Users, Clock, ArrowRight, ShieldCheck, Activity, 
  Share2, PlusCircle, Settings, Mic, MicOff, Monitor, Save, Radio,
  BookOpen, Sparkles, Zap, Plus, Book, GraduationCap, X, Signal, Copy,
  CheckCircle2, Info, LayoutDashboard, Database, Disc
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from 'react';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function NeuralLecturerHub() {
  const router = useRouter();
  const { user, liveSessions, courses, startLiveSession, addCourse } = useStore();
  const [selectedModule, setSelectedModule] = useState("");
  const [isAddingCourse, setIsAddingCourse] = useState(false);
  
  // New Course State
  const [newCourse, setNewCourse] = useState({
    code: "",
    title: "",
    college: user?.college || "CBAS",
    level: "100"
  });

  // Custom Session Settings (Zoom Style)
  const [settings, setSettings] = useState({
    muteOnEntry: true,
    waitingRoom: true,
    recordLocally: false,
    screenShareEnabled: true,
    chatEnabled: true
  });

  const mySessions = liveSessions.filter(session => session.lecturerId === user?.id);
  const myModules = courses.filter(c => c.lecturerId === user?.id);

  const handleStartClass = () => {
    if (!selectedModule) {
      alert("Please select an institutional module to launch.");
      return;
    }
    const sessionId = startLiveSession(parseInt(selectedModule), settings);
    router.push(`/dashboard/classroom/${sessionId}`);
  };

  const handleCreateCourse = () => {
    if (!newCourse.code || !newCourse.title) return;
    addCourse({
      ...newCourse,
      lecturerId: user.id,
      lecturerName: user.name,
      students: [],
      materials: [],
      assignments: []
    });
    setIsAddingCourse(false);
    setNewCourse({ code: "", title: "", college: user?.college || "CBAS", level: "100" });
  };

  return (
    <div className="space-y-12 animate-in fade-in zoom-in-95 duration-1000 p-8">
      
      {/* Dynamic Cinematic Header */}
      <div className="relative overflow-hidden rounded-[48px] bg-[#0a0a0a] border border-white/5 p-12 shadow-4xl group">
         <div className="absolute top-0 right-0 w-[40%] h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-10">
            <div className="space-y-4 text-center md:text-left">
               <div className="flex items-center justify-center md:justify-start gap-3">
                  <Badge className="bg-blue-600/10 text-blue-500 hover:bg-blue-600/20 px-4 py-1 rounded-full font-black text-[10px] tracking-[0.4em] border-none uppercase">Virtual Auditorium v5.0</Badge>
                  <div className="flex gap-1">
                     {[1,2,3].map(i => <div key={i} className="h-1 w-4 rounded-full bg-blue-600/30" />)}
                  </div>
               </div>
               <h1 className="text-6xl font-black text-white italic tracking-tighter leading-tight drop-shadow-2xl">
                  Academic <span className="text-blue-600">Command</span> Center
               </h1>
               <p className="text-slate-500 font-bold max-w-lg text-lg italic uppercase tracking-widest leading-loose">
                  Orchestrate high-fidelity pedagogical frequencies across the institutional neural link.
               </p>
            </div>
            
            <div className="flex gap-4">
               <Dialog open={isAddingCourse} onOpenChange={setIsAddingCourse}>
                  <DialogTrigger asChild>
                     <Button className="h-20 px-10 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-3xl font-black italic tracking-widest text-lg group transition-all">
                        <Plus className="mr-3 h-6 w-6 group-hover:rotate-90 transition-transform duration-500" /> Registry New Module
                     </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#0f0f0f] border-white/10 text-white rounded-[40px] p-10 shadow-5xl max-w-2xl font-sans uppercase italic">
                     <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-white">Registry Authorization</DialogTitle>
                        <DialogDescription className="text-slate-500 font-bold">Configure a new academic frequency within your faculty portfolio.</DialogDescription>
                     </DialogHeader>
                     <div className="grid grid-cols-2 gap-8 py-10">
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black text-slate-400 tracking-widest">Module Code</Label>
                           <Input 
                             className="bg-[#1a1a1a] border-white/5 h-16 rounded-2xl text-xl font-black focus-visible:ring-blue-600" 
                             placeholder="e.g. PHY104"
                             value={newCourse.code}
                             onChange={e => setNewCourse({...newCourse, code: e.target.value})}
                           />
                        </div>
                        <div className="space-y-3">
                           <Label className="text-[10px] font-black text-slate-400 tracking-widest">Target Level</Label>
                           <Select value={newCourse.level} onValueChange={(v) => setNewCourse({...newCourse, level: v})}>
                              <SelectTrigger className="h-16 bg-[#1a1a1a] border-white/5 rounded-2xl font-black text-xl">
                                 <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-[#1a1a1a] border-white/10 text-white font-black italic">
                                 {['100', '200', '300', '400', '500'].map(l => <SelectItem key={l} value={l}>{l} Level</SelectItem>)}
                              </SelectContent>
                           </Select>
                        </div>
                        <div className="col-span-2 space-y-3">
                           <Label className="text-[10px] font-black text-slate-400 tracking-widest">Pedagogical Title</Label>
                           <Input 
                             className="bg-[#1a1a1a] border-white/5 h-16 rounded-2xl text-xl font-black focus-visible:ring-blue-600" 
                             placeholder="e.g. Advanced Quantum Mechanics"
                             value={newCourse.title}
                             onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                           />
                        </div>
                     </div>
                     <DialogFooter>
                        <Button className="h-16 w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xl rounded-2xl shadow-3xl shadow-blue-600/30" onClick={handleCreateCourse}>
                           Deploy Module Frequency
                        </Button>
                     </DialogFooter>
                  </DialogContent>
               </Dialog>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Left Column: Active Transmission Feed */}
        <div className="lg:col-span-7 space-y-10">
           <div className="flex items-center justify-between px-4">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-blue-600/10 rounded-2xl ring-1 ring-blue-600/20">
                    <Activity size={24} className="text-blue-600 animate-pulse" />
                 </div>
                 <div>
                    <h2 className="text-[14px] font-black uppercase tracking-[0.5em] text-white italic">Active Transmissions</h2>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Live Institutional Links Under Local Control</p>
                 </div>
              </div>
              <Badge className="bg-slate-900 border border-white/10 text-slate-500 font-bold px-6 py-2 rounded-xl italic">{mySessions.length} Online</Badge>
           </div>

           {mySessions.length > 0 ? (
              <div className="space-y-6">
                 {mySessions.map((session) => (
                    <div key={session.id} className="relative group overflow-hidden rounded-[40px] bg-[#0a0a0a] border border-white/5 hover:border-blue-600/50 transition-all duration-500 shadow-3xl">
                       <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-blue-600 to-transparent opacity-50" />
                       <div className="p-10 flex flex-col md:flex-row gap-10">
                          <div className="flex-1 space-y-8">
                             <div className="flex items-center gap-5">
                                <div className="h-16 w-16 bg-blue-600 rounded-[24px] flex items-center justify-center shadow-2xl shadow-blue-600/20">
                                   <Video className="text-white h-7 w-7" />
                                </div>
                                <div className="flex flex-col">
                                   <div className="flex items-center gap-3">
                                      <Badge className="bg-blue-600/5 text-blue-500 border-none px-2 py-0.5 rounded text-[9px] font-black tracking-widest">{courses.find(c => c.id === session.courseId)?.code}</Badge>
                                      <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Class ID: {session.id}</span>
                                   </div>
                                   <h3 className="text-3xl font-black text-white italic tracking-tighter mt-2">{session.title}</h3>
                                </div>
                             </div>
                             
                             <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                                <div className="flex items-center gap-4">
                                   <Users size={18} className="text-slate-700" />
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Registry Count</span>
                                      <span className="text-md font-black text-white italic">{session.participants?.length || 0} Synced</span>
                                   </div>
                                </div>
                                <div className="flex items-center gap-4">
                                   <Clock size={18} className="text-slate-700" />
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Commencement</span>
                                      <span className="text-md font-black text-white italic">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                   </div>
                                </div>
                                <div className="hidden md:flex items-center gap-4">
                                   <Signal size={18} className="text-green-500" />
                                   <div className="flex flex-col">
                                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest italic">Signal Quality</span>
                                      <span className="text-md font-black text-green-500 italic">4K Lossless</span>
                                   </div>
                                </div>
                             </div>
                          </div>
                          
                          <div className="flex flex-col gap-3 justify-center">
                             <Button className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-3xl shadow-blue-600/30 transition-all text-sm italic tracking-widest group" onClick={() => router.push(`/dashboard/classroom/${session.id}`)}>
                                Enter Frequency <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
                             </Button>
                             <Button variant="ghost" className="h-14 px-8 text-slate-500 hover:text-white font-black italic tracking-widest hover:bg-white/5 rounded-2xl" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/dashboard/classroom/${session.id}`); alert("Institutional Link Copied."); }}>
                                <Copy className="mr-2 h-4 w-4" /> Share Registry
                             </Button>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           ) : (
              <div className="group relative overflow-hidden rounded-[56px] border border-white/5 bg-[#0a0a0a]/50 p-24 flex flex-col items-center justify-center text-center space-y-8 animate-in fade-in duration-1000">
                 <div className="absolute inset-0 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
                 <div className="h-28 w-28 bg-white/5 rounded-full flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform duration-700 relative">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-600 animate-ping opacity-20" />
                    <Database size={48} className="text-slate-700 group-hover:text-blue-500 transition-colors" />
                 </div>
                 <div className="space-y-3 relative z-10">
                    <h3 className="text-3xl font-black text-slate-100 italic tracking-tighter uppercase">No Active Link Detected</h3>
                    <p className="text-slate-600 font-bold italic text-lg leading-relaxed max-w-sm uppercase tracking-widest">Initialize an institutional module from the command launchpad to start transmitting.</p>
                 </div>
              </div>
           )}
        </div>

        {/* Right Column: Launch Command Center */}
        <div className="lg:col-span-5 relative">
           <div className="sticky top-12 space-y-8">
              <Card className="rounded-[56px] bg-[#0a0a0a] border border-white/10 shadow-5xl overflow-hidden relative group">
                 <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
                 <CardHeader className="p-12 pb-6 flex flex-col gap-6">
                    <div className="flex items-center gap-5">
                       <div className="h-14 w-14 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                          <PlusCircle size={28} className="text-blue-500" />
                       </div>
                       <div>
                          <CardTitle className="text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Initiate Link</CardTitle>
                          <CardDescription className="text-slate-600 font-bold uppercase tracking-widest text-[10px] mt-3 italic">Establish Virtual Auditorium</CardDescription>
                       </div>
                    </div>
                    
                    <div className="p-8 bg-blue-600/5 rounded-3xl border border-blue-600/10 space-y-4">
                       <Label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.4em] italic flex items-center gap-3">
                          <Sparkles size={14} /> Selected Module Registry
                       </Label>
                       <Select value={selectedModule} onValueChange={setSelectedModule}>
                          <SelectTrigger className="h-16 bg-black border-white/10 rounded-2xl font-black text-xl text-white italic hover:bg-white/5 transition-all">
                             <SelectValue placeholder="Identify Module..." />
                          </SelectTrigger>
                          <SelectContent className="bg-[#0a0a0a] border-white/10 text-white font-black italic uppercase">
                             {myModules.length > 0 ? myModules.map(c => (
                                <SelectItem key={c.id} value={c.id.toString()} className="h-16 px-6 focus:bg-blue-600 transition-colors">
                                   {c.code} — {c.title}
                                </SelectItem>
                             )) : (
                                <div className="p-10 text-center space-y-4">
                                   <Info className="mx-auto text-slate-700" size={32} />
                                   <p className="text-slate-500 text-sm italic">No modules registered in your faculty portfolio.</p>
                                </div>
                             )}
                          </SelectContent>
                       </Select>
                    </div>
                 </CardHeader>

                 <CardContent className="p-12 pt-4 space-y-10">
                    <div className="space-y-6">
                       <Label className="text-[10px] font-black text-slate-600 uppercase tracking-[0.5em] px-4 italic">Session Protocol Override</Label>
                       <div className="grid grid-cols-1 gap-4">
                          {[
                            { id: 'mute', icon: <MicOff size={18} />, label: 'Mute on Entry', checked: settings.muteOnEntry, key: 'muteOnEntry' },
                            { id: 'wait', icon: <ShieldCheck size={18} />, label: 'Waiting Room', checked: settings.waitingRoom, key: 'waitingRoom' },
                            { id: 'rec', icon: <Disc size={18} />, label: 'Neural Recording', checked: settings.recordLocally, key: 'recordLocally' },
                          ].map(opt => (
                             <div key={opt.id} className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:bg-white/8 transition-all group/opt">
                                <div className="flex items-center gap-5">
                                   <div className="h-12 w-12 rounded-xl bg-black flex items-center justify-center text-slate-500 group-hover/opt:text-blue-500 transition-colors">
                                      {opt.icon}
                                   </div>
                                   <span className="text-sm font-black text-slate-400 uppercase tracking-widest italic">{opt.label}</span>
                                </div>
                                <Switch 
                                  checked={opt.checked} 
                                  onCheckedChange={(v) => setSettings({...settings, [opt.key]: v})} 
                                />
                             </div>
                          ))}
                       </div>
                    </div>

                    <Button 
                       className="w-full h-24 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-3xl shadow-[0_40px_100px_rgba(37,99,235,0.4)] active:scale-95 transition-all group flex flex-col gap-1 items-center justify-center"
                       disabled={!selectedModule}
                       onClick={handleStartClass}
                    >
                       <span className="text-2xl italic tracking-tighter uppercase leading-none">Activate Engagement</span>
                       <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">System Launch Protocol 01</span>
                    </Button>
                    
                    <div className="flex items-center justify-center gap-6 pt-6 opacity-30 group-hover:opacity-60 transition-opacity">
                       <LayoutDashboard size={20} className="text-slate-600" />
                       <BookOpen size={20} className="text-slate-600" />
                       <ShieldCheck size={20} className="text-slate-600" />
                    </div>
                 </CardContent>
              </Card>

              <p className="text-[10px] text-slate-700 font-black text-center uppercase tracking-[0.5em] italic">
                 Institutional Computing Facility // MTU Online Hub Authority
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

