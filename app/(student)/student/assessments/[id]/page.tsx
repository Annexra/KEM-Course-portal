'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getStudentAssessmentPreview, type StudentAssessmentPreview } from '@/lib/supabase/assessments';
import { AlertCircle, ArrowLeft, Clock, FileCheck2, ShieldAlert } from 'lucide-react';

export default function AssessmentInstructionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const auth = useAuthProfile();
  const [data, setData] = useState<{
    assessmentId: string | null;
    profileId: string | null;
    loading: boolean;
    preview: StudentAssessmentPreview | null;
    error: Error | null;
  }>({ assessmentId: null, profileId: null, loading: true, preview: null, error: null });

  useEffect(() => {
    if (auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading')) return;

    let isActive = true;
    const timeout = window.setTimeout(() => {
      const profile = auth.profile;
      if (auth.status !== 'profile' || auth.roleStatus !== 'loaded' || !profile || profile.status !== 'approved' || !auth.roles.includes('student')) {
        setData({
          assessmentId: id,
          profileId: null,
          loading: false,
          preview: null,
          error: new Error(auth.error ?? 'An approved student profile is required to view this assessment.'),
        });
        return;
      }

      void getStudentAssessmentPreview(id, profile.id).then((preview) => {
        if (!isActive) return;
        setData({ assessmentId: id, profileId: profile.id, loading: false, preview, error: null });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [auth.error, auth.profile, auth.roleStatus, auth.roles, auth.status, id]);

  const expectedProfileId = auth.status === 'profile' ? auth.profile?.id ?? null : null;
  const isLoading = data.loading || auth.status === 'loading' ||
    (auth.status === 'profile' && auth.roleStatus === 'loading') ||
    data.assessmentId !== id || data.profileId !== expectedProfileId;
  const assessment = data.preview?.assessment ?? null;
  const isEnrolled = !assessment?.course_id || data.preview?.enrollment?.status === 'active';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          <Link
            href="/student/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="max-w-3xl mx-auto space-y-6">
            {isLoading ? (
              <Card className="border-rose-500/30 bg-slate-900/90 text-white">
                <CardContent className="space-y-4 p-8" aria-label="Loading assessment">
                  <div className="h-8 animate-pulse rounded bg-slate-800" />
                  <div className="h-24 animate-pulse rounded bg-slate-800" />
                </CardContent>
              </Card>
            ) : data.error ? (
              <Card className="border-amber-500/30 bg-slate-900/90 text-white">
                <CardContent className="flex items-start gap-3 p-6">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <h1 className="font-bold">Assessment unavailable</h1>
                    <p className="mt-1 text-sm text-slate-400">Assessment access could not be verified under current database policies.</p>
                  </div>
                </CardContent>
              </Card>
            ) : !assessment ? (
              <Card className="border-amber-500/30 bg-slate-900/90 text-white">
                <CardContent className="flex items-start gap-3 p-6">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <h1 className="font-bold">Assessment unavailable</h1>
                    <p className="mt-1 text-sm text-slate-400">This assessment was not found, is outside its availability window, or is not visible under current database policies.</p>
                  </div>
                </CardContent>
              </Card>
            ) : data.preview?.error && assessment.course_id && !data.preview.enrollment ? (
              <Card className="border-amber-500/30 bg-slate-900/90 text-white">
                <CardContent className="flex items-start gap-3 p-6">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <h1 className="font-bold">Enrollment unavailable</h1>
                    <p className="mt-1 text-sm text-slate-400">Enrollment could not be verified under current database access policies.</p>
                  </div>
                </CardContent>
              </Card>
            ) : !isEnrolled ? (
              <Card className="border-amber-500/30 bg-slate-900/90 text-white">
                <CardContent className="flex items-start gap-3 p-6">
                  <AlertCircle className="h-5 w-5 shrink-0 text-amber-400" />
                  <div>
                    <h1 className="font-bold">Course enrollment required</h1>
                    <p className="mt-1 text-sm text-slate-400">An active enrollment in this course is required to view assessment details and questions.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
            <Card className="border-rose-500/30 bg-slate-900/90 text-white shadow-2xl">
              <CardHeader className="text-center space-y-3 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <Badge variant={assessment.type === 'mock_test' ? 'warning' : 'danger'} className="mb-2">
                    {assessment.type === 'mock_test' ? 'MOCK TEST' : 'ASSESSMENT'}
                  </Badge>
                  <CardTitle className="text-2xl font-black">{assessment.title}</CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-1">
                    {assessment.status.toUpperCase()}
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {/* Exam Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Questions</p>
                    <p className="text-lg font-bold text-sky-400 mt-0.5">{data.preview?.questions.length ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Limit</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">{assessment.duration_minutes} Minutes</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Passing Score</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">{assessment.pass_percentage}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Negative Marking</p>
                    <p className="text-lg font-bold text-rose-400 mt-0.5">{assessment.negative_marking > 0 ? `-${assessment.negative_marking}` : 'None'}</p>
                  </div>
                </div>

                <div className="space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <Clock className="w-4 h-4 text-amber-400" /> Availability & attempts
                  </h4>
                  <ul className="space-y-2 leading-relaxed">
                    <li>Maximum attempts: {assessment.max_attempts}</li>
                    <li>Randomized question order: {assessment.randomize_questions ? 'Yes' : 'No'}</li>
                    <li>Randomized option order: {assessment.randomize_options ? 'Yes' : 'No'}</li>
                    {assessment.available_from && <li>Available from: {new Date(assessment.available_from).toLocaleString()}</li>}
                    {assessment.available_until && <li>Available until: {new Date(assessment.available_until).toLocaleString()}</li>}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                  {data.preview?.error ? (
                    <p className="text-xs text-amber-400">Questions are unavailable under current database access policies.</p>
                  ) : data.preview?.questions.length ? (
                  <Link href={`/student/assessments/${assessment.id}/exam`}>
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-2xl shadow-rose-500/20">
                      <FileCheck2 className="w-5 h-5" /> Review Questions
                    </Button>
                  </Link>
                  ) : (
                    <p className="text-xs text-slate-400">No visible questions are assigned to this assessment.</p>
                  )}
                  <p className="text-[10px] text-slate-500">This is a read-only preview. Attempts are not started in this phase.</p>
                </div>
              </CardContent>
            </Card>
            )}
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
