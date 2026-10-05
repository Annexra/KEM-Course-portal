'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GhostCursorLayer } from '@/components/effects/GhostCursorLayer';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getStudentAssessments } from '@/lib/supabase/assessments';
import type { Assessment } from '@/types/supabase';
import { AlertCircle, BookOpenCheck, Clock3, ShieldCheck } from 'lucide-react';

export default function StudentMockTestsPage() {
  const auth = useAuthProfile();
  const [data, setData] = useState<{
    profileId: string | null;
    loading: boolean;
    assessments: Assessment[];
    error: Error | null;
  }>({ profileId: null, loading: true, assessments: [], error: null });
  const isPageLoading = data.loading || auth.status === 'loading' ||
    (auth.status === 'profile' && (auth.roleStatus === 'loading' || data.profileId !== auth.profile?.id)) ||
    (auth.status !== 'profile' && data.profileId !== null);

  useEffect(() => {
    if (auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading')) return;

    let isActive = true;
    const timeout = window.setTimeout(() => {
      const profile = auth.profile;
      if (auth.status !== 'profile' || !profile || auth.roleStatus === 'error' || !auth.roles.includes('student') || profile.status !== 'approved') {
        setData({
          profileId: auth.status === 'profile' ? profile?.id ?? null : null,
          loading: false,
          assessments: [],
          error: auth.status === 'error' || auth.roleStatus === 'error'
            ? new Error(auth.error ?? 'Your profile or role assignments could not be loaded.')
            : new Error(auth.status === 'signed_out'
              ? 'Sign in with an approved student account to view mock tests.'
              : 'An approved student profile and student role are required to view mock tests.'),
        });
        return;
      }

      void getStudentAssessments(profile.id, 'mock_test').then((result) => {
        if (!isActive) return;
        setData({ profileId: profile.id, loading: false, assessments: result.data, error: result.error });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [auth.error, auth.profile, auth.roleStatus, auth.roles, auth.status]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />
        <main className="flex-1 min-w-0 p-5 sm:p-8 space-y-7 overflow-y-auto">
          <section className="relative isolate overflow-hidden rounded-2xl border border-rose-400/30 bg-gradient-to-r from-rose-100 via-purple-100 to-amber-100 dark:from-rose-950/70 dark:via-purple-950/60 dark:to-amber-950/50 px-6 py-7 sm:px-8">
            <GhostCursorLayer tone="subtle" color="#e11d48" zIndex={0} />
            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-2">
                <Badge variant="danger">STUDENT PRACTICE</Badge>
                <h1 className="text-2xl sm:text-3xl font-black">Mock Tests</h1>
                <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                  Published timed practice assessments. Review their details and available questions here.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Read-only assessment details
              </div>
            </div>
          </section>

          {isPageLoading ? (
            <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading mock tests">
              {[1, 2].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
              ))}
            </div>
          ) : data.error ? (
            <Card className="border-amber-300 bg-white dark:border-amber-500/30 dark:bg-slate-900">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold">Access unavailable</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{data.error.message}</p>
                </div>
              </CardContent>
            </Card>
          ) : data.assessments.length === 0 ? (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-10 text-center">
                <BookOpenCheck className="mx-auto h-8 w-8 text-purple-500" />
                <h2 className="mt-3 font-bold">No mock tests available</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">No published mock tests are currently visible to this account.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {data.assessments.map((assessment) => (
                  <Card key={assessment.id} className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
                    <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{assessment.type.replace('_', ' ')}</Badge>
                          <Badge variant="success">{assessment.status}</Badge>
                        </div>
                        <CardTitle className="text-lg">{assessment.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock3 className="h-4 w-4 text-amber-500" /> {assessment.duration_minutes} min
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 py-4 text-sm dark:border-slate-800 sm:grid-cols-3">
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Pass mark</p><p className="mt-1 font-bold">{assessment.pass_percentage}%</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Negative marking</p><p className="mt-1 font-bold">{assessment.negative_marking > 0 ? `-${assessment.negative_marking}` : 'None'}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Maximum attempts</p><p className="mt-1 font-bold">{assessment.max_attempts}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Cooldown</p><p className="mt-1 font-bold">{assessment.cooldown_minutes ? `${assessment.cooldown_minutes} min` : 'None'}</p></div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {assessment.available_until
                            ? `Available until ${new Date(assessment.available_until).toLocaleString()}.`
                            : 'Published mock test.'}
                        </p>
                        <Link href={`/student/assessments/${assessment.id}`}>
                          <Button variant="primary" size="sm" className="bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 border-0 hover:brightness-110">
                            View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
              ))}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}