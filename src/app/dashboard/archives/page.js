"use client";

import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { 
  Play, Clock, Calendar, Users, Search, Filter, 
  Download, Share2, MoreVertical, Film, CheckCircle2,
  Lock, ArrowRight, ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ClassArchivalSystem() {
  const router = useRouter();
  const { user, courses } = useStore();

  const mockRecordings = [
    {
      id: "REC-001",
      title: "Advanced Quantum Mechanics - Week 4",
      courseCode: "PHY401",
      lecturer: "Prof. James Anderson",
      date: "2024-04-15",
      duration: "1h 45m",
      size: "1.2 GB",
      thumbnail: "QA",
      views: 124
    },
    {
      id: "REC-002",
      title: "Introduction to Neural Networks",
      courseCode: "CSC302",
      lecturer: "Dr. Sarah Omotayo",
      date: "2024-04-12",
      duration: "52m",
      size: "640 MB",
      thumbnail: "NN",
      views: 89
    },
    {
      id: "REC-003",
      title: "Fullstack Engineering: State Management",
      courseCode: "ICT204",
      lecturer: "Engr. Victor Adeleke",
      date: "2024-04-10",
      duration: "2h 10m",
      size: "2.1 GB",
      thumbnail: "SE",
      views: 256
    }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000 p-2">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Badge className="bg-blue-600/10 text-blue-600 border-none font-black text-[10px] tracking-[0.2em] mb-2 uppercase">Institutional Repository</Badge>
          <h1 className="text-4xl font-black tracking-tight italic flex items-center gap-3">
             <div className="h-14 w-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/20">
                <Film className="text-white h-7 w-7" />
             </div>
             Cloud Class Archives
          </h1>
          <p className="text-slate-500 mt-2 font-bold text-sm">Secure access to recorded academic transmissions and virtual auditorium logs.</p>
        </div>
        
        <div className="flex gap-2">
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input className="pl-10 h-12 w-[300px] bg-white dark:bg-slate-900 border-slate-200 dark:border-white/5 rounded-xl font-bold italic" placeholder="Search archive registry..." />
           </div>
           <Button variant="outline" className="h-12 w-12 rounded-xl border-slate-200 dark:border-white/5">
              <Filter className="h-4 w-4" />
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Archive Grid */}
        <div className="lg:col-span-12">
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockRecordings.map((rec) => (
                 <Card key={rec.id} className="group border-none shadow-lg bg-white dark:bg-slate-900 overflow-hidden hover:translate-y-[-4px] transition-all duration-300 ring-1 ring-slate-100 dark:ring-white/5">
                    <div className="aspect-video bg-slate-100 dark:bg-slate-800 relative cursor-pointer">
                       <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                             <Play className="text-white h-6 w-6 fill-current" />
                          </div>
                       </div>
                       <div className="absolute top-3 left-3">
                          <Badge className="bg-black/40 backdrop-blur-md border-none text-[9px] font-black tracking-widest">{rec.courseCode}</Badge>
                       </div>
                       <div className="absolute bottom-3 right-3">
                          <span className="bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[10px] font-bold text-white tracking-tighter">{rec.duration}</span>
                       </div>
                    </div>
                    <CardHeader className="p-5">
                       <CardTitle className="text-lg font-black tracking-tight leading-snug group-hover:text-blue-600 transition-colors">{rec.title}</CardTitle>
                       <CardDescription className="flex items-center gap-2 font-bold text-xs mt-1 italic">
                          <Avatar className="h-5 w-5">
                             <AvatarFallback className="bg-slate-200 text-[8px] font-black">{rec.lecturer[0]}</AvatarFallback>
                          </Avatar>
                          {rec.lecturer}
                       </CardDescription>
                    </CardHeader>
                    <CardContent className="p-5 pt-0 flex items-center justify-between border-t border-slate-50 dark:border-white/5 mt-2">
                       <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                          <div className="flex items-center gap-1"><Calendar size={12} /> {new Date(rec.date).toLocaleDateString()}</div>
                          <div className="flex items-center gap-1"><Users size={12} /> {rec.views} Views</div>
                       </div>
                       <DropdownMenuShim recording={rec} />
                    </CardContent>
                 </Card>
              ))}
           </div>
        </div>
      </div>

      <div className="mt-12 bg-blue-600/5 rounded-3xl p-8 border border-blue-600/10 flex flex-col md:flex-row items-center justify-between gap-6">
         <div className="flex items-center gap-6">
            <div className="h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center shadow-xl">
               <ShieldCheck size={32} className="text-blue-600" />
            </div>
            <div>
               <h3 className="text-xl font-black italic tracking-tight">Institutional Integrity Policy</h3>
               <p className="text-sm text-slate-500 font-medium max-w-xl">Cloud recordings are intended for personal academic review only. Unauthorized downloading or distribution of institutional content is a violation of University protocols.</p>
            </div>
         </div>
         <Button className="h-14 px-8 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 active:scale-95 transition-all">
            Access Policy Details <ArrowRight className="ml-2 h-4 w-4" />
         </Button>
      </div>
    </div>
  );
}

function DropdownMenuShim({ recording }) {
   return (
      <div className="flex gap-1">
         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Download className="h-3.5 w-3.5" />
         </Button>
         <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <Share2 className="h-3.5 w-3.5" />
         </Button>
      </div>
   );
}
