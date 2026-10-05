'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { ExamConfig, ExamUI } from '@/components/exam-ui';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuthProfile } from '@/components/auth-profile-provider';
import {
  createQuestionSnapshot,
  MockTestAttempt,
  MOCK_TESTS,
  readMockTestAttempts,
  saveMockTestAttempt,
} from '@/lib/mock-tests';
import { AlertCircle, ArrowLeft, LoaderCircle } from 'lucide-react';

export function MockTestExam({ testId }: { testId: string }) {
  const { status, roleStatus, profile, roles, scopes, error: authError } = useAuthProfile();
  const [isLoading, setIsLoading] = useState(true);
  const [attempt, setAttempt] = useState<MockTestAttempt | null>(null);
  const [exam, setExam] = useState<ExamConfig | null>(null);
  const [error, setError] = useState('');
  const isAuthLoading = status === 'loading' || (status === 'profile' && roleStatus === 'loading');
  const isPageLoading = isLoading || isAuthLoading;

  useEffect(() => {
    if (isAuthLoading) return;

    const timeout = window.setTimeout(() => {
      const test = MOCK_TESTS.find((item) => item.id === testId);
      if (!test) {
        setError('This mock test is not available.');
        setIsLoading(false);
        return;
      }

      if (status === 'error' || roleStatus === 'error') {
        setError(authError ?? 'Your profile or role assignments could not be loaded.');
        setIsLoading(false);
        return;
      }

      if (status !== 'profile' || !profile) {
        setError(status === 'signed_out'
          ? 'Sign in with an approved student account to start a mock test.'
          : 'No visible application profile is linked to this account; it may be missing or hidden by database access policy.');
        setIsLoading(false);
        return;
      }

      if (profile.status !== 'approved' || !roles.includes('student')) {
        setError('An approved student account is required to start a mock test.');
        setIsLoading(false);
        return;
      }

      const hasScope = !test.courseId || scopes.some(
        (scope) => scope.scopeType === 'global' || (scope.scopeType === 'course' && scope.targetId === test.courseId)
      );
      if (!hasScope) {
        setError('This mock test is not assigned to your course scope.');
        setIsLoading(false);
        return;
      }

      setError('');
      const savedAttempts = readMockTestAttempts(profile.id)
        .filter((item) => item.testId === test.id)
        .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
      let selectedAttempt = savedAttempts.find((item) => item.status === 'in_progress');

      if (!selectedAttempt) {
        if (savedAttempts.length >= test.maxAttempts) {
          setError('You have used all attempts allowed for this test.');
          setIsLoading(false);
          return;
        }

        const lastCompleted = savedAttempts.find((item) => item.status === 'completed');
        const cooldownEndsAt = lastCompleted?.submittedAt
          ? new Date(lastCompleted.submittedAt).getTime() + test.cooldownMinutes * 60_000
          : 0;
        if (cooldownEndsAt > Date.now()) {
          const waitMinutes = Math.ceil((cooldownEndsAt - Date.now()) / 60_000);
          setError(`Your retry cooldown is active. Try again in ${waitMinutes} minute${waitMinutes === 1 ? '' : 's'}.`);
          setIsLoading(false);
          return;
        }

        const startedAt = new Date();
        selectedAttempt = {
          attemptId: window.crypto.randomUUID(),
          testId: test.id,
          userId: profile.id,
          attemptNumber: savedAttempts.length + 1,
          status: 'in_progress',
          startedAt: startedAt.toISOString(),
          expiresAt: new Date(startedAt.getTime() + test.durationMinutes * 60_000).toISOString(),
          questionsSnapshot: createQuestionSnapshot(test),
          selectedAnswers: {},
        };
        saveMockTestAttempt(selectedAttempt);
      }

      setAttempt(selectedAttempt);
      setExam({
        id: test.id,
        title: test.title,
        durationMinutes: test.durationMinutes,
        passPercentage: test.passPercentage,
        negativeMarking: test.negativeMarking,
        questions: selectedAttempt.questionsSnapshot.map((question) => ({
          id: question.id,
          text: question.text,
          explanation: question.explanation,
          marks: question.marks,
          options: question.options,
        })),
      });
      setIsLoading(false);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [authError, isAuthLoading, profile, roleStatus, roles, scopes, status, testId]);

  const updateAnswers = (selectedAnswers: Record<string, string>) => {
    if (!attempt) return;
    const updated = { ...attempt, selectedAnswers };
    setAttempt(updated);
    saveMockTestAttempt(updated);
  };

  const submitAttempt = (result: {
    score: number;
    maxPossibleScore: number;
    percentage: string;
    result: 'pass' | 'fail';
    passPercentage: number;
    submittedAt: string;
    timeSpentSeconds: number;
    selectedAnswers: Record<string, string>;
  }) => {
    if (!attempt) return;
    saveMockTestAttempt({
      ...attempt,
      ...result,
      status: 'completed',
      percentage: Number(result.percentage),
    });
  };

  if (!isLoading && attempt && exam) {
    return (
      <ExamUI
        exam={exam}
        attemptContext={{
          attemptId: attempt.attemptId,
          attemptNumber: attempt.attemptNumber,
          startedAt: attempt.startedAt,
          expiresAt: attempt.expiresAt,
          initialAnswers: attempt.selectedAnswers,
          onAnswersChange: updateAnswers,
          onSubmitted: submitAttempt,
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white">
      <Navbar />
      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />
        <main className="flex-1 p-5 sm:p-8">
          {isPageLoading ? (
            <div className="flex min-h-72 items-center justify-center gap-3 text-sm text-slate-500 dark:text-slate-400" role="status">
              <LoaderCircle className="h-5 w-5 animate-spin text-purple-500" /> Preparing your frozen question set...
            </div>
          ) : (
            <Card className="mx-auto mt-8 max-w-xl border-rose-200 dark:border-rose-500/30">
              <CardContent className="space-y-4 p-6">
                <AlertCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                <div>
                  <h1 className="text-lg font-bold">Unable to start mock test</h1>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{error}</p>
                </div>
                <Link href="/student/mock-tests">
                  <Button variant="outline" size="sm"><ArrowLeft className="h-4 w-4" /> Back to Mock Tests</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}