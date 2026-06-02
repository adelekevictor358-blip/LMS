"use client";

import { useStore } from '@/store/useStore';
import { useState } from 'react';
import { Lock, User, ShieldCheck, CheckCircle2, Mail, GraduationCap, Phone, Smartphone, SmartphoneNfc } from 'lucide-react';
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
    setStatus('ok:Password updated successfully!');
    setPasswords({ current: '', new: '', confirm: '' });
  };

  return (
    <div className="space-y-8 p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Institutional Account Settings</h1>
        <p className="text-muted-foreground text-lg italic">Governor of your academic identity and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="overflow-hidden border-none shadow-xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950">
            <CardHeader className="flex flex-col items-center pb-8 border-b">
              <Avatar className="h-24 w-24 border-4 border-white shadow-xl dark:border-slate-800">
                <AvatarFallback className="text-3xl font-black bg-teal-600 text-white">
                   {user?.name?.split(' ').map(n=>n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="mt-4 text-center">
                <CardTitle className="text-2xl font-black">{user?.name}</CardTitle>
                <Badge variant="secondary" className="mt-2 font-black tracking-widest text-[#00796B] bg-teal-50">
                   {user?.role?.toUpperCase()} IDENTITY
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-8 space-y-6">
              <div className="space-y-4">
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <Mail className="h-4 w-4" /> Academic Email
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">{user?.email}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <ShieldCheck className="h-4 w-4" /> Matriculation Ref
                    </span>
                    <Badge variant="outline" className="font-mono text-[10px] bg-slate-100 dark:bg-slate-800">{user?.matNo || user?.id}</Badge>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <GraduationCap className="h-4 w-4" /> Level Designation
                    </span>
                    <span className="font-bold">{user?.level}</span>
                 </div>
                 <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground font-semibold">
                       <Phone className="h-4 w-4" /> Contact
                    </span>
                    <span className="font-bold">{phone}</span>
                 </div>
              </div>

              <Separator />

              <div className="space-y-4 pt-2">
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-teal-600 tracking-[0.2em]">Institutional College</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.college || 'N/A'}</p>
                 </div>
                 <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase text-teal-600 tracking-[0.2em]">Program of Study</span>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{user?.program || 'N/A'}</p>
                 </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Security and Configuration */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="shadow-sm border-slate-200 dark:border-slate-800">
            <CardHeader className="border-b bg-slate-50/50 dark:bg-slate-900/50">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-slate-200 dark:bg-slate-800 rounded-lg">
                    <Lock className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                 </div>
                 <div>
                    <CardTitle className="text-xl font-bold">Security Infrastructure</CardTitle>
                    <CardDescription>Update your institutional access credentials.</CardDescription>
                 </div>
              </div>
            </CardHeader>
            <CardContent className="pt-8">
              <form onSubmit={handlePasswordChange} className="max-w-2xl space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Verification Key</Label>
                      <Input 
                        type="password" 
                        placeholder="Current institutional password"
                        className="h-12 rounded-xl border-2 focus-visible:ring-teal-500 bg-slate-50 dark:bg-slate-900" 
                        value={passwords.current} 
                        onChange={e => setPasswords({...passwords, current: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">New Access Token</Label>
                      <Input 
                        type="password" 
                        placeholder="8+ characters recommended"
                        className="h-12 rounded-xl border-2 focus-visible:ring-teal-500 bg-slate-50 dark:bg-slate-900"
                        value={passwords.new} 
                        onChange={e => setPasswords({...passwords, new: e.target.value})} 
                        required 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">Re-authenticate Token</Label>
                      <Input 
                        type="password" 
                        placeholder="Confirm encryption"
                        className="h-12 rounded-xl border-2 focus-visible:ring-teal-500 bg-slate-50 dark:bg-slate-900"
                        value={passwords.confirm} 
                        onChange={e => setPasswords({...passwords, confirm: e.target.value})} 
                        required 
                      />
                    </div>
                  </div>
                </div>

                {status && (
                  <div className={`flex items-center gap-3 p-4 rounded-xl font-bold text-sm animate-in zoom-in-95 duration-200 ${status.startsWith('ok') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                    {status.startsWith('ok') ? <CheckCircle2 className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
                    {status.split(':')[1]}
                  </div>
                )}

                <Button type="submit" className="h-12 px-10 bg-teal-600 hover:bg-teal-700 text-white font-black shadow-lg shadow-teal-600/20 rounded-xl transition-all hover:-translate-y-0.5">
                  Update Security Credentials
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className={`border-2 transition-colors duration-500 ${twoFactorOurs ? 'border-teal-500 bg-teal-50/30' : 'border-dashed bg-slate-50/10 dark:bg-slate-900/20'}`}>
            <CardContent className="p-8">
               <div className="flex flex-col md:flex-row items-center gap-6 justify-between text-center md:text-left">
                  <div className="flex items-center gap-4">
                     <div className={`p-4 rounded-full ${twoFactorOurs ? 'bg-teal-100 text-teal-600' : 'bg-slate-200 text-slate-600'}`}>
                        <SmartphoneNfc className="h-8 w-8" />
                     </div>
                     <div>
                        <h3 className="text-lg font-black tracking-tight dark:text-white">Two-Factor Authentication</h3>
                        <p className="text-sm text-muted-foreground font-medium mt-1">
                          {twoFactorOurs 
                            ? "2FA is active. Your account is secured with a biometric passkey." 
                            : "Add an extra layer of system security to your matriculation identity."}
                        </p>
                     </div>
                  </div>
                  <Button 
                    variant={twoFactorOurs ? "default" : "outline"}
                    className={`font-bold border-2 transition-all ${twoFactorOurs ? 'bg-teal-600 hover:bg-teal-700 text-white' : 'hover:bg-slate-100'}`}
                    onClick={() => {
                      if (!twoFactorOurs) {
                        setTwoFactorOurs(true);
                        alert("Institutional 2FA Protection Activated. Your biometric passkey has been generated.");
                      } else {
                        alert("2FA Security Settings Console: Backup codes and biometric re-registration are available in the IT portal.");
                      }
                    }}
                  >
                     {twoFactorOurs ? 'Manage 2FA Settings' : 'Enable 2FA Protection'}
                  </Button>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
