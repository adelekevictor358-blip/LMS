"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Mail, GraduationCap, Phone, KeyRound } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function StudentSettings() {
  const { user, changePassword } = useStore();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [status, setStatus] = useState('');

  // Simulated states for extra settings
  const [twoFactorOurs, setTwoFactorOurs] = useState(false);
  const [phone, setPhone] = useState(user?.phone || '+234 800 000 0000');

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwords.current !== user.password) {
      setStatus('err:Current password incorrect.');
      return;
    }
    if (passwords.new !== passwords.confirm) {
      setStatus('err:Passwords do not match.');
      return;
    }
    changePassword(user.id, passwords.new);
    setStatus('ok:Your password has been updated.');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <main className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Account settings
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
          Manage your profile details and account security.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Profile card */}
        <section className="lg:col-span-4 space-y-6">
          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardHeader className="flex flex-col items-center pb-6 border-b border-border">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarFallback className="text-xl font-semibold bg-secondary text-secondary-foreground">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground">{user?.name}</CardTitle>
                <Badge variant="secondary" className="font-medium">
                  {user?.role} account
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <dl className="space-y-4">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} strokeWidth={1.5} /> Academic email
                  </dt>
                  <dd className="font-medium text-foreground text-right">{user?.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <ShieldCheck size={16} strokeWidth={1.5} /> Matriculation ref
                  </dt>
                  <dd>
                    <Badge variant="outline" className="font-mono text-[10px] tabular-nums">{user?.matNo || user?.id}</Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <GraduationCap size={16} strokeWidth={1.5} /> Level
                  </dt>
                  <dd className="font-medium text-foreground">{user?.level}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 text-sm">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={16} strokeWidth={1.5} /> Contact
                  </dt>
                  <dd className="font-medium text-foreground">{phone}</dd>
                </div>
              </dl>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">College</span>
                  <p className="text-sm font-medium text-foreground">{user?.college || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground">Program of study</span>
                  <p className="text-sm font-medium text-foreground">{user?.program || 'N/A'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Security and configuration */}
        <section className="lg:col-span-8 space-y-6">
          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                  <Lock size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Change password</CardTitle>
                  <CardDescription>Update the password you use to sign in.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-xs font-medium text-muted-foreground">Current password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Current password"
                      className="h-11"
                      value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-xs font-medium text-muted-foreground">New password</Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="At least 8 characters"
                        className="h-11"
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-xs font-medium text-muted-foreground">Confirm new password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter new password"
                        className="h-11"
                        value={passwords.confirm}
                        onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                {status && (
                  <div
                    role="status"
                    className={`flex items-center gap-2.5 p-3 rounded-md border text-sm ${
                      status.startsWith('ok')
                        ? 'bg-success/10 text-success border-transparent'
                        : 'bg-destructive/10 text-destructive border-transparent'
                    }`}
                  >
                    {status.startsWith('ok')
                      ? <CheckCircle2 size={16} strokeWidth={1.5} />
                      : <AlertCircle size={16} strokeWidth={1.5} />}
                    <span>{status.split(':')[1]}</span>
                  </div>
                )}

                <Button type="submit" className="active:translate-y-px">
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-5 md:justify-between">
                <div className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                    <KeyRound size={18} strokeWidth={1.5} />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-foreground">Two-factor authentication</h3>
                      {twoFactorOurs && (
                        <Badge className="bg-success/10 text-success border-transparent font-medium">Active</Badge>
                      )}
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground max-w-prose text-pretty">
                      {twoFactorOurs
                        ? "Two-factor authentication is on. Your account is protected with a passkey."
                        : "Add an extra layer of security to your account at sign in."}
                    </p>
                  </div>
                </div>
                <Button
                  variant={twoFactorOurs ? "outline" : "default"}
                  className="shrink-0 active:translate-y-px"
                  onClick={() => {
                    if (!twoFactorOurs) {
                      setTwoFactorOurs(true);
                      alert("Institutional 2FA Protection Activated. Your biometric passkey has been generated.");
                    } else {
                      alert("2FA Security Settings Console: Backup codes and biometric re-registration are available in the IT portal.");
                    }
                  }}
                >
                  {twoFactorOurs ? 'Manage' : 'Enable'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
