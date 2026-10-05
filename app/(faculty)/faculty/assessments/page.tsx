'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getFacultyAssessments } from '@/lib/supabase/assessments';
import type { Assessment } from '@/types/supabase';
import { AlertCircle, FileCheck2, Clock } from 'lucide-react';

export default function FacultyAssessmentsPage() {
  const auth = useAuthProfile();
  const [data, setData] = useState<{ profileId: string | null; loading: boolean; assessments: Assessment[]; error: Error | null }>({
    profileId: null,
    loading: true,
    assessments: [],
    error: null,
  });
  const authLoading = auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading');

  useEffect(() => {
    if (authLoading) return;

    let isActive = true;
    const timeout = window.setTimeout(() => {
      if (auth.status !== 'profile' || auth.roleStatus !== 'loaded' || auth.profile?.status !== 'approved') {
        setData({
          profileId: auth.status === 'profile' ? auth.profile?.id ?? null : null,
          loading: false,
          assessments: [],
          error: new Error(auth.error ?? 'A verified faculty permission is required to view assessments.'),
        });
        return;
      }

      if (!auth.roles.includes('faculty') || !auth.permissions.includes('assessment:manage')) {
        setData({ profileId: auth.profile.id, loading: false, assessments: [], error: new Error('Faculty assessment access is unavailable for this account.') });
        return;
      }

      void getFacultyAssessments(auth.profile.id).then((result) => {
        if (!isActive) return;
        setData({ profileId: auth.profile?.id ?? null, loading: false, assessments: result.data, error: result.error });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [auth.error, auth.permissions, auth.profile, auth.roleStatus, auth.roles, auth.status, authLoading]);

  const isLoading = data.loading || authLoading || (auth.status === 'profile' && data.profileId !== auth.profile?.id);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-teal-400" /> Faculty Assessments & Mock Tests
            </h1>
            <p className="text-xs text-slate-400">
              Read-only assessment records associated with your profile and assigned courses.
            </p>
          </div>

          <div className="max-w-3xl space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold">Assessment Records</CardTitle>
                <CardDescription className="text-xs text-slate-400">Creation and editing are not available in this phase.</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                {isLoading ? (
                  <div className="space-y-3" aria-label="Loading assessments">
                    {[0, 1].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-800" />)}
                  </div>
                ) : data.error ? (
                  <div className="flex items-start gap-3 text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>Assessment records are unavailable under current database access policies.</p>
                  </div>
                ) : data.assessments.length === 0 ? (
                  <p className="text-slate-400">No visible assessments are associated with this profile or its assigned courses.</p>
                ) : (
                  <div className="divide-y divide-slate-800">
                    {data.assessments.map((assessment) => (
                      <div key={assessment.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={assessment.type === 'mock_test' ? 'warning' : 'info'}>{assessment.type.replace('_', ' ')}</Badge>
                            <Badge variant={assessment.status === 'published' ? 'success' : 'outline'}>{assessment.status}</Badge>
                          </div>
                          <p className="font-bold text-white">{assessment.title}</p>
                          <p className="text-slate-400">
                            {assessment.duration_minutes} minutes · Pass {assessment.pass_percentage}% · Max attempts {assessment.max_attempts}
                            {assessment.course_id ? ` · Course ${assessment.course_id}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400">
                          <Clock className="h-4 w-4 text-amber-400" />
                          {assessment.negative_marking > 0 ? `-${assessment.negative_marking} marking` : 'No negative marking'}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
