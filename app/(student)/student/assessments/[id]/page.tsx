import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldAlert,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileCheck2,
  ArrowLeft,
  Maximize2,
} from 'lucide-react';

export default function AssessmentInstructionsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
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
            <Card className="border-rose-500/30 bg-slate-900/90 text-white shadow-2xl">
              <CardHeader className="text-center space-y-3 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <Badge variant="danger" className="mb-2">PROCTORED ASSESSMENT</Badge>
                  <CardTitle className="text-2xl font-black">
                    ACLS Final Residency Proctored Examination
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400 mt-1">
                    Kauvery Emergency Medicine Residency Program • Official Evaluation
                  </CardDescription>
                </div>
              </CardHeader>

              <CardContent className="p-8 space-y-6">
                {/* Exam Metadata Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Questions</p>
                    <p className="text-lg font-bold text-sky-400 mt-0.5">30 MCQs</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Time Limit</p>
                    <p className="text-lg font-bold text-amber-400 mt-0.5">30 Minutes</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Passing Score</p>
                    <p className="text-lg font-bold text-emerald-400 mt-0.5">75%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Negative Marking</p>
                    <p className="text-lg font-bold text-rose-400 mt-0.5">-0.25 Marks</p>
                  </div>
                </div>

                {/* Important Rules List */}
                <div className="space-y-3 text-xs text-slate-300">
                  <h4 className="font-bold text-sm text-white uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Exam Rules & Integrity Instructions
                  </h4>
                  <ul className="space-y-2 leading-relaxed">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Fullscreen Mode Required:</strong> The assessment will trigger full-screen mode. Exiting full-screen will record an integrity violation event.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Proctored Event Logging:</strong> Tab switching, opening developer tools, or window blur will log timestamped violation records visible to faculty.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Frozen Snapshot Evaluation:</strong> Question choices and answers are frozen at attempt start to guarantee historical grading stability.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Auto-Submit:</strong> When the 30-minute timer expires, your answers will automatically submit.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Start Exam CTA */}
                <div className="pt-4 border-t border-slate-800 text-center space-y-3">
                  <Link href="/student/assessments/a1111111-1111-1111-1111-111111111111/exam">
                    <Button variant="primary" size="lg" className="w-full sm:w-auto shadow-2xl shadow-rose-500/20">
                      <Maximize2 className="w-5 h-5" /> I Understand, Start Assessment Now
                    </Button>
                  </Link>
                  <p className="text-[10px] text-slate-500">
                    Maximum attempts allowed: 3 • Attempt 1 of 3
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
