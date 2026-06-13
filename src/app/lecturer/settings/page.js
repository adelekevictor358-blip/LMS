"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Mail, Briefcase, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function LecturerSettings() {
  const { user, changePassword } = useStore();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [status, setStatus] = useState('');

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
    setStatus('ok:Password updated.');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-fade-in">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-2xl md:text-3xl font-semibold tracking-tight text-foreground text-balance">
          Settings
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground text-pretty max-w-prose">
          Manage your faculty profile and account security.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Faculty profile */}
        <aside className="lg:col-span-4 space-y-6">
          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardHeader className="flex flex-col items-center gap-3 pb-6 border-b border-border">
              <Avatar className="h-20 w-20 border border-border">
                <AvatarFallback className="text-xl font-semibold bg-brand-green-soft text-brand-green">
                  {user?.name?.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="text-center space-y-2">
                <CardTitle className="text-lg font-semibold text-foreground">
                  {user?.title} {user?.name}
                </CardTitle>
                <Badge className="bg-brand-green-soft text-brand-green border-transparent rounded-full font-medium">
                  Faculty staff
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Mail size={16} strokeWidth={1.5} /> Official email
                  </dt>
                  <dd className="font-medium text-foreground text-right break-all">{user?.email}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Fingerprint size={16} strokeWidth={1.5} /> Personnel ID
                  </dt>
                  <dd>
                    <Badge variant="outline" className="font-mono text-xs rounded-md">
                      {user?.staffId || user?.id}
                    </Badge>
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <Briefcase size={16} strokeWidth={1.5} /> Institutional rank
                  </dt>
                  <dd className="font-medium text-foreground">{user?.rank || 'Faculty member'}</dd>
                </div>
              </dl>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">College</p>
                  <p className="text-sm font-medium text-foreground">{user?.college}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Program of study</p>
                  <p className="text-sm font-medium text-foreground">{user?.program}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </aside>

        {/* Security and configuration */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">
                  <Lock size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Change password</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Update your portal access credentials.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="current-password" className="text-sm font-medium text-foreground">
                      Current password
                    </Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Current password"
                      className="h-11 rounded-md"
                      value={passwords.current}
                      onChange={e => setPasswords({ ...passwords, current: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="new-password" className="text-sm font-medium text-foreground">
                        New password
                      </Label>
                      <Input
                        id="new-password"
                        type="password"
                        placeholder="Minimum 8 characters"
                        className="h-11 rounded-md"
                        value={passwords.new}
                        onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground">
                        Confirm new password
                      </Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        placeholder="Re-enter new password"
                        className="h-11 rounded-md"
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
                    className={`flex items-center gap-2.5 p-3.5 rounded-md text-sm font-medium animate-fade-in ${
                      status.startsWith('ok')
                        ? 'bg-success/10 text-success'
                        : 'bg-destructive/10 text-destructive'
                    }`}
                  >
                    {status.startsWith('ok')
                      ? <CheckCircle2 size={18} strokeWidth={1.5} className="shrink-0" />
                      : <AlertCircle size={18} strokeWidth={1.5} className="shrink-0" />}
                    {status.split(':')[1]}
                  </div>
                )}

                <Button type="submit" className="h-11 px-8 active:translate-y-px">
                  Update password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">
                    <ShieldCheck size={18} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">Two-step verification</h3>
                    <p className="text-sm text-muted-foreground text-pretty">
                      Add a second layer of protection to your account.
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="active:translate-y-px">
                  Configure 2FA
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
