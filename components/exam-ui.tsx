'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/toast-provider';
import { useTheme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Clock, Bookmark, ChevronLeft, ChevronRight, Maximize2, Moon, Sun } from 'lucide-react';

export interface ExamQuestionOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestionSnapshot {
  id: string;
  text: string;
  explanation: string;
  marks: number;
  options: ExamQuestionOption[];
}

export interface ExamConfig {
  id: string;
  title: string;
  durationMinutes: number;
  passPercentage: number;
  negativeMarking: number;
  questions: ExamQuestionSnapshot[];
}

export interface ExamAttemptContext {
  attemptId: string;
  attemptNumber: number;
  startedAt: string;
  expiresAt: string;
  initialAnswers: Record<string, string>;
  onAnswersChange: (answers: Record<string, string>) => void;
  onSubmitted: (result: ExamResultPayload) => void;
}

export interface ExamResultPayload {
  attemptId: string;
  assessmentId: string;
  assessmentTitle: string;
  score: number;
  maxPossibleScore: number;
  percentage: string;
  result: 'pass' | 'fail';
  passPercentage: number;
  submittedAt: string;
  timeSpentSeconds: number;
  integrityEvents: { type: string; timestamp: string }[];
  selectedAnswers: Record<string, string>;
  questionsSnapshot: ExamQuestionSnapshot[];
  attemptNumber?: number;
  testType?: 'mock_test';
}

