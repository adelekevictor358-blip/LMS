"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, AlertCircle, Mail, Briefcase, Fingerprint, Bell, HelpCircle, Library, ClipboardList, GraduationCap, BookOpen, ShieldAlert, Archive, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const NOTIFICATION_TYPES = [
  { type: 'quiz', label: 'Quizzes', description: 'New quizzes and assessment reminders.', icon: HelpCircle },
  { type: 'material', label: 'Course materials', description: 'Uploaded lecture notes and resources.', icon: Library },
  { type: 'assignment', label: 'Assignments', description: 'New assignments and submission deadlines.', icon: ClipboardList },
  { type: 'result', label: 'Results', description: 'Released grades and result updates.', icon: GraduationCap },
  { type: 'registration', label: 'Registration', description: 'Course registration windows and reminders.', icon: BookOpen },
  { type: 'security', label: 'Security', description: 'Sign-in and account security alerts.', icon: ShieldAlert },
  { type: 'pastq', label: 'Past questions', description: 'Newly added past question papers.', icon: Archive },
  { type: 'message', label: 'Messages', description: 'Direct messages and chat activity.', icon: MessageSquare },
  { type: 'system', label: 'System', description: 'Institutional broadcasts and announcements.', icon: Bell },
];

export default function LecturerSettings() {
  const { user, changePassword, toggleNotificationType } = useStore();
  const mutedTypes = user?.mutedNotificationTypes ?? [];
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

          <Card className="bg-card border border-border rounded-xl shadow-sm">
            <CardHeader className="border-b border-border">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted shrink-0">
                  <Bell size={18} className="text-muted-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Notification preferences</CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Choose which alerts you receive. Turning one off mutes that type everywhere.
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {NOTIFICATION_TYPES.map(({ type, label, description, icon: Icon }) => {
                  const enabled = !mutedTypes.includes(type);
                  return (
                    <div key={type} className="flex items-center justify-between gap-4 p-5 transition-colors hover:bg-muted/40">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground text-pretty">{description}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={enabled}
                        aria-label={`${enabled ? 'Disable' : 'Enable'} ${label} notifications`}
                        className={`w-11 h-6 shrink-0 rounded-full p-0.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${enabled ? 'bg-primary' : 'bg-muted'}`}
                        onClick={() => toggleNotificationType(type)}
                      >
                        <div className={`h-5 w-5 rounded-full bg-card shadow-sm transition-transform ${enabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
