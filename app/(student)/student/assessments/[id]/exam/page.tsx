'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getStudentAssessmentPreview, type StudentAssessmentPreview } from '@/lib/supabase/assessments';
import { AlertCircle, ArrowLeft, BookOpen } from 'lucide-react';

export default function AssessmentQuestionPreviewPage({ params }: { params: Promise<{ id: string }> }) {
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
          error: new Error(auth.error ?? 'An approved student profile is required to view assessment questions.'),
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
  const hasCourseAccess = !assessment?.course_id || data.preview?.enrollment?.status === 'active';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />
        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <Link
            href={`/student/assessments/${id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Assessment
          </Link>

          {isLoading ? (
            <div className="space-y-4" aria-label="Loading assessment questions">
              {[0, 1, 2].map((item) => <div key={item} className="h-40 animate-pulse rounded-xl border border-slate-800 bg-slate-900/90" />)}
            </div>
          ) : data.error ? (
            <Card className="border-amber-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h1 className="font-bold">Assessment unavailable</h1>
                  <p className="mt-1 text-sm text-slate-400">Assessment access could not be verified under current database policies.</p>
                </div>
              </CardContent>
            </Card>
          ) : !assessment ? (
            <Card className="border-amber-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h1 className="font-bold">Assessment unavailable</h1>
                  <p className="mt-1 text-sm text-slate-400">This assessment was not found, is outside its availability window, or is not visible.</p>
                </div>
              </CardContent>
            </Card>
          ) : data.preview?.error && assessment.course_id && !data.preview.enrollment ? (
            <Card className="border-amber-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h1 className="font-bold">Enrollment unavailable</h1>
                  <p className="mt-1 text-sm text-slate-400">Enrollment could not be verified under current database access policies.</p>
                </div>
              </CardContent>
            </Card>
          ) : !hasCourseAccess ? (
            <Card className="border-amber-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h1 className="font-bold">Course enrollment required</h1>
                  <p className="mt-1 text-sm text-slate-400">An active enrollment is required to view these questions.</p>
                </div>
              </CardContent>
            </Card>
          ) : data.preview?.error ? (
            <Card className="border-rose-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <h1 className="font-bold">Questions unavailable</h1>
                  <p className="mt-1 text-sm text-slate-400">Question data could not be loaded or is not visible under current database access policies.</p>
                </div>
              </CardContent>
            </Card>
          ) : !data.preview?.questions.length ? (
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-8 text-center">
                <BookOpen className="mx-auto h-7 w-7 text-sky-400" />
                <h1 className="mt-3 font-bold">No visible questions</h1>
                <p className="mt-1 text-sm text-slate-400">No questions are assigned to this assessment or available under current policies.</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <Badge variant={assessment.type === 'mock_test' ? 'warning' : 'danger'}>{assessment.type.replace('_', ' ')}</Badge>
                  <h1 className="mt-2 text-xl font-black text-white">{assessment.title}</h1>
                </div>
                <p className="text-xs text-slate-400">Read-only preview. No attempt has been started.</p>
              </div>

              <div className="space-y-4">
                {data.preview.questions.map((question, index) => (
                  <Card key={question.id} className="border-slate-800 bg-slate-900/90 text-white">
                    <CardHeader className="flex-row items-start justify-between gap-4 space-y-0">
                      <div className="flex items-start gap-3">
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-sky-500/10 text-xs font-bold text-sky-300">
                          {index + 1}
                        </span>
                        <CardTitle className="text-sm leading-relaxed">{question.text}</CardTitle>
                      </div>
                      <Badge variant="outline">{question.difficulty}</Badge>
                    </CardHeader>
                    <CardContent className="space-y-2 pl-14 text-xs">
                      {question.options.length ? question.options.map((option, optionIndex) => (
                        <div key={option.id} className="rounded-lg border border-slate-800 bg-slate-950/40 px-3 py-2 text-slate-300">
                          <span className="mr-2 text-slate-500">{String.fromCharCode(65 + optionIndex)}.</span>{option.text}
                        </div>
                      )) : (
                        <p className="text-slate-500">No visible options are available for this question.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}