"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { GraduationCap, Mail, User, Building2, Briefcase, ShieldCheck, Fingerprint, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LecturerSignup() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  const lecturerAccessPin = useStore(state => state.lecturerAccessPin);
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
    if (accessPIN === lecturerAccessPin) {
      setIsVerified(true);
      setPinError('');
    } else {
      setPinError('Invalid access PIN. Contact the admin for your registration PIN.');
    }
  };

  const selectedCollege = useMemo(() =>
    structure.colleges.find(c => c.name === form.college),
    [form.college, structure]
  );

  const validateEmail = (email) => {
    if (!email) return '';
    if (!email.toLowerCase().endsWith('@mtu.edu.ng')) {
      return 'Faculty must register with an official MTU institutional email (@mtu.edu.ng). External providers such as @gmail.com or @yahoo.com are not authorised.';
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

  const selectClass = "flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl border border-border bg-card shadow-sm animate-fade-in">
        <CardHeader className="space-y-4 pt-8 pb-6 text-center border-b border-border">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <GraduationCap size={24} className="text-primary" strokeWidth={1.75} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
              Faculty registration
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Set up your academic portal account. Empowered to excel.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="p-6 md:p-8">
          {!isVerified ? (
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <ShieldCheck size={22} strokeWidth={1.5} />
                </div>
                <div className="space-y-1.5">
                  <h2 className="text-lg font-semibold text-foreground">Staff identity verification</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-prose mx-auto text-pretty">
                    Enter the access PIN issued by the registrar or IT department to continue.
                  </p>
                </div>
              </div>

              <form onSubmit={checkPIN} className="max-w-xs mx-auto space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="accessPIN" className="text-xs font-medium text-muted-foreground">Institutional access PIN</Label>
                  <Input
                    id="accessPIN"
                    type="password"
                    placeholder="Enter access PIN"
                    className={`text-center h-11 tracking-widest ${pinError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    value={accessPIN}
                    onChange={e => setAccessPIN(e.target.value)}
                  />
                  {pinError && (
                    <p className="text-xs text-destructive flex items-start gap-1.5 mt-1">
                      <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={1.75} />
                      <span>{pinError}</span>
                    </p>
                  )}
                </div>
                <Button type="submit" className="w-full h-11 active:translate-y-px">
                  Verify faculty status
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Professional credentials</h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  <div className="md:col-span-1 space-y-1.5">
                    <Label htmlFor="title" className="text-xs font-medium text-muted-foreground">Title</Label>
                    <select
                      id="title"
                      className={selectClass}
                      value={form.title}
                      onChange={e => setForm({...form, title: e.target.value})}
                    >
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Mrs.">Mrs.</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 space-y-1.5">
                    <Label htmlFor="name" className="text-xs font-medium text-muted-foreground">Full name (surname last)</Label>
                    <div className="relative">
                      <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" type="text" placeholder="Sarah Jenkins" className="pl-9 h-11" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="staffId" className="text-xs font-medium text-muted-foreground">Faculty staff ID</Label>
                    <div className="relative">
                      <Fingerprint size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="staffId" type="text" placeholder="LEC/2024/102" className="pl-9 h-11" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Official institutional email</Label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="firstname.surname@mtu.edu.ng"
                        className={`pl-9 h-11 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={form.email}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs text-destructive flex items-start gap-1.5 mt-1">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={1.75} />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-5">
                <h2 className="text-lg font-semibold text-foreground">Institutional placement</h2>

                <div className="space-y-1.5">
                  <Label htmlFor="college" className="text-xs font-medium text-muted-foreground">College / faculty</Label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                    <select
                      id="college"
                      className={`${selectClass} pl-9`}
                      value={form.college}
                      onChange={e => setForm({...form, college: e.target.value, department: ''})}
                      required
                    >
                      <option value="">Select primary college</option>
                      {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <Label htmlFor="program" className="text-xs font-medium text-muted-foreground">Assigned program of study</Label>
                    <div className="relative">
                      <GraduationCap size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <select
                        id="program"
                        className={`${selectClass} pl-9`}
                        value={form.program}
                        onChange={e => setForm({...form, program: e.target.value})}
                        disabled={!form.college}
                        required
                      >
                        <option value="">Select primary program</option>
                        {selectedCollege?.programs.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="rank" className="text-xs font-medium text-muted-foreground">Academic rank</Label>
                    <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <select
                        id="rank"
                        className={`${selectClass} pl-9`}
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
              </section>

              <div className="flex gap-3 rounded-md border border-border bg-muted/50 p-4 text-xs leading-relaxed text-muted-foreground">
                <Lock size={16} className="shrink-0 mt-0.5 text-muted-foreground" strokeWidth={1.5} />
                <p>Your initial portal password is set to your surname in lowercase. Update it immediately after your first sign-in.</p>
              </div>

              <Button type="submit" className="w-full h-11 active:translate-y-px" disabled={loading}>
                {loading ? "Creating your account…" : "Create faculty account"}
                <ArrowRight size={16} />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="px-6 md:px-8 pb-8 pt-0 flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-border pt-6">
          <p className="text-sm text-muted-foreground">
            Seeking student registration?{' '}
            <Link href="/signup" className="text-primary underline-offset-4 hover:underline">Student admissions</Link>
          </p>
          <Link href="/login" className="text-sm text-primary underline-offset-4 hover:underline">
            Sign in to portal
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
