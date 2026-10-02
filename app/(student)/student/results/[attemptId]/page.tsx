'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Award,
  XCircle,
  FileText,
} from 'lucide-react';

interface ResultOption {
  id: string;
  text: string;
  isCorrect?: boolean;
  is_correct?: boolean;
}

interface ResultQuestion {
  id?: string;
  question_id?: string;
  text: string;
  explanation?: string;
  correct_option_id?: string;
  selected_option_id?: string;
  is_correct?: boolean;
  options?: ResultOption[];
}

interface AttemptResult {
  attemptId: string;
  assessmentTitle: string;
  score: number;
  maxPossibleScore: number;
  percentage: string | number;
  result: 'pass' | 'fail';
  submittedAt: string;
  integrityEvents?: { type: string; timestamp: string }[];
  selectedAnswers?: Record<string, string>;
  questionsSnapshot?: ResultQuestion[];
  timeSpentSeconds?: number;
  passPercentage?: number;
  testType?: string;
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, '0')}s`;
}

export default function ExamResultsPage({ params }: { params: Promise<{ attemptId: string }> }) {
  const { attemptId } = use(params);
  const [attemptData, setAttemptData] = useState<AttemptResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const timeout = window.setTimeout(() => {
      if (cancelled) return;
      let savedResult: AttemptResult | null = null;
      const saved = localStorage.getItem(`kem_attempt_${attemptId}`);
      if (saved) {
        try {
          savedResult = JSON.parse(saved) as AttemptResult;
        } catch {
          savedResult = null;
        }
      }
      setAttemptData(savedResult ?? {
        attemptId,
        assessmentTitle: 'ACLS Final Residency Proctored Examination (2026 Edition)',
        score: 4.75,
        maxPossibleScore: 5.0,
        percentage: '95.0',
        result: 'pass',
        submittedAt: new Date().toISOString(),
        integrityEvents: [],
        selectedAnswers: { 'q-1': 'opt-1b', 'q-2': 'opt-2a', 'q-3': 'opt-3b', 'q-4': 'opt-4b' },
      });
      setIsLoading(false);
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
    };
  }, [attemptId]);

  if (isLoading) {
    return <div className="min-h-screen grid place-items-center bg-slate-50 text-slate-600 dark:bg-slate-950 dark:text-slate-300">Loading attempt result...</div>;
  }
  if (!attemptData) return null;

  const isPass = attemptData.result === 'pass';
  const isMockTest = attemptData.testType === 'mock_test';
  const passPercentage = attemptData.passPercentage ?? 75;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* Result Banner */}
          <div
            className={`p-8 rounded-3xl border text-center space-y-4 shadow-2xl ${
              isMockTest
                ? 'border-purple-300 bg-gradient-to-r from-rose-50 via-purple-50 to-amber-50 dark:border-purple-500/40 dark:from-rose-950/60 dark:via-purple-950/60 dark:to-amber-950/50'
                : isPass
                  ? 'border-emerald-500/40 bg-gradient-to-r from-emerald-50 via-white to-white dark:from-emerald-950/60 dark:via-slate-900 dark:to-slate-900'
                  : 'border-rose-500/40 bg-gradient-to-r from-rose-50 via-white to-white dark:from-rose-950/60 dark:via-slate-900 dark:to-slate-900'
            }`}
          >
            <div
              className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border ${
                isPass ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
              }`}
            >
              {isPass ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
            </div>

            <div>
              <Badge variant={isPass ? 'success' : 'danger'}>
                  {isMockTest ? `MOCK TEST ${isPass ? 'PASSED' : 'FAILED'}` : isPass ? 'ASSESSMENT PASSED' : 'ASSESSMENT FAILED'}
                </Badge>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{attemptData.assessmentTitle}</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Submitted at {new Date(attemptData.submittedAt).toLocaleString()}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 max-w-4xl mx-auto text-center p-4 rounded-2xl bg-white/70 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Your Score</p>
                <p className="text-2xl font-black text-purple-700 dark:text-purple-300 mt-0.5">{attemptData.score} / {attemptData.maxPossibleScore}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Percentage</p>
                <p className={`text-2xl font-black mt-0.5 ${isPass ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {attemptData.percentage}%
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Passing Threshold</p>
                <p className="text-2xl font-black text-slate-700 dark:text-slate-200 mt-0.5">{passPercentage}%</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Taken</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">
                  {formatDuration(attemptData.timeSpentSeconds ?? 0)}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase font-semibold">Integrity Flag</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-0.5">{attemptData.integrityEvents?.length ?? 0} Events</p>
              </div>
            </div>

            {isPass && (
              <div className="pt-2">
                <Link href="/student/certificates">
                  <Button variant="primary" size="lg" className="shadow-2xl shadow-emerald-500/20">
                    <Award className="w-5 h-5" /> View & Download Issued Certificate
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Answer Review Section */}
          <Card className="border-slate-200 bg-white text-slate-900 dark:border-slate-800 dark:bg-slate-900/90 dark:text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-500" /> Answer Explanations Review
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {attemptData.questionsSnapshot?.length ? (
                attemptData.questionsSnapshot.map((question, index) => {
                  const questionId = question.id ?? question.question_id ?? '';
                  const selectedOptionId = question.selected_option_id ?? attemptData.selectedAnswers?.[questionId];
                  const selectedOption = question.options?.find((option) => option.id === selectedOptionId);
                  const correctOption = question.options?.find((option) => option.isCorrect || option.is_correct)
                    ?? question.options?.find((option) => option.id === question.correct_option_id);
                  const isCorrect = question.is_correct ?? Boolean(selectedOption && (selectedOption.isCorrect ?? selectedOption.is_correct));

                  return (
                    <article key={questionId || index} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                        <h3 className="font-bold text-purple-700 dark:text-purple-300">Question {index + 1}</h3>
                        <Badge variant={isCorrect ? 'success' : 'danger'}>{isCorrect ? 'Correct' : selectedOption ? 'Incorrect' : 'Unanswered'}</Badge>
                      </div>
                      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">{question.text}</p>
                      <div className="space-y-2 text-sm">
                        <p className="text-slate-600 dark:text-slate-300">
                          Your answer: <span className="font-semibold">{selectedOption?.text ?? 'No answer selected'}</span>
                        </p>
                        <p className="text-emerald-700 dark:text-emerald-300">
                          Correct answer: <span className="font-semibold">{correctOption?.text ?? 'Unavailable'}</span>
                        </p>
                      </div>
                      {question.explanation && (
                        <p className="border-t border-slate-200 pt-3 text-xs leading-relaxed text-slate-600 dark:border-slate-800 dark:text-slate-400">
                          {question.explanation}
                        </p>
                      )}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                  Detailed question review is unavailable for this legacy result.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <Footer />
    </div>
  );
}
