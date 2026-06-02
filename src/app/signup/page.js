"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, UserCircle, ArrowRight, ShieldCheck, BookOpen, Fingerprint } from 'lucide-react';
import adminImg from '@/ADMIN.jpg';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function RegistrationGate() {
  const router = useRouter();

  const roles = [
    {
      title: 'Academic Student',
      description: 'Onboard as a verified undergraduate or postgraduate student for the current session.',
      icon: <UserCircle className="h-10 w-10" />,
      link: '/signup/student',
      color: 'teal',
      accent: '#00796B',
      benefits: ['Global Course Vault', 'CBT Assessment Suite', 'AI Scholarly Assistant']
    },
    {
      title: 'University Faculty',
      description: 'Initialize professional staff profile for curriculum orchestration and grading.',
      icon: <Fingerprint className="h-10 w-10" />,
      link: '/signup/lecturer',
      color: 'blue',
      accent: '#2563eb',
      benefits: ['Curriculum Dispatch', 'Broadcast Oversight', 'Grade Governance']
    }
  ];

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 scale-105 opacity-20 grayscale brightness-50"
        style={{ 
          backgroundImage: `url(${adminImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent"></div>

      <div className="relative z-20 w-full max-w-5xl space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="text-center space-y-4">
           <Badge variant="outline" className="text-teal-500 border-teal-500/30 px-4 py-1 font-black tracking-widest bg-teal-500/5">INSTITUTIONAL ONBOARDING</Badge>
           <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-none">Choose Your Identity</h1>
           <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto">Select your official role to initialize secure access to the university portal.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {roles.map((role, i) => (
            <Card key={i} className="group border-none shadow-2xl bg-white/5 dark:bg-slate-900/40 backdrop-blur-xl hover:bg-white/10 dark:hover:bg-slate-900/60 transition-all duration-500 cursor-pointer overflow-hidden p-0" onClick={() => router.push(role.link)}>
              <div className="h-2 w-full transition-all duration-500" style={{ backgroundColor: role.accent }}></div>
              <CardHeader className="p-10 space-y-6">
                <div className="flex items-center justify-between">
                   <div className="p-4 rounded-2xl bg-white/10 text-white transition-all duration-500 group-hover:scale-110" style={{ color: role.accent, backgroundColor: `${role.accent}15` }}>
                      {role.icon}
                   </div>
                   <ArrowRight className="h-6 w-6 text-slate-600 group-hover:text-white transition-all duration-500 group-hover:translate-x-2" />
                </div>
                <div className="space-y-2">
                  <CardTitle className="text-3xl font-black text-white">{role.title}</CardTitle>
                  <CardDescription className="text-slate-400 font-medium text-lg leading-relaxed">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="px-10 pb-10 space-y-8">
                <div className="space-y-4">
                   <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Privileges Included</p>
                   <div className="grid grid-cols-1 gap-3">
                      {role.benefits.map((b, bi) => (
                        <div key={bi} className="flex items-center gap-3 text-sm text-slate-300 font-bold group-hover:text-white transition-colors">
                           <ShieldCheck className="h-4 w-4 opacity-40 group-hover:opacity-100 transition-opacity" style={{ color: role.accent }} />
                           {b}
                        </div>
                      ))}
                   </div>
                </div>
                
                <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-white/10 bg-transparent text-white font-black text-lg group-hover:bg-white group-hover:text-slate-950 transition-all duration-500">
                    Initialize {role.title.split(' ')[1]} Profile
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center pt-4">
           <p className="text-slate-500 font-bold">
             Already part of the institution? <Link href="/login" className="text-white hover:underline underline-offset-8 decoration-teal-600 decoration-2">Re-authenticate here</Link>
           </p>
        </div>
      </div>
      
      {/* Abstract light fragments */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-teal-600/10 rounded-full blur-[120px]"></div>
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
    </div>
  );
}
