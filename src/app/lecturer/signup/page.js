"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useMemo } from 'react';
import { GraduationCap, Mail, User, Building2, MapPin, ShieldCheck, Fingerprint, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50";

export default function LecturerSignup() {
  const router = useRouter();
  const signup = useStore(state => state.signup);
  const structure = useStore(state => state.getAcademicStructure());
  const [loading, setLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [accessPIN, setAccessPIN] = useState('');
  const [pinError, setPinError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    staffId: '',
    college: '',
    department: '',
    title: 'Dr.',
    office: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.college || !form.department) {
      alert("Please select your college and department.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = signup({ ...form, role: 'lecturer' });
      if (result.success) {
        router.push('/lecturer');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background px-4 py-12 animate-fade-in">
      <Card className="w-full max-w-2xl border-border shadow-sm">
        <CardHeader className="items-center text-center space-y-3 pb-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-brand-green-soft text-brand-green">
            <GraduationCap size={26} strokeWidth={1.5} />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-balance">
              Faculty onboarding
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-pretty">
              Set up your academic portal account.
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          {!isVerified ? (
            <div className="flex flex-col items-center text-center gap-5 py-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <ShieldCheck size={30} strokeWidth={1.5} />
              </div>
              <div className="space-y-1.5">
                <h2 className="text-lg font-semibold text-foreground">Faculty access verification</h2>
                <p className="text-sm leading-relaxed text-muted-foreground max-w-prose mx-auto text-pretty">
                  To prevent unauthorized access, enter the institutional security PIN provided to you by the HR or IT department.
                </p>
              </div>

              <form onSubmit={checkPIN} className="w-full max-w-xs space-y-4 text-left">
                <div className="space-y-1.5">
                  <Label htmlFor="staff-pin">Staff PIN</Label>
                  <Input
                    id="staff-pin"
                    type="password"
                    placeholder="Enter 9-digit staff PIN"
                    value={accessPIN}
                    onChange={e => setAccessPIN(e.target.value)}
                    className={`h-11 text-center tracking-[0.4em] ${pinError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!pinError}
                  />
                  {pinError && <p className="text-xs text-destructive">{pinError}</p>}
                </div>
                <Button type="submit" className="w-full active:translate-y-px">
                  Verify staff identity
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <section className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Personal credentials
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="title">Title</Label>
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
                  <div className="space-y-1.5 sm:col-span-3">
                    <Label htmlFor="name" className="flex items-center gap-1.5">
                      <User size={16} strokeWidth={1.5} /> Full name (surname last)
                    </Label>
                    <Input id="name" type="text" placeholder="Sarah Jenkins" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required className="h-10" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="staff-id" className="flex items-center gap-1.5">
                      <Fingerprint size={16} strokeWidth={1.5} /> Lecturer ID / staff ID
                    </Label>
                    <Input id="staff-id" type="text" placeholder="LEC/2024/102" value={form.staffId} onChange={e => setForm({...form, staffId: e.target.value})} required className="h-10" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="flex items-center gap-1.5">
                      <Mail size={16} strokeWidth={1.5} /> Official email
                    </Label>
                    <Input id="email" type="email" placeholder="lecturer@uni.edu" value={form.email} onChange={e => setForm({...form, email: e.target.value})} required className="h-10" />
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Institutional placement
                </p>
                <div className="space-y-1.5">
                  <Label htmlFor="college" className="flex items-center gap-1.5">
                    <Building2 size={16} strokeWidth={1.5} /> College / faculty
                  </Label>
                  <select
                    id="college"
                    className={selectClass}
                    value={form.college}
                    onChange={e => setForm({...form, college: e.target.value, department: ''})}
                    required
                  >
                    <option value="">Select college</option>
                    {structure.colleges.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department" className="flex items-center gap-1.5">
                      <Building2 size={16} strokeWidth={1.5} /> Department
                    </Label>
                    <select
                      id="department"
                      className={selectClass}
                      value={form.department}
                      onChange={e => setForm({...form, department: e.target.value})}
                      disabled={!form.college}
                      required
                    >
                      <option value="">Select department</option>
                      {selectedCollege?.programs.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="office" className="flex items-center gap-1.5">
                      <MapPin size={16} strokeWidth={1.5} /> Office
                    </Label>
                    <Input id="office" type="text" placeholder="Block B, 402" value={form.office} onChange={e => setForm({...form, office: e.target.value})} className="h-10" />
                  </div>
                </div>
              </section>

              <div className="flex gap-2.5 rounded-md border-l-2 border-primary bg-muted px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                <Info size={16} strokeWidth={1.5} className="mt-0.5 shrink-0" />
                <p>Your default portal password will be set to your surname in lowercase.</p>
              </div>

              <Button type="submit" className="w-full active:translate-y-px" disabled={loading}>
                {loading ? "Verifying…" : "Create faculty account"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex-col gap-2 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          <p>
            Registering as a student?{' '}
            <Link href="/signup" className="font-medium text-foreground underline-offset-4 hover:underline">
              Sign up here
            </Link>
          </p>
          <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
            Already have an account? Sign in
          </Link>
        </CardFooter>
      </Card>
    </main>
  );
}