export function ExamUI({ exam, attemptContext }: { exam: ExamConfig; attemptContext?: ExamAttemptContext }) {
  const router = useRouter();
  const { toast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const isMockTest = Boolean(attemptContext);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>(
    attemptContext?.initialAnswers ?? {}
  );
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(() => attemptContext
    ? Math.max(0, Math.floor((new Date(attemptContext.expiresAt).getTime() - Date.now()) / 1000))
    : exam.durationMinutes * 60
  );
  const [integrityEvents, setIntegrityEvents] = useState<{ type: string; timestamp: string }[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQ = exam.questions[currentIndex];

  // Request Fullscreen
  const enterFullscreen = () => {
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setIsFullscreen(true);
  };

  const recordIntegrityEvent = useCallback(
    (type: 'fullscreen_exit' | 'tab_change' | 'window_blur') => {
      const eventObj = { type, timestamp: new Date().toISOString() };
      setIntegrityEvents((prev) => [...prev, eventObj]);

      toast(
        'Exam Integrity Alert Registered',
        `Violation detected: ${type.replace('_', ' ').toUpperCase()}. This event has been logged for faculty review.`,
        'error'
      );
    },
    [toast]
  );

  // Monitor Window Blur / Tab Switch & Fullscreen Exit
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordIntegrityEvent('tab_change');
      }
    };

    const handleBlur = () => {
      recordIntegrityEvent('window_blur');
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        recordIntegrityEvent('fullscreen_exit');
      } else {
        setIsFullscreen(true);
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [recordIntegrityEvent]);

  const handleSelectOption = (questionId: string, optionId: string) => {
    const updated = { ...selectedAnswers, [questionId]: optionId };
    setSelectedAnswers(updated);
    attemptContext?.onAnswersChange(updated);
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  };

  const handleSubmitExam = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Calculate score
    let totalScore = 0;
    let maxPossibleScore = 0;

    exam.questions.forEach((q) => {
      maxPossibleScore += q.marks;
      const chosenOptionId = selectedAnswers[q.id];
      if (chosenOptionId) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt && correctOpt.id === chosenOptionId) {
          totalScore += q.marks;
        } else {
          totalScore -= exam.negativeMarking; // Negative marking
        }
      }
    });

    totalScore = Math.max(0, totalScore);
    const percentage = (totalScore / maxPossibleScore) * 100;
    const isPass = percentage >= exam.passPercentage;

    const attemptId = attemptContext?.attemptId ?? `att-${Math.random().toString(36).substring(2, 8)}`;
    const submittedAt = new Date().toISOString();
    const timeSpentSeconds = attemptContext
      ? Math.min(exam.durationMinutes * 60, Math.max(0, Math.floor((Date.now() - new Date(attemptContext.startedAt).getTime()) / 1000)))
      : exam.durationMinutes * 60 - timeLeft;
    const attemptResult = {
      attemptId,
      assessmentId: exam.id,
      assessmentTitle: exam.title,
      score: totalScore,
      maxPossibleScore,
      percentage: percentage.toFixed(1),
      result: isPass ? 'pass' : 'fail',
      passPercentage: exam.passPercentage,
      submittedAt,
      timeSpentSeconds,
      integrityEvents,
      selectedAnswers,
      questionsSnapshot: exam.questions,
      ...(attemptContext ? { attemptNumber: attemptContext.attemptNumber, testType: 'mock_test' as const } : {}),
    };

    localStorage.setItem(`kem_attempt_${attemptId}`, JSON.stringify(attemptResult));
    attemptContext?.onSubmitted({ ...attemptResult, percentage: percentage.toFixed(1), result: isPass ? 'pass' : 'fail' });

    toast(
      isPass ? 'Assessment Passed!' : 'Assessment Completed',
      `Final Score: ${percentage.toFixed(1)}% (${isPass ? 'PASSED' : 'FAILED'})`,
      isPass ? 'success' : 'error'
    );

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }

    router.push(`/student/results/${attemptId}`);
  }, [attemptContext, exam, integrityEvents, isSubmitting, router, selectedAnswers, timeLeft, toast]);

  // Countdown uses the stored expiry so refreshes do not reset the clock.
  useEffect(() => {
    if (timeLeft <= 0) {
      const timeout = window.setTimeout(handleSubmitExam, 0);
      return () => window.clearTimeout(timeout);
    }

    const timer = setInterval(() => {
      setTimeLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitExam, timeLeft]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[200] flex flex-col overflow-hidden bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-white font-sans">
      {/* Top Exam Header */}
      <header className="min-h-16 border-b border-slate-200 bg-white/90 px-3 sm:px-6 py-2 flex items-center justify-between gap-2 dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500/15 via-purple-500/15 to-amber-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm text-slate-900 dark:text-white truncate max-w-[34vw] sm:max-w-md">{exam.title}</h1>
            <p className="hidden sm:flex text-[10px] text-slate-400 items-center gap-2">
              <span>Kauvery EM Examination</span>
              <span className="text-slate-600">•</span>
              <span className="text-rose-400 font-bold">
                Integrity Alerts: {integrityEvents.length}
              </span>
            </p>
          </div>
        </div>

        {/* Timer & Submit */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-4">
          <Button
            variant="outline"
            size="icon"
            aria-label="Toggle light/dark mode"
            title="Toggle light/dark mode"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-500" /> : <Moon className="h-4 w-4" />}
          </Button>
          {!isFullscreen && (
            <Button variant="outline" size="sm" onClick={enterFullscreen} className="text-xs" title="Enter fullscreen">
              <Maximize2 className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Fullscreen Exam</span>
            </Button>
          )}

          <div className="flex items-center gap-1.5 px-2 sm:px-4 py-2 rounded-xl bg-amber-50 border border-amber-300 font-mono text-xs sm:text-sm font-bold text-amber-700 dark:bg-slate-800 dark:border-slate-700 dark:text-amber-400">
            <Clock className="w-4 h-4 animate-pulse text-amber-500 dark:text-amber-400" />
            <span>{formatTimer(timeLeft)}</span>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmitExam}
            isLoading={isSubmitting}
            aria-label="Submit assessment"
            className={isMockTest ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 border-0 shadow-purple-500/20 hover:brightness-110' : ''}
          >
            <span className="hidden sm:inline">Submit Assessment</span><span className="sm:hidden">Submit</span>
          </Button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Area */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Badge variant="info" className={isMockTest ? 'border-purple-500/30 bg-purple-500/10 text-purple-700 dark:text-purple-300' : ''}>Question {currentIndex + 1} of {exam.questions.length}</Badge>
              <Badge variant="outline">{currentQ.marks} Mark(s)</Badge>
              {exam.negativeMarking > 0 && (
                <Badge variant="danger">-{exam.negativeMarking} Negative Mark</Badge>
              )}
            </div>

            <button
              onClick={() => toggleMarkForReview(currentQ.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                markedForReview[currentQ.id]
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-700 dark:text-amber-300'
                  : 'border-slate-300 text-slate-500 hover:text-slate-900 dark:border-slate-700 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              {markedForReview[currentQ.id] ? 'Marked for Review' : 'Mark for Review'}
            </button>
          </div>

          {/* Question Text */}
          <div className="text-lg font-medium leading-relaxed text-slate-800 bg-white p-6 rounded-2xl border border-slate-200 dark:text-slate-100 dark:bg-slate-900/60 dark:border-slate-800">
            {currentQ.text}
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === opt.id;
              const optionLetter = String.fromCharCode(65 + idx);

              const selectedStyles = isMockTest
                ? 'bg-gradient-to-r from-rose-100 via-purple-100 to-amber-100 border-purple-400 text-slate-900 shadow-lg shadow-purple-500/10 dark:from-rose-950/70 dark:via-purple-950/70 dark:to-amber-950/50 dark:border-purple-500 dark:text-white'
                : 'bg-sky-50 border-sky-500 text-slate-900 shadow-lg shadow-sky-500/10 dark:bg-sky-950/60 dark:text-white';

              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelectOption(currentQ.id, opt.id)}
                  className={`w-full p-4 rounded-2xl border text-left flex items-start gap-4 transition-all duration-200 ${
                    isSelected
                      ? selectedStyles
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300 dark:bg-slate-900/40 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:border-slate-700'
                  }`}
                >
                  <span
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? isMockTest ? 'bg-gradient-to-br from-rose-600 via-purple-600 to-amber-500 text-white' : 'bg-sky-500 text-white'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {optionLetter}
                  </span>
                  <span className="text-sm pt-1 font-medium leading-relaxed">{opt.text}</span>
                </button>
              );
            })}
          </div>

          <div className="sticky bottom-0 flex md:hidden items-center justify-between gap-3 border-t border-slate-200 bg-slate-50/95 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
            <Button
              variant="outline"
              size="sm"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((previous) => previous - 1)}
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </Button>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {currentIndex + 1} / {exam.questions.length}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentIndex === exam.questions.length - 1}
              onClick={() => setCurrentIndex((previous) => previous + 1)}
            >
              Next <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </main>

        {/* Sidebar Question Navigator */}
        <aside className="w-80 border-l border-slate-200 bg-white/70 p-6 flex flex-col justify-between hidden md:flex dark:border-slate-800 dark:bg-slate-900/50">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-400 mb-4">
              Question Navigator
            </h3>
            <div className="grid grid-cols-5 gap-2">
              {exam.questions.map((q, idx) => {
                const isAnswered = !!selectedAnswers[q.id];
                const isMarked = !!markedForReview[q.id];
                const isCurrent = currentIndex === idx;

                let stateClass = 'bg-slate-100 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400';
                if (isCurrent) stateClass = isMockTest
                  ? 'ring-2 ring-purple-400 bg-purple-100 text-purple-900 font-bold dark:bg-purple-900 dark:text-white'
                  : 'ring-2 ring-sky-400 bg-sky-100 text-sky-900 font-bold dark:bg-sky-900 dark:text-white';
                else if (isMarked) stateClass = 'bg-amber-100 border-amber-400 text-amber-800 dark:bg-amber-950 dark:border-amber-500/50 dark:text-amber-300';
                else if (isAnswered) stateClass = 'bg-emerald-100 border-emerald-400 text-emerald-800 dark:bg-emerald-950 dark:border-emerald-500/50 dark:text-emerald-300';

                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`h-10 rounded-xl border text-xs font-semibold flex items-center justify-center transition-all ${stateClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-8 space-y-2 text-xs text-slate-500 border-t border-slate-200 pt-4 dark:text-slate-400 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-amber-500/30 border border-amber-500" />
                <span>Marked for Review</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300 dark:bg-slate-800 dark:border-slate-700" />
                <span>Unanswered</span>
              </div>
            </div>
          </div>

          {/* Bottom Nav Prev/Next */}
          <div className="flex gap-2 border-t border-slate-200 pt-4 dark:border-slate-800">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => prev - 1)}
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="flex-1"
              disabled={currentIndex === exam.questions.length - 1}
              onClick={() => setCurrentIndex((prev) => prev + 1)}
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
