'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AIChatbot } from '@/components/ai-chatbot';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getDepartmentById, getFacultyCourses } from '@/lib/supabase/courses';
import type { Course, Department } from '@/types/supabase';
import { MOCK_CHART_DATA } from '@/lib/mock-data';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
} from 'recharts';
import {
  BookOpen,
  HelpCircle,
  FileCheck2,
  ShieldAlert,
  Plus,
} from 'lucide-react';

export default function FacultyDashboardPage() {
  const auth = useAuthProfile();
  const [courseData, setCourseData] = useState<{
    profileId: string | null;
    loading: boolean;
    courses: Course[];
    department: Department | null;
    courseError: Error | null;
    departmentError: Error | null;
  }>({ profileId: null, loading: true, courses: [], department: null, courseError: null, departmentError: null });

  useEffect(() => {
    if (auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading')) return;

    const timeout = window.setTimeout(() => {
      if (auth.status !== 'profile' || !auth.profile) {
        setCourseData({
          profileId: null,
          loading: false,
          courses: [],
          department: null,
          courseError: auth.status === 'error' ? new Error(auth.error ?? 'Your profile could not be loaded.') : null,
          departmentError: null,
        });
        return;
      }

      const courseRequest = auth.roleStatus === 'error'
        ? Promise.resolve({ data: [], error: new Error(auth.error ?? 'Faculty role assignments could not be loaded.') })
        : auth.roles.includes('faculty')
          ? getFacultyCourses(auth.profile.id)
          : Promise.resolve({ data: [], error: new Error('A faculty role is required to view assigned courses.') });
      const departmentRequest = auth.profile.departmentId
        ? getDepartmentById(auth.profile.departmentId)
        : Promise.resolve({ data: null, error: null });

      void Promise.all([courseRequest, departmentRequest]).then(([courses, department]) => {
        setCourseData({
          profileId: auth.profile?.id ?? null,
          loading: false,
          courses: courses.data,
          department: department.data,
          courseError: courses.error,
          departmentError: department.error,
        });
      });
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [auth.error, auth.profile, auth.roleStatus, auth.roles, auth.status]);

  const dashboardLoading = courseData.loading || auth.status === 'loading' ||
    (auth.status === 'profile' && (auth.roleStatus === 'loading' || courseData.profileId !== auth.profile?.id)) ||
    (auth.status !== 'profile' && courseData.profileId !== null);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border border-teal-500/30 bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="info">
                  {courseData.department?.code ? `DEPT: ${courseData.department.code}` : 'FACULTY WORKSPACE'}
                </Badge>
                <span className="text-xs text-slate-400">{auth.profile?.email ?? 'Profile unavailable'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Faculty Workspace{auth.profile?.fullName ? `: ${auth.profile.fullName}` : ''}
              </h1>
              <p className="text-xs text-slate-400">
                {courseData.departmentError
                  ? 'Department information is unavailable.'
                  : courseData.department?.name ?? (auth.profile?.departmentId ? 'Department not available or not visible.' : 'No department assigned.')}
                {courseData.department ? ' • Kauvery Hospital Residency' : ''}
              </p>
            </div>

            <div className="flex gap-2">
              <Link href="/faculty/question-bank">
                <Button variant="secondary" size="sm">
                  <HelpCircle className="w-4 h-4" /> Question Bank
                </Button>
              </Link>
              <Link href="/faculty/assessments">
                <Button variant="primary" size="sm">
                  <Plus className="w-4 h-4" /> Build Assessment
                </Button>
              </Link>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Department Courses</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {dashboardLoading ? 'Loading' : courseData.courseError ? 'Unavailable' : `${courseData.courses.length} Assigned`}
                  </p>
                  <p className="text-[10px] text-teal-400 mt-1 font-semibold truncate">
                    {courseData.courseError
                      ? 'Assignments unavailable'
                      : courseData.courses.map((course) => course.code).join(' • ') || 'No course assignments'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  <BookOpen className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">MCQs in Question Bank</p>
                  <p className="text-2xl font-black text-sky-400 mt-1">340 Questions</p>
                  <p className="text-[10px] text-sky-400 mt-1 font-semibold">Subject &gt; Topic Hierarchy</p>
                </div>
                <div className="p-3 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  <HelpCircle className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Total Student Attempts</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">128 Attempts</p>
                  <p className="text-[10px] text-amber-300 mt-1">Pass Rate: 88.2%</p>
                </div>
                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  <FileCheck2 className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Integrity Flagged</p>
                  <p className="text-2xl font-black text-rose-400 mt-1">3 Events</p>
                  <p className="text-[10px] text-rose-400 mt-1 font-semibold">Tab switch / blur log</p>
                </div>
                <div className="p-3 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <ShieldAlert className="w-6 h-6" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recharts Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Chart 1: Assessment Attempts & Efficiency Trend */}
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Residency Exam Attempts & Completion Trend</span>
                  <Badge variant="info">Weekly Velocity</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Student exam completions vs pass efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={MOCK_CHART_DATA}>
                      <defs>
                        <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#0284c7" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Area type="monotone" dataKey="created" stroke="#0284c7" fillOpacity={1} fill="url(#colorCreated)" name="Attempts Started" />
                      <Area type="monotone" dataKey="resolved" stroke="#10b981" fillOpacity={1} fill="url(#colorResolved)" name="Passed Exams" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Chart 2: Module Completion Rates */}
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between">
                  <span>Student Watch Completion Percentage</span>
                  <Badge variant="success">90% Rule Enforced</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Video module watch threshold adherence per day
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={MOCK_CHART_DATA}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                      <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                      <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          borderColor: '#334155',
                          borderRadius: '12px',
                          color: '#fff',
                        }}
                      />
                      <Bar dataKey="efficiency" fill="#0d9488" radius={[6, 6, 0, 0]} name="Avg Watch %" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
