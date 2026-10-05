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
import { getDepartmentById, getStudentCourses } from '@/lib/supabase/courses';
import { getStudentAssessments } from '@/lib/supabase/assessments';
import type { Assessment, Department, StudentCourse } from '@/types/supabase';
import {
  BookOpen,
  FileCheck2,
  Award,
  ArrowRight,
  Play,
  TrendingUp,
} from 'lucide-react';

export default function StudentDashboardPage() {
  const auth = useAuthProfile();
  const [courseData, setCourseData] = useState<{
    profileId: string | null;
    loading: boolean;
    courses: StudentCourse[];
    department: Department | null;
    courseError: Error | null;
    departmentError: Error | null;
  }>({ profileId: null, loading: true, courses: [], department: null, courseError: null, departmentError: null });
  const [assessmentData, setAssessmentData] = useState<{
    profileId: string | null;
    loading: boolean;
    assessments: Assessment[];
    error: Error | null;
  }>({ profileId: null, loading: true, assessments: [], error: null });

  useEffect(() => {
    if (auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading')) return;

    const timeout = window.setTimeout(() => {
      if (auth.status !== 'profile' || !auth.profile) {
        setCourseData({
          profileId: null,
          loading: false,
          courses: [],
          department: null,
          courseError: auth.status === 'error'
            ? new Error(auth.error ?? 'Your profile could not be loaded.')
            : auth.status === 'signed_out'
              ? new Error('Sign in to view your enrolled courses.')
              : new Error('No visible profile is linked to this account.'),
          departmentError: null,
        });
        return;
      }

      if (auth.roleStatus === 'error') {
        setCourseData({
          profileId: auth.profile.id,
          loading: false,
          courses: [],
          department: null,
          courseError: new Error(auth.error ?? 'Your role assignments could not be loaded.'),
          departmentError: null,
        });
        return;
      }

      const courseRequest = auth.roles.includes('student')
        ? getStudentCourses(auth.profile.id)
        : Promise.resolve({ data: [], error: new Error('A student role is required to view enrolled courses.') });
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

  useEffect(() => {
    if (auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading')) return;

    let isActive = true;
    const timeout = window.setTimeout(() => {
      if (auth.status !== 'profile' || !auth.profile || auth.profile.status !== 'approved' || !auth.roles.includes('student')) {
        setAssessmentData({
          profileId: auth.status === 'profile' ? auth.profile?.id ?? null : null,
          loading: false,
          assessments: [],
          error: auth.status === 'error' || auth.roleStatus === 'error'
            ? new Error(auth.error ?? 'Assessment access could not be verified.')
            : null,
        });
        return;
      }

      void getStudentAssessments(auth.profile.id).then((result) => {
        if (!isActive) return;
        setAssessmentData({
          profileId: auth.profile?.id ?? null,
          loading: false,
          assessments: result.data,
          error: result.error,
        });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [auth.error, auth.profile, auth.roleStatus, auth.roles, auth.status]);

  const dashboardLoading = courseData.loading || auth.status === 'loading' ||
    (auth.status === 'profile' && (auth.roleStatus === 'loading' || courseData.profileId !== auth.profile?.id)) ||
    (auth.status !== 'profile' && courseData.profileId !== null);
  const assessmentsLoading = assessmentData.loading || auth.status === 'loading' ||
    (auth.status === 'profile' && (auth.roleStatus === 'loading' || assessmentData.profileId !== auth.profile?.id)) ||
    (auth.status !== 'profile' && assessmentData.profileId !== null);
  const departmentLabel = auth.profile?.departmentId
    ? courseData.departmentError
      ? 'Department information unavailable'
      : courseData.department?.name ?? 'Department not available or not visible'
    : 'No department assigned';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* Welcome Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-900">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant={auth.profile?.status === 'approved' ? 'success' : 'warning'}>
                  {auth.profile?.status?.toUpperCase() ?? 'PROFILE UNAVAILABLE'}
                </Badge>
                <span className="text-xs text-slate-400">{auth.profile?.email ?? 'Signed-out session'}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white">
                Welcome{auth.profile?.fullName ? `, ${auth.profile.fullName}` : ''}
              </h1>
              <p className="text-xs text-slate-400">
                {courseData.departmentError ? 'Department information could not be loaded.' : departmentLabel}
                {courseData.department ? ' • Kauvery Hospital' : ''}
              </p>
            </div>

            {courseData.courses[0] && (
              <Link href={`/student/courses/${courseData.courses[0].course.id}`}>
                <Button variant="primary" size="sm">
                  <Play className="w-4 h-4 fill-current" /> Open Course
                </Button>
              </Link>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 font-semibold uppercase">Assigned Courses</p>
                  <p className="text-2xl font-black text-white mt-1">
                    {dashboardLoading ? 'Loading' : courseData.courseError ? 'Unavailable' : `${courseData.courses.length} Courses`}
                  </p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Active enrollments</p>
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
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-sky-400" /> Active Assigned Courses
              </h2>
            </div>

            {dashboardLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Loading courses">
                {[0, 1].map((item) => <div key={item} className="h-52 animate-pulse rounded-xl border border-slate-800 bg-slate-900/90" />)}
              </div>
            ) : courseData.courseError ? (
              <Card className="border-rose-500/30 bg-slate-900/90 text-white">
                <CardContent className="p-6 text-sm text-slate-300">Course data could not be loaded. Check database access and try again.</CardContent>
              </Card>
            ) : courseData.courses.length === 0 ? (
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardContent className="p-6 text-sm text-slate-400">No active published course enrollments are visible to this account.</CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {courseData.courses.map(({ course, enrollment }, index) => (
                  <Card key={course.id} className={`border-slate-800 bg-slate-900/90 text-white transition-all group ${index % 2 === 0 ? 'hover:border-sky-500/40' : 'hover:border-teal-500/40'}`}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-3">
                        <Badge variant="info">{course.code}</Badge>
                        <Badge variant={enrollment.status === 'active' ? 'success' : 'warning'}>{enrollment.status}</Badge>
                      </div>
                      <CardTitle className="text-lg font-bold mt-2">{course.title}</CardTitle>
                      <CardDescription className="text-xs text-slate-400">
                        {course.description ?? 'No course description is available.'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-2 border-t border-slate-800">
                      <div className="flex justify-end">
                        <Link href={`/student/courses/${course.id}`}>
                          <Button variant={index % 2 === 0 ? 'primary' : 'secondary'} size="sm">
                            Open Course <ArrowRight className="w-4 h-4 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Assessments */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-rose-400" /> Available Assessments & Mock Exams
              </CardTitle>
            </CardHeader>
            <CardContent>
              {assessmentsLoading ? (
                <div className="space-y-3" aria-label="Loading assessments">
                  {[0, 1].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-slate-800" />)}
                </div>
              ) : assessmentData.error ? (
                <p className="py-4 text-sm text-amber-400">Assessment data is unavailable under current database access policies.</p>
              ) : assessmentData.assessments.length === 0 ? (
                <p className="py-4 text-sm text-slate-400">No published assessments are currently visible to this account.</p>
              ) : (
                <div className="divide-y divide-slate-800">
                  {assessmentData.assessments.map((assessment) => (
                    <div key={assessment.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant={assessment.type === 'mock_test' ? 'warning' : 'danger'}>
                            {assessment.type === 'mock_test' ? 'MOCK TEST' : 'ASSESSMENT'}
                          </Badge>
                          <span className="text-xs text-slate-400 font-mono">
                            {assessment.duration_minutes} min • Pass: {assessment.pass_percentage}%
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-white mt-1">{assessment.title}</h3>
                        <p className="text-xs text-slate-400">
                          Negative marking: {assessment.negative_marking > 0 ? `-${assessment.negative_marking}` : 'None'}
                          {assessment.available_from ? ` • Available from ${new Date(assessment.available_from).toLocaleString()}` : ''}
                          {assessment.available_until ? ` • Until ${new Date(assessment.available_until).toLocaleString()}` : ''}
                        </p>
                      </div>
                      <Link href={`/student/assessments/${assessment.id}`}>
                        <Button variant="outline" size="sm">View Details</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
