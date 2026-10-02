'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { MOCK_USERS, saveCurrentUser } from '@/lib/supabase/client';
import { GhostCursorLayer } from '@/components/effects/GhostCursorLayer';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = (userIndex: number) => {
    setLoading(true);
    const selectedUser = MOCK_USERS[userIndex];
    saveCurrentUser(selectedUser);

    setTimeout(() => {
      setLoading(false);
      if (selectedUser.status === 'pending') {
        toast('Account Registration Pending', 'Your profile is awaiting faculty approval.', 'info');
        router.push('/pending');
      } else {
        toast('Google OAuth Authentication Successful', `Welcome back, ${selectedUser.fullName}`, 'success');
        router.push('/student/dashboard');
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white p-4 font-sans relative overflow-hidden">
      {/* GhostCursor Visual Effect */}
      <GhostCursorLayer tone="auth" zIndex={5} />

      {/* Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-slate-800/80 bg-slate-900/90 text-white shadow-2xl backdrop-blur-2xl">
          <CardHeader className="text-center space-y-3 pb-4 border-b border-slate-800/80">
            {/* Kauvery Hospital Logo */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 p-2.5 rounded-2xl bg-white/10 border border-white/20 shadow-xl">
                <img src="/kauvery-icon.svg" alt="Kauvery Hospital" className="w-full h-full object-contain" />
              </div>
              <span className="font-black text-2xl tracking-tight text-white flex items-center gap-1">
                kauvery<span className="text-sm text-slate-400 font-normal">hospital</span>
              </span>
            </div>

            <div>
              <CardTitle className="text-lg font-bold text-slate-200">
                Kauvery EM Residency Portal
              </CardTitle>
              <CardDescription className="text-slate-400 text-xs mt-1">
                Single Sign-On (SSO) for Emergency Medicine Students & Faculty
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="space-y-2.5">
              <Button
                variant="glass"
                className="w-full py-3.5 text-xs font-bold justify-start gap-3 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700"
                onClick={() => handleGoogleLogin(2)}
                isLoading={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Sign in as Dr. Arjun Mehta (Approved Student)
              </Button>

              <Button
                variant="glass"
                className="w-full py-3.5 text-xs font-bold justify-start gap-3 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700"
                onClick={() => handleGoogleLogin(3)}
                isLoading={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Sign in as Dr. Priya Sharma (Pending Student)
              </Button>

              <Button
                variant="glass"
                className="w-full py-3.5 text-xs font-bold justify-start gap-3 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-teal-300"
                onClick={() => handleGoogleLogin(1)}
                isLoading={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Sign in as Dr. Rajesh V. (Faculty Lead)
              </Button>

              <Button
                variant="glass"
                className="w-full py-3.5 text-xs font-bold justify-start gap-3 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-purple-300"
                onClick={() => handleGoogleLogin(0)}
                isLoading={loading}
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                Sign in as Dr. Sarah Lin (Super Admin)
              </Button>
            </div>

            <div className="pt-2 text-center text-[10px] text-slate-500 space-y-1">
              <p className="flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Protected under Kauvery Hospital Security & RBAC Policies
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
