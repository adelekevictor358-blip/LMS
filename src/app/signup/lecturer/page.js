"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo, useEffect } from 'react';
import { GraduationCap, Mail, User, Building2, MapPin, Briefcase, ShieldCheck, Fingerprint, Lock, ArrowRight, UserPlus } from 'lucide-react';
import adminImg from '@/ADMIN.jpg';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function LecturerSignup() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accessPIN, setAccessPIN] = useState('');
  const [pinError, setPinError] = useState('');
  const [emailError, setEmailError] = useState('');

  const [form, setForm] = useState({
    name: '', 
    email: '', 
    staffId: '',
    college: '', 
    program: '', 
    title: 'Dr.', 
    rank: 'Lecturer I', 
    phone: ''
  });

  const checkPIN = (e) => {
    e.preventDefault();
    if (accessPIN === 'STAFF2026') {
      setIsVerified(true);
      setPinError('');
    } else {
      setPinError('Invalid Institutional Access PIN. Please contact IT Administration.');
    }
  };

  const selectedCollege = useMemo(() => 
    structure.colleges.find(c => c.name === form.college), 
    [form.college, structure]
  );

  const validateEmail = (email) => {
    if (!email) return '';
    if (!email.toLowerCase().endsWith('@mtu.edu.ng')) {
      return 'Faculty must register with an official MTU institutional email (@mtu.edu.ng). External email providers such as @gmail.com or @yahoo.com are not authorised.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setForm({ ...form, email: val });
    setEmailError(validateEmail(val));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validateEmail(form.email);
    if (err) { setEmailError(err); return; }
    if (!form.college || !form.program) {
      alert('Please select your college and program of study.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signup({ ...form, role: 'lecturer' });
      if (result.success) {
        router.push('/lecturer');
      } else {
        alert(result.error);
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-950 overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 opacity-20 grayscale brightness-50"
        style={{ 
          backgroundImage: `url(${adminImg.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      ></div>
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950 via-slate-950/90 to-transparent"></div>

      <Card className="relative z-20 w-full max-w-2xl border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="h-2 w-full bg-blue-600"></div>
        <CardHeader className="space-y-4 pt-10 pb-8 text-center border-b">
          <div className="mx-auto h-16 w-16 rounded-2xl bg-blue-600/10 flex items-center justify-center mb-2">
             <GraduationCap className="h-10 w-10 text-blue-600" />
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter">Faculty Onboarding</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-lg">Initialize your professional academic portal status.</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-10">
          {!isVerified ? (
            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
               <div className="text-center space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                     <ShieldCheck className="h-10 w-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black tracking-tight">Staff Identity Verification</h3>
                    <p className="text-sm text-muted-foreground font-medium max-w-md mx-auto leading-relaxed">
                      To safeguard institutional integrity, please enter the <span className="text-blue-600 font-bold">9-digit Access PIN</span> issued by the Registrar or IT Department.
                    </p>
                  </div>
               </div>

               <form onSubmit={checkPIN} className="max-w-xs mx-auto space-y-6">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Institutional security pin</Label>
                    <Input 
                      type="password" 
                      placeholder="•••••••••" 
                      className={`text-center h-16 text-2xl font-black tracking-[0.5em] rounded-2xl focus-visible:ring-blue-600 ${pinError ? 'border-destructive ring-destructive' : ''}`}
                      value={accessPIN} 
                      onChange={e => setAccessPIN(e.target.value)}
                    />
                    {pinError && <p className="text-xs font-bold text-destructive text-center mt-2">{pinError}</p>}
                  </div>
                  <Button type="submit" className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-xl shadow-blue-600/20 rounded-2xl">
                     Verify Faculty Status
                  </Button>
               </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Section 1 */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Professional Credentials</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="md:col-span-1 space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Title</Label>
                       <select 
                         className="flex h-12 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm font-bold ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                         value={form.title} 
                         onChange={e => setForm({...form, title: e.target.value})}
                       >
                          <option value="Dr.">Dr.</option>
                          <option value="Prof.">Prof.</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Mrs.">Mrs.</option>
                       </select>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Nomenclature (Surname Last)</Label>
                       <div className="relative">
                          <User className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input type="text" placeholder="Sarah Jenkins" className="pl-12 h-12 rounded-xl focus-visible:ring-blue-600" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                       </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Faculty Staff ID</Label>
                       <div className="relative">
                          <Fingerprint className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                          <Input type="text" placeholder="LEC/2024/102" className="pl-12 h-12 rounded-xl focus-visible:ring-blue-600" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required />
                       </div>
                    </div>
                     <div className="space-y-2">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Official Institutional Email</Label>
                        <div className="relative">
                           <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                           <Input
                             type="email"
                             placeholder="firstname.surname@mtu.edu.ng"
                             className={`pl-12 h-12 rounded-xl focus-visible:ring-blue-600 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
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
               </div>

               {/* Section 2 */}
               <div className="space-y-6">
                  <div className="flex items-center gap-3">
                     <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                     <h3 className="text-sm font-black uppercase tracking-widest text-blue-600">Institutional Placement</h3>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institutional College / Faculty</Label>
                    <div className="relative">
                       <Building2 className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                       <select 
                         className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                         value={form.college} 
                         onChange={e => setForm({...form, college: e.target.value, department: ''})} 
                         required
                       >
                          <option value="">Select Primary College</option>
                          {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                       </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Program of Study</Label>
                      <div className="relative">
                        <GraduationCap className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                        <select 
                          className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-30"
                          value={form.program} 
                          onChange={e => setForm({...form, program: e.target.value})} 
                          disabled={!form.college} 
                          required
                        >
                           <option value="">Select Primary Program</option>
                           {selectedCollege?.programs.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Institutional Academic Rank</Label>
                      <div className="relative">
                         <Briefcase className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground z-10" />
                         <select 
                           className="flex h-12 w-full rounded-xl border border-input bg-background pl-12 pr-3 py-2 text-sm font-bold ring-offset-background focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                           value={form.rank} 
                           onChange={e => setForm({...form, rank: e.target.value})}
                         >
                            <option value="Graduate Assistant">Graduate Assistant</option>
                            <option value="Assistant Lecturer">Assistant Lecturer</option>
                            <option value="Lecturer II">Lecturer II</option>
                            <option value="Lecturer I">Lecturer I</option>
                            <option value="Senior Lecturer">Senior Lecturer</option>
                            <option value="Associate Professor">Associate Professor</option>
                            <option value="Professor">Professor</option>
                         </select>
                      </div>
                    </div>
                  </div>
               </div>

               <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-l-4 border-blue-600 text-[10px] font-bold text-muted-foreground flex gap-3">
                  <div className="h-4 w-4 shrink-0 mt-0.5"><Lock className="h-full w-full" /></div>
                  <p>SYSTEM PROTOCOL: Initial portal access password will be set to your SURNAME (all lowercase). Please update immediately upon first synchronization.</p>
               </div>

               <Button type="submit" className="w-full h-16 bg-blue-600 hover:bg-blue-700 font-black text-xl shadow-2xl shadow-blue-600/30 rounded-2xl transition-all hover:scale-[1.01] active:scale-[0.98]" disabled={loading}>
                  {loading ? "Synchronizing Records..." : "Initialize Faculty Access"} <ArrowRight className="ml-2 h-5 w-5" />
               </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="p-10 pt-0 flex flex-col gap-4">
           <div className="flex items-center gap-4 w-full">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em]">Institutional Links</span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800"></div>
           </div>
           <div className="flex flex-col sm:flex-row justify-between items-center w-full gap-4">
              <p className="text-xs font-bold text-muted-foreground">
                Seeking student registration? <Link href="/signup" className="text-blue-600 hover:underline underline-offset-4">Academic Admissions</Link>
              </p>
              <Link href="/login" className="flex items-center text-xs font-black text-blue-600 uppercase tracking-widest hover:underline underline-offset-4">
                 Sign In to Portal <UserPlus className="ml-1 h-3 w-3" />
              </Link>
           </div>
        </CardFooter>
      </Card>
      
      {/* Decorative ornaments */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-blue-600/5 -skew-x-12 transform origin-top-right"></div>
      <div className="absolute top-20 left-10 w-48 h-48 bg-blue-600/10 rounded-full blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-64 h-64 bg-teal-600/10 rounded-full blur-[120px] animate-pulse duration-1000"></div>
    </div>
  );
}
