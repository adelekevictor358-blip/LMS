"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Lock, User, ShieldCheck, CheckCircle2, Mail, Briefcase, MapPin, Building, BookOpen, Fingerprint } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
    setStatus('ok:Password updated successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Faculty Orchestration Settings</h1>
        <p className="text-muted-foreground text-lg italic">Governor of your academic authority and platform security.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Faculty Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
            <CardHeader className="flex flex-col items-center pb-8 border-b">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl dark:border-slate-800">
                <AvatarFallback className="text-3xl font-black bg-blue-600 text-white">
                   {user?.name?.split(' ').map(n=>n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center">
                <CardTitle className="text-2xl font-black">{user?.title} {user?.name}</CardTitle>
                <Badge className="mt-2 font-black tracking-widest bg-blue-600 text-white border-none">
                   FACULTY STAFF IDENTITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <Mail className="h-4 w-4" /> Official Email
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{user?.email}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <Fingerprint className="h-4 w-4" /> Personnel ID
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px]">{user?.staffId || user?.id}</Badge>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                    <Briefcase className="h-4 w-4" /> Institutional Rank
                    </span>
                    <span className="font-bold">{user?.rank || 'Faculty Member'}</span>
                 </div>
              </div>

              <Separator />

              <div className="space-y-4 pt-2">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Institutional College</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.college}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-blue-600 tracking-[0.2em]">Program of Study</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.program}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security and Configuration */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="shadow-lg border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <Lock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-bold">Faculty Security Protocol</CardTitle>
                    <CardDescription>Update your official portal access credentials.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Encryption Key</Label>
                      <Input 
                        type="password" 
                        placeholder="Current official password"
                        className="h-12 rounded-xl focus-visible:ring-blue-500" 
                        value={passwords.current} 
                        onChange={e => setPasswords({...passwords, current: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">New Access Token</Label>
                      <Input 
                        type="password" 
                        placeholder="Minimum 8 characters"
                        className="h-12 rounded-xl focus-visible:ring-blue-500"
                        value={passwords.new} 
                        onChange={e => setPasswords({...passwords, new: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Re-authenticate Token</Label>
                      <Input 
                        type="password" 
                        placeholder="Confirm new encryption"
                        className="h-12 rounded-xl focus-visible:ring-blue-500"
                        value={passwords.confirm} 
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {status && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm animate-in zoom-in-95 duration-200 ${status.startsWith('ok') ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-red-50 text-red-700 dark:bg-red-900/20'}`}>
                    {status.startsWith('ok') ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    {status.split(':')[1]}
                  </div>
                )}

                <Button type="submit" className="h-12 px-12 bg-blue-600 hover:bg-blue-700 text-white font-black shadow-lg shadow-blue-600/20 rounded-xl">
                   Synchronize Credentials
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-dashed border-2 bg-slate-50/10 dark:bg-slate-900/20">
            <CardContent className="p-8">
               <div className="flex flex-col md:flex-row items-center gap-6 justify-between text-center md:text-left">
                  <div className="flex gap-4 items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                       <ShieldCheck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black tracking-tight">Institutional 2-Step Verification</h3>
                        <p className="text-sm text-muted-foreground font-medium">Protect your faculty orchestration from unauthorized access.</p>
                    </div>
                  </div>
                  <Button variant="outline" className="font-bold border-2 hover:bg-slate-100 transition-colors px-8">
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
