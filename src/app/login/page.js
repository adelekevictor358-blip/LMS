"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import { useState, useEffect } from 'react';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Campus imagery shown in the sign-in carousel (left panel).
const SLIDES = [
  { src: '/study-image-1.jpg', alt: 'Students studying together at Mountain Top University' },
  { src: '/manchi.jpg', alt: 'Mountain Top University campus life' },
  { src: '/dljoy.jpg', alt: 'Mountain Top University campus life' },
  { src: '/ADMIN.jpg', alt: 'Mountain Top University administrative building' },
];

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
  const [slide, setSlide] = useState(0);

  // Wait for store to hydrate before allowing login
  useEffect(() => {
    if (hasHydrated) setReady(true);
  }, [hasHydrated]);

  // Auto-advance the sign-in carousel
  useEffect(() => {
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 5000);
    return () => clearInterval(id);
  }, []);

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
    <main className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Side panel — sliding campus imagery with institutional context */}
      <aside className="relative hidden lg:block overflow-hidden border-r border-border bg-secondary">
        {/* Sliding image track */}
        <div
          className="absolute inset-0 flex transition-transform duration-700 ease-out"
          style={{ width: `${SLIDES.length * 100}%`, transform: `translateX(-${slide * (100 / SLIDES.length)}%)` }}
        >
          {SLIDES.map((s) => (
            <div key={s.src} className="relative h-full" style={{ width: `${100 / SLIDES.length}%` }}>
              <img src={s.src} alt={s.alt} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>

        {/* Legibility overlay (fixed dark tint, theme-independent) */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/45 to-slate-950/25" />

        {/* Brand content over the imagery */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 p-1">
              <img src="/mtu-logo.png" alt="Mountain Top University logo" className="h-full w-full object-contain" />
            </span>
            <span className="font-serif text-lg font-semibold tracking-tight">Mountain Top University</span>
          </div>

          <div className="max-w-prose space-y-4">
            <h2 className="font-serif text-3xl font-semibold tracking-tight text-balance">
              The student and staff portal
            </h2>
            <p className="text-sm leading-relaxed text-white/80 text-pretty">
              Sign in with your institutional account to reach your courses, results, and campus services.
            </p>
            <div className="flex items-center gap-2 pt-1" role="tablist" aria-label="Campus highlights">
              {SLIDES.map((s, i) => (
                <button
                  key={s.src}
                  type="button"
                  onClick={() => setSlide(i)}
                  aria-label={`Show image ${i + 1}`}
                  aria-selected={i === slide}
                  className={`h-1.5 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 ${i === slide ? 'w-7 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/60'}`}
                />
              ))}
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-wide text-white/70">Empowered to excel</p>
        </div>
      </aside>

      {/* Sign-in form */}
      <section className="flex items-center justify-center p-6 animate-fade-in">
        <div className="w-full max-w-sm space-y-8">
          <header className="space-y-3 text-center">
            <img
              src="/mtu-logo.png"
              alt="Mountain Top University logo"
              className="mx-auto h-14 w-14 object-contain lg:hidden"
            />
            <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
              Sign in
            </h1>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {!ready ? 'Preparing your session' : 'Use your @mtu.edu.ng email to continue'}
            </p>
          </header>

          {error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="yourname@mtu.edu.ng"
                  className={`pl-10 h-11 ${emailError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  value={email}
                  onChange={handleEmailChange}
                  required
                  disabled={!ready || loading}
                />
              </div>
              {emailError && (
                <p className="text-xs text-destructive">{emailError}</p>
              )}
            </div>

            <div className="space-y-2">
              {/* Reset Credentials button removed — only admin can reset passwords via Admin Portal */}
              <Label htmlFor="password" className="text-sm font-medium text-foreground">
                Password
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10 h-11"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={!ready || loading}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="h-4 w-4 rounded-sm border-border accent-primary"
              />
              <label
                htmlFor="remember"
                className="text-sm text-muted-foreground cursor-pointer select-none"
              >
                Keep me signed in
              </label>
            </div>

            <Button
              type="submit"
              disabled={!ready || loading}
              className="w-full h-11 active:translate-y-px"
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Signing in</>
              ) : !ready ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Loading</>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <footer className="text-center text-sm text-muted-foreground text-pretty">
            New here?{' '}
            <Link
              href="/signup"
              className="font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline"
            >
              Apply for registration
            </Link>
            <span className="block mt-1 text-xs">Password resets are handled by the admin portal.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}
