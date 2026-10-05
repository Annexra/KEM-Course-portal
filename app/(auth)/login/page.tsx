'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/toast-provider';
import { GhostCursorLayer } from '@/components/effects/GhostCursorLayer';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { signIn } from '@/lib/supabase/auth';
import { getDefaultDashboardForRole } from '@/lib/rbac';

const DEMO_USERS = [
  {
    label: 'Dr. Arjun Mehta (Approved Student)',
    email: 'em.resident1@kauvery.org',
    password: 'Kauvery@2026!',
  },
  {
    label: 'Dr. Priya Sharma (Pending Student)',
    email: 'em.resident2@kauvery.org',
    password: 'Kauvery@2026!',
  },
  {
    label: 'Dr. Rajesh V. (Faculty Lead)',
    email: 'dr.rajesh.faculty@kauvery.org',
    password: 'Kauvery@2026!',
  },
  {
    label: 'Dr. Sarah Lin (Super Admin)',
    email: 'dr.sarah.admin@kauvery.org',
    password: 'Kauvery@2026!',
  },
] as const;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { refreshProfile } = useAuthProfile();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (user: (typeof DEMO_USERS)[number]) => {
    setLoading(true);

    try {
      const { data, error } = await signIn(user.email, user.password);

      if (error) {
        const message = error.message.includes('Email not confirmed')
          ? 'This account requires email confirmation before sign-in.'
          : 'Unable to sign in with the selected Supabase account.';

        toast('Authentication Failed', message, 'error');
        return;
      }

      const authenticatedUser = data?.user;
      if (!authenticatedUser) {
        toast('Authentication Failed', 'No active session was returned by Supabase.', 'error');
        return;
      }

      const authState = await refreshProfile(authenticatedUser);
      if (!authState || authState.status === 'error') {
        toast('Role Lookup Failed', authState?.error ?? 'Unable to load your application roles.', 'error');
        router.push('/');
        return;
      }

      if (authState.status === 'profile_missing') {
        toast('Profile Not Available', 'No visible profile matched this email; it may be missing or hidden by database access policy.', 'error');
        router.push('/');
        return;
      }

      if (authState.roleStatus === 'error') {
        toast('Role Lookup Failed', authState.error ?? 'Unable to load your application roles.', 'error');
        router.push('/');
        return;
      }

      if (authState.profile?.status === 'pending') {
        toast('Approval Pending', 'Your profile is awaiting approval.', 'info');
        router.push('/pending');
        return;
      }

      if (authState.profile?.status === 'revoked') {
        toast('Access Revoked', 'This profile is not approved for application access.', 'error');
        router.push('/');
        return;
      }

      if (authState.primaryRole) {
        router.push(getDefaultDashboardForRole(authState.primaryRole));
      } else {
        toast('No Primary Role', 'Your profile has no role or multiple roles without a primary-role rule.', 'info');
        router.push('/');
      }

      toast('Supabase Authentication Successful', `Welcome back, ${authenticatedUser.email ?? 'user'}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected Supabase sign-in error.';
      toast('Authentication Error', message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 font-sans relative overflow-hidden">
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
              <span className="font-black text-2xl tracking-tight text-slate-900 dark:text-white flex items-center gap-1">
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
              {DEMO_USERS.map((user, index) => (
                <Button
                  key={user.email}
                  variant="glass"
                  className={`w-full py-3.5 text-xs font-bold justify-start gap-3 bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 ${
                    index === 2 ? 'text-teal-300' : index === 3 ? 'text-purple-300' : ''
                  }`}
                  onClick={() => handleLogin(user)}
                  isLoading={loading}
                >
                  <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                  {user.label}
                </Button>
              ))}
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
