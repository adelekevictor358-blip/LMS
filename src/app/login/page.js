"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { Mail, Lock, GraduationCap, ArrowRight, Loader2 } from 'lucide-react';
import adminImg from '@/ADMIN.jpg';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const login = useStore(state => state.login);
  const hasHydrated = useStore(state => state._hasHydrated);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  // Wait for store to hydrate before allowing login
  useEffect(() => {
    if (hasHydrated) setReady(true);
  }, [hasHydrated]);

  const validateEmail = (val) => {
    if (!val) return '';
    if (!val.toLowerCase().endsWith('@mtu.edu.ng')) {
      return 'Only @mtu.edu.ng institutional emails are accepted.';
    }
    return '';
  };

  const handleEmailChange = (e) => {
    const val = e.target.value;
    setEmail(val);
    setEmailError(validateEmail(val));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!ready) return;
    setError('');
    setLoading(true);
    const domainErr = validateEmail(email);
    if (domainErr) { setEmailError(domainErr); setLoading(false); return; }
    
    // Login in store is async, so we must await it
    const result = await login(email, password);
    
    if (result.success) {
      if (result.role === 'admin') router.push('/admin');
      else if (result.role === 'lecturer') router.push('/lecturer');
      else router.push('/dashboard');
    } else {
      setError(result.error);
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-6 bg-slate-900 overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 z-0 scale-105 blur-sm opacity-40"
        style={{ backgroundImage: `url(${adminImg.src})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      />
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-transparent" />

      <Card className="relative z-20 w-full max-w-[460px] border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-500 overflow-hidden">
        <div className="h-2 w-full bg-teal-600" />
        <CardHeader className="space-y-4 pt-10 pb-8 text-center">
          <div className="mx-auto flex flex-col items-center justify-center mb-2">
            <div className="h-28 w-28 relative mb-4 drop-shadow-2xl">
              <img src="/mtu-logo.png" alt="Mountain Top University Logo" className="w-full h-full object-contain" />
            </div>
          </div>
          <div className="space-y-2">
            <CardTitle className="text-3xl font-black tracking-tighter">Mountain Top University</CardTitle>
            <CardDescription className="text-muted-foreground font-bold text-sm">
              {!ready ? 'Initializing secure session...' : 'Empowered to Excel · Academic Gateway'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="px-8 pb-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-destructive/10 border-l-4 border-destructive text-destructive text-sm font-bold animate-in slide-in-from-top-2 duration-300">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Institutional Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="yourname@mtu.edu.ng"
                  className={`pl-12 h-12 rounded-xl focus-visible:ring-teal-500 ${emailError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={!ready || loading}
                />
              </div>
              {emailError && (
                <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-1">
                  <span>⚠</span> {emailError}
                </p>
              )}
            </div>

            <div className="space-y-2">
              {/* Reset Credentials button removed — only admin can reset passwords via Admin Portal */}
              <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-3.5 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-12 h-12 rounded-xl focus-visible:ring-teal-500"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!ready || loading}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 ml-1">
              <input type="checkbox" className="rounded-sm border-slate-300 text-teal-600 focus:ring-teal-500" id="remember" />
              <label htmlFor="remember" className="text-xs font-bold text-muted-foreground cursor-pointer select-none">
                Maintain persistent session
              </label>
            </div>

            <Button
              type="submit"
              disabled={!ready || loading}
              className="w-full h-12 bg-teal-600 hover:bg-teal-700 font-black text-white shadow-xl shadow-teal-600/20 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:scale-100"
            >
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...</>
              ) : !ready ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>
              ) : (
                <>Sign In to Portal <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="px-8 py-6 bg-slate-50 dark:bg-slate-900 border-t flex justify-center">
          <p className="text-xs font-bold text-muted-foreground">
            New user?{' '}
            <Link href="/signup" className="text-teal-600 hover:underline">Apply for Registration</Link>
            {' · '}
            <span className="text-slate-400">Password resets via Admin Portal only.</span>
          </p>
        </CardFooter>
      </Card>

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-teal-600/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '3s' }} />
    </div>
  );
}
