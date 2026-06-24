"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserCircle, Fingerprint, ArrowRight, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function RegistrationGate() {
  const router = useRouter();

  const roles = [
    {
      title: 'Academic Student',
      description: 'Onboard as a verified undergraduate or postgraduate student for the current session.',
      icon: <UserCircle className="h-6 w-6" strokeWidth={1.5} />,
      link: '/signup/student',
      benefits: ['Global Course Vault', 'CBT Assessment Suite', 'AI Scholarly Assistant']
    },
    {
      title: 'University Faculty',
      description: 'Set up your staff profile for curriculum management and grading.',
      icon: <Fingerprint className="h-6 w-6" strokeWidth={1.5} />,
      link: '/signup/lecturer',
      benefits: ['Curriculum Dispatch', 'Broadcast Oversight', 'Grade Governance']
    }
  ];

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <div className="w-full max-w-4xl space-y-10 animate-fade-in">
        <header className="text-center space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Institutional onboarding
          </p>
          <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
            Choose your role
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground max-w-prose mx-auto text-pretty">
            Select your official role to set up access to the university portal.
          </p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {roles.map((role, i) => (
            <Card
              key={i}
              role="button"
              tabIndex={0}
              onClick={() => router.push(role.link)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); router.push(role.link); } }}
              className="group flex cursor-pointer flex-col shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <CardHeader className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-secondary text-foreground">
                    {role.icon}
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                </div>
                <div className="space-y-1.5">
                  <CardTitle className="text-lg font-semibold text-foreground">{role.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed text-muted-foreground text-pretty">
                    {role.description}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="mt-auto space-y-5">
                <ul className="space-y-2.5">
                  {role.benefits.map((b, bi) => (
                    <li key={bi} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 shrink-0 text-success" strokeWidth={2} />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full active:translate-y-px">
                  Continue as {role.title.split(' ')[1].toLowerCase()}
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>

        <p className="text-center text-sm text-muted-foreground">
          Already part of the institution?{' '}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
