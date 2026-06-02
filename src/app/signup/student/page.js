"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo, useEffect } from 'react';
import { User, Mail, GraduationCap, Building2, Briefcase, BookOpen, Layers, ArrowLeft, ArrowRight, ShieldCheck, UserPlus, Fingerprint } from 'lucide-react';
import adminImg from '@/ADMIN.jpg';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function StudentSignupPage() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  
  const [form, setForm] = useState({
    name: '', 
    email: '', 
    college: '', 
    program: '', 
    level: '100L', 
    matNo: ''
  });
  const [emailError, setEmailError] = useState('');

  const selectedCollege = useMemo(() => 
    structure.colleges.find(c => c.name === form.college), 
    [form.college, structure]
  );

  const validateEmail = (email) => {
    if (!email) return '';
    if (!email.toLowerCase().endsWith('@mtu.edu.ng')) {
      return 'Only institutional emails ending in @mtu.edu.ng are accepted. Personal emails like @gmail.com are not permitted.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    setEmailError(validateEmail(val));
  };

  const handleSignup = (e) => {
    e.preventDefault();
    const err = validateEmail(form.email);
    if (err) { setEmailError(err); return; }
    if (!form.college || !form.program) {
      alert('Please select your academic details.');
      return;
    }
    const result = signup({ ...form, role: 'student' });
    if (result.success) {
      router.push('/dashboard');
    } else {
      alert(result.error);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Background Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-20 grayscale brightness-50"
        style={{ 
          backgroundImage: `url(${adminImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950 via-slate-900/90 to-transparent"></div>

      <Card className="relative z-20 w-full max-w-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="h-2 w-full bg-teal-600"></div>
        <CardHeader className="space-y-4 pt-10 pb-8 text-center border-b">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-teal-600/10 flex items-center justify-center mb-2">
             <UserPlus className="h-10 w-10 text-teal-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter">Academic Admissions</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-lg">Register your institutional identity for the new session.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-10">
          <form onSubmit={handleSignup} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
             {/* Section 1: User Identity */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-1 w-8 bg-teal-600 rounded-full"></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-teal-600">Personal Identity</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Legal Name</Label>
                     <div className="relative">
                        <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input type="text" placeholder="e.g. Victor Adeleke" className="pl-12 h-12 rounded-xl focus-visible:ring-teal-600" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                     </div>
                  </div>
                   <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Matriculation Email</Label>
                      <div className="relative">
                         <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                         <Input
                           type="email"
                           placeholder="yourname@mtu.edu.ng"
                           className={`pl-12 h-12 rounded-xl focus-visible:ring-teal-600 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                           value={form.email}
                           onChange={handleEmailChange}
                           required
                         />
                      </div>
                      {emailError && (
                        <p className="text-[11px] font-bold text-red-500 flex items-start gap-1.5 mt-1 ml-1">
                          <span className="shrink-0 mt-0.5">⚠</span>
                          {emailError}
                        </p>
                      )}
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Admission Number / Matric</Label>
                     <div className="relative">
                        <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                        <Input type="text" placeholder="UNI/2024/001" className="pl-12 h-12 rounded-xl focus-visible:ring-teal-600" value={form.matNo} onChange={(e) => setForm({...form, matNo: e.target.value})} required />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Current Academic Level</Label>
                     <div className="relative">
                        <Layers className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                        <select 
                          className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                          value={form.level} 
                          onChange={(e) => setForm({...form, level: e.target.value})}
                        >
                           {['100L', '200L', '300L', '400L', '500L'].map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                     </div>
                  </div>
                </div>
             </div>

             {/* Section 2: Academic Placement */}
             <div className="space-y-6">
                <div className="flex items-center gap-3">
                   <div className="h-1 w-8 bg-teal-600 rounded-full"></div>
                   <h3 className="text-sm font-black uppercase tracking-widest text-teal-600">Institutional Placement</h3>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned College / Faculty</Label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                      <select 
                        className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
                        value={form.college} 
                        onChange={(e) => setForm({...form, college: e.target.value, program: ''})}
                        required
                      >
                        <option value="">Select Primary College</option>
                        {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Proposed Program of Study</Label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                      <select 
                        className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2 disabled:opacity-30"
                        value={form.program} 
                        onChange={(e) => setForm({...form, program: e.target.value})}
                        disabled={!form.college}
                        required
                      >
                        <option value="">Select Major Program</option>
                        {selectedCollege?.programs.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
             </div>

             <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-l-4 border-teal-600 text-[10px] font-bold text-muted-foreground flex gap-3">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-teal-600" />
                <p>ACADEMIC RECORD: Your initial portal password is set to your SURNAME in lowercase. Please update this upon first synchronization.</p>
             </div>

             <Button type="submit" className="w-full h-16 bg-teal-600 hover:bg-teal-700 font-black text-xl shadow-2xl shadow-teal-600/30 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98]">
                Complete Enrollment <ArrowRight className="ml-2 h-5 w-5" />
             </Button>
          </form>
        </CardContent>

        <CardFooter className="px-10 py-8 bg-slate-50 dark:bg-slate-900 border-t flex flex-col gap-4 text-center">
           <p className="text-xs font-bold text-muted-foreground">
             By enrolling, you agree to the University Code of Scholarly Conduct.
           </p>
           <div className="flex items-center justify-center gap-2 text-xs">
              <span className="text-slate-400 font-medium">Already have an active account?</span>
              <Link href="/login" className="text-teal-600 font-black hover:underline underline-offset-4">Sign In Now</Link>
           </div>
        </CardFooter>
      </Card>
      
      {/* Decorative Ornaments */}
      <div className="absolute -top-12 -left-12 w-64 h-64 bg-teal-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-blue-600/10 rounded-full blur-[100px] animate-pulse duration-1000"></div>
    </div>
  );
}
