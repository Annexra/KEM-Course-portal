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
import { getInitialUser } from '@/lib/supabase/client';
import {
  MOCK_TESTS,
  MockTestAttempt,
  readMockTestAttempts,
} from '@/lib/mock-tests';
import { AlertCircle, ArrowRight, BookOpenCheck, Clock3, RotateCcw, ShieldCheck } from 'lucide-react';

function formatCooldown(seconds: number) {
  const minutes = Math.ceil(seconds / 60);
  return `${minutes} minute${minutes === 1 ? '' : 's'}`;
}

export default function StudentMockTestsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [attempts, setAttempts] = useState<MockTestAttempt[]>([]);
  const [accessError, setAccessError] = useState('');
  const [courseScope, setCourseScope] = useState<{ global: boolean; courseIds: string[] } | null>(null);
  const [nowMs, setNowMs] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const loadMockTests = () => {
      if (cancelled) return;
      try {
        const user = getInitialUser();
        if (user.status !== 'approved' || !user.roles.includes('student')) {
          setAccessError('Mock tests are available to approved student accounts only.');
        } else {
          setStudentId(user.id);
          setAttempts(readMockTestAttempts(user.id));
          setCourseScope({
            global: user.scopes.some((scope) => scope.scopeType === 'global'),
            courseIds: user.scopes.filter((scope) => scope.scopeType === 'course').map((scope) => scope.targetId ?? ''),
          });
        }
      } catch {
        setAccessError('Mock tests could not be loaded. Refresh the page to try again.');
      } finally {
        setNowMs(Date.now());
        setIsLoading(false);
      }
    };
    const timeout = window.setTimeout(loadMockTests, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, []);

  const scopedTests = MOCK_TESTS.filter((test) => {
    if (!test.courseId || !courseScope) return true;
    return courseScope.global || courseScope.courseIds.includes(test.courseId);
  });

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
                  Timed practice with shuffled questions, frozen attempt snapshots, and reviewed explanations.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <ShieldCheck className="h-4 w-4 text-purple-600 dark:text-purple-300" />
                Attempts are saved to this account
              </div>
            </div>
          </section>

          {isLoading ? (
            <div className="grid gap-4 lg:grid-cols-2" aria-label="Loading mock tests">
              {[1, 2].map((item) => (
                <div key={item} className="h-64 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
              ))}
            </div>
          ) : accessError ? (
            <Card className="border-amber-300 bg-white dark:border-amber-500/30 dark:bg-slate-900">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <div>
                  <h2 className="font-bold">Access unavailable</h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{accessError}</p>
                </div>
              </CardContent>
            </Card>
          ) : scopedTests.length === 0 ? (
            <Card className="border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <CardContent className="p-10 text-center">
                <BookOpenCheck className="mx-auto h-8 w-8 text-purple-500" />
                <h2 className="mt-3 font-bold">No mock tests available</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">New practice tests will appear here when they are assigned.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {scopedTests.map((test) => {
                const testAttempts = attempts
                  .filter((attempt) => attempt.testId === test.id && attempt.userId === studentId)
                  .sort((left, right) => right.startedAt.localeCompare(left.startedAt));
                const activeAttempt = testAttempts.find((attempt) => attempt.status === 'in_progress');
                const completedAttempts = testAttempts.filter((attempt) => attempt.status === 'completed');
                const latestAttempt = testAttempts[0];
                const bestScore = completedAttempts.reduce<number | null>(
                  (best, attempt) => best === null || (attempt.percentage ?? 0) > best ? attempt.percentage ?? 0 : best,
                  null
                );
                const lastSubmittedAt = completedAttempts[0]?.submittedAt;
                const cooldownEndsAt = lastSubmittedAt
                  ? new Date(lastSubmittedAt).getTime() + test.cooldownMinutes * 60_000
                  : 0;
                const cooldownSeconds = Math.max(0, Math.ceil((cooldownEndsAt - nowMs) / 1000));
                const attemptsExhausted = testAttempts.length >= test.maxAttempts;
                const retryBlocked = attemptsExhausted || cooldownSeconds > 0;
                const status = activeAttempt ? 'In progress' : latestAttempt ? 'Completed' : 'Not started';

                return (
                  <Card key={test.id} className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
                    <CardHeader className="gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline">{test.subject}</Badge>
                          <Badge variant={status === 'In progress' ? 'warning' : status === 'Completed' ? 'success' : 'info'}>
                            {status}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg">{test.title}</CardTitle>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{test.topic}</p>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        <Clock3 className="h-4 w-4 text-amber-500" /> {test.durationMinutes} min
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 py-4 text-sm dark:border-slate-800 sm:grid-cols-3">
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Questions</p><p className="mt-1 font-bold">{test.questions.length}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Pass mark</p><p className="mt-1 font-bold">{test.passPercentage}%</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Negative marking</p><p className="mt-1 font-bold">{test.negativeMarking > 0 ? `-${test.negativeMarking} mark` : 'None'}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Attempts</p><p className="mt-1 font-bold">{testAttempts.length} / {test.maxAttempts}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Best score</p><p className="mt-1 font-bold text-purple-700 dark:text-purple-300">{bestScore === null ? 'Not yet' : `${bestScore.toFixed(1)}%`}</p></div>
                        <div><p className="text-xs text-slate-500 dark:text-slate-400">Retry rule</p><p className="mt-1 font-bold">{test.cooldownMinutes ? `${test.cooldownMinutes} min cooldown` : 'No cooldown'}</p></div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {activeAttempt
                            ? `Attempt ${activeAttempt.attemptNumber} is saved. Resume to continue.`
                            : attemptsExhausted
                              ? 'Maximum attempts reached.'
                              : cooldownSeconds > 0
                                ? `Retry unlocks in ${formatCooldown(cooldownSeconds)}.`
                                : `Up to ${test.maxAttempts} attempts${test.cooldownMinutes ? `, with a ${test.cooldownMinutes}-minute cooldown` : ''}.`}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {latestAttempt && (
                            <Link href={`/student/results/${latestAttempt.attemptId}`}>
                              <Button variant="outline" size="sm">View Result</Button>
                            </Link>
                          )}
                          <Link href={`/student/mock-tests/${test.id}/exam`}>
                            <Button
                              variant="primary"
                              size="sm"
                              disabled={!activeAttempt && retryBlocked}
                              className="bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 border-0 hover:brightness-110"
                            >
                              {activeAttempt ? 'Resume' : testAttempts.length ? 'Retry' : 'Start'}
                              {activeAttempt ? <ArrowRight className="h-4 w-4" /> : testAttempts.length ? <RotateCcw className="h-3.5 w-3.5" /> : null}
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
      <Footer />
    </div>
  );
}