import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIChatbot } from '@/components/ai-chatbot';
import {
  BookOpen,
  FileCheck2,
  Award,
  Clock,
  ArrowRight,
  Play,
  TrendingUp,
} from 'lucide-react';

export default function StudentDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="success">APPROVED STUDENT</Badge>
                <span className="text-xs text-slate-400">Resident ID: EM-2026-9041</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">Welcome back, Dr. Arjun Mehta</h1>
              <p className="text-xs text-slate-400">
                Department of Emergency Medicine & Trauma Care • Kauvery Hospital
              </p>
            </div>

            <Link href="/student/courses/c1111111-1111-1111-1111-111111111111">
              <Button variant="primary" size="sm">
                <Play className="w-4 h-4 fill-current" /> Resume ACLS Module
              </Button>
            </Link>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Assigned Courses</p>
                  <p className="text-2xl font-black text-white mt-1">2 Courses</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">100% Enrolled</p>
                </div>
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Overall Progress</p>
                  <p className="text-2xl font-black text-teal-400 mt-1">82%</p>
                  <p className="text-[10px] text-slate-400 mt-1">90% watch threshold requirement</p>
                </div>
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Assessments Passed</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">1 / 2</p>
                  <p className="text-[10px] text-amber-300 mt-1">1 Pending Final Exam</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileCheck2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Certificates Earned</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">1 Certificate</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">KEM-2026-8942</p>
                </div>
                <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Assigned Courses Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" /> Active Assigned Courses
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Course Card 1 */}
              <Card className="border-slate-800 bg-slate-900/90 text-white hover:border-sky-500/40 transition-all group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="info">EM-ACLS-101</Badge>
                    <Badge variant="success">85% Complete</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">
                    Advanced Cardiac Life Support (ACLS 2026)
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Emergency resuscitation protocols, lethal arrhythmia management, and post-cardiac arrest syndrome.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Video Modules Watched</span>
                      <span className="text-sky-400 font-bold">85% / 90% Required</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-sky-500 to-teal-400 w-[85%]" />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> 4 Modules • 2.5 Hours
                    </span>
                    <Link href="/student/courses/c1111111-1111-1111-1111-111111111111">
                      <Button variant="primary" size="sm">
                        Continue Learning <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>

              {/* Course Card 2 */}
              <Card className="border-slate-800 bg-slate-900/90 text-white hover:border-teal-500/40 transition-all group">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="info">EM-AIRWAY-202</Badge>
                    <Badge variant="warning">30% Complete</Badge>
                  </div>
                  <CardTitle className="text-lg font-bold mt-2">
                    Emergency Airway Management & RSI
                  </CardTitle>
                  <CardDescription className="text-xs text-slate-400">
                    Rapid Sequence Intubation (RSI) pharmacology, surgical cricothyroidotomy, and difficult airway algorithms.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Video Modules Watched</span>
                      <span className="text-amber-400 font-bold">30% / 90% Required</span>
                    </div>
                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-amber-500 to-teal-400 w-[30%]" />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> 3 Modules • 1.8 Hours
                    </span>
                    <Link href="/student/courses/c2222222-2222-2222-2222-222222222222">
                      <Button variant="secondary" size="sm">
                        Start Modules <ArrowRight className="w-4 h-4 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Upcoming Assessments */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-rose-400" /> Available Assessments & Mock Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-slate-800">
                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="danger">PROCTORED EXAM</Badge>
                      <span className="text-xs text-slate-400 font-mono">Passing: 75%</span>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1">
                      ACLS Final Residency Proctored Examination
                    </h3>
                    <p className="text-xs text-slate-400">
                      30 Questions • 30 Minutes • Negative Marking (-0.25) • Snapshot Evaluation
                    </p>
                  </div>
                  <Link href="/student/assessments/a1111111-1111-1111-1111-111111111111">
                    <Button variant="primary" size="sm">
                      Start Assessment
                    </Button>
                  </Link>
                </div>

                <div className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="warning">MOCK TEST</Badge>
                      <span className="text-xs text-slate-400 font-mono font-medium">Practice Only</span>
                    </div>
                    <h3 className="font-bold text-sm text-white mt-1">
                      Emergency Airway & RSI Practice Mock Exam
                    </h3>
                    <p className="text-xs text-slate-400">
                      15 Questions • 20 Minutes • Immediate Answer Explanations
                    </p>
                  </div>
                  <Link href="/student/mock-tests">
                    <Button variant="outline" size="sm">
                      Take Mock Test
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
