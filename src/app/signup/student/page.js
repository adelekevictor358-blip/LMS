"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { User, Mail, GraduationCap, Building2, BookOpen, Layers, ArrowRight, ShieldCheck, UserPlus, Fingerprint, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function StudentSignupPage() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  const studentAccessPin = useStore(state => state.studentAccessPin);

  const [isVerified, setIsVerified] = useState(false);
  const [accessPIN, setAccessPIN] = useState('');
  const [pinError, setPinError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    college: '',
    program: '',
    level: '100L',
    matNo: ''
  });
  const [emailError, setEmailError] = useState('');

  const checkPIN = (e) => {
    e.preventDefault();
    if (accessPIN === studentAccessPin) {
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

  const selectClass = "flex h-11 w-full rounded-md border border-input bg-background pl-11 pr-3 py-2 text-sm text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6">
      <Card className="w-full max-w-2xl border-border shadow-sm animate-fade-in">
        <CardHeader className="space-y-4 pt-8 pb-6 text-center border-b border-border">
          <div className="mx-auto h-12 w-12 rounded-xl bg-brand-green-soft flex items-center justify-center">
            <UserPlus size={22} className="text-brand-green" strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
              Student registration
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-muted-foreground text-pretty">
              Register your institutional identity for the new session.
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
                  <h2 className="text-lg font-semibold text-foreground">Student identity verification</h2>
                  <p className="text-sm leading-relaxed text-muted-foreground max-w-prose mx-auto text-pretty">
                    Enter the institution access PIN provided by the admin to continue.
                  </p>
                </div>
              </div>

              <form onSubmit={checkPIN} className="max-w-xs mx-auto space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="student-access-pin" className="text-xs font-medium text-muted-foreground">Institution Access PIN</Label>
                  <Input
                    id="student-access-pin"
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
                  Verify student status
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSignup} className="space-y-8">
              {/* Section 1: Personal identity */}
              <section className="space-y-5">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Personal identity
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-sm font-medium text-foreground">Full legal name</Label>
                    <div className="relative">
                      <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="name" type="text" placeholder="e.g. Victor Adeleke" className="pl-11 h-11" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-foreground">Matriculation email</Label>
                    <div className="relative">
                      <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="yourname@mtu.edu.ng"
                        className={`pl-11 h-11 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                        value={form.email}
                        onChange={handleEmailChange}
                        required
                      />
                    </div>
                    {emailError && (
                      <p className="text-xs leading-relaxed text-destructive flex items-start gap-1.5">
                        <AlertCircle size={14} className="shrink-0 mt-0.5" strokeWidth={1.5} />
                        <span>{emailError}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <Label htmlFor="matNo" className="text-sm font-medium text-foreground">Admission number / matric</Label>
                    <div className="relative">
                      <Fingerprint size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input id="matNo" type="text" placeholder="UNI/2024/001" className="pl-11 h-11" value={form.matNo} onChange={(e) => setForm({...form, matNo: e.target.value})} required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level" className="text-sm font-medium text-foreground">Current academic level</Label>
                    <div className="relative">
                      <Layers size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <select
                        id="level"
                        className={selectClass}
                        value={form.level}
                        onChange={(e) => setForm({...form, level: e.target.value})}
                      >
                        {['100L', '200L', '300L', '400L', '500L'].map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Institutional placement */}
              <section className="space-y-5">
                <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Institutional placement
                </h2>

                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="college" className="text-sm font-medium text-foreground">Assigned college / faculty</Label>
                    <div className="relative">
                      <Building2 size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <select
                        id="college"
                        className={selectClass}
                        value={form.college}
                        onChange={(e) => setForm({...form, college: e.target.value, program: ''})}
                        required
                      >
                        <option value="">Select primary college</option>
                        {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="program" className="text-sm font-medium text-foreground">Proposed program of study</Label>
                    <div className="relative">
                      <GraduationCap size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10" />
                      <select
                        id="program"
                        className={selectClass}
                        value={form.program}
                        onChange={(e) => setForm({...form, program: e.target.value})}
                        disabled={!form.college}
                        required
                      >
                        <option value="">Select major program</option>
                        {selectedCollege?.programs.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>
                    {!form.college && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <BookOpen size={14} className="shrink-0 text-muted-foreground" strokeWidth={1.5} />
                        <span>Select a college first to see available programs.</span>
                      </p>
                    )}
                  </div>
                </div>
              </section>

              <div className="flex gap-3 rounded-xl border border-border bg-muted p-4 text-sm leading-relaxed text-muted-foreground">
                <ShieldCheck size={18} className="shrink-0 mt-0.5 text-brand-green" strokeWidth={1.5} />
                <p>Your initial portal password is set to your surname in lowercase. Please update it after your first sign-in.</p>
              </div>

              <Button type="submit" className="w-full h-11 active:translate-y-px">
                Complete enrollment
                <ArrowRight size={18} />
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-3 border-t border-border px-6 py-6 md:px-8 text-center">
          <p className="text-xs leading-relaxed text-muted-foreground">
            By enrolling, you agree to the university code of scholarly conduct.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-sm">
            <span className="text-muted-foreground">Already have an account?</span>
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </main>
  );
}
