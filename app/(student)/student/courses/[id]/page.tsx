'use client';

import React, { use, useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AIChatbot } from '@/components/ai-chatbot';
import { ArrowLeft, AlertCircle, Building2, BookOpen, ExternalLink, FileText, PlayCircle } from 'lucide-react';
import { useAuthProfile } from '@/components/auth-profile-provider';
import {
  getCourseEnrollment,
  getDepartmentById,
  getPublishedCourseById,
} from '@/lib/supabase/courses';
import { getCourseLearningContent, type CourseLearningContent } from '@/lib/supabase/learning';
import type { Course, CourseEnrollment, Department, ModuleMaterial } from '@/types/supabase';

function getSafeMaterialUrl(value: string): string | null {
  const url = value.trim();
  if (!url) return null;

  if (/^https?:\/\//i.test(url)) {
    try {
      const parsed = new URL(url);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:' ? url : null;
    } catch {
      return null;
    }
  }

  return url.startsWith('/') && !url.startsWith('//') || /^\.\.?\//.test(url) ? url : null;
}

function getMaterialTypeLabel(type: ModuleMaterial['type']) {
  switch (type) {
    case 'pdf':
      return 'PDF';
    case 'document':
      return 'Document';
    case 'reading':
      return 'Reading';
    case 'activity':
      return 'Activity';
    case 'video':
      return 'Video';
  }
}

function formatDuration(durationSeconds: number | null) {
  if (!durationSeconds || durationSeconds <= 0) return null;
  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;
  return minutes > 0 ? `${minutes} min ${seconds > 0 ? `${seconds} sec` : ''}`.trim() : `${seconds} sec`;
}

export default function CoursePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const auth = useAuthProfile();
  const [courseState, setCourseState] = useState<{
    courseId: string | null;
    loading: boolean;
    course: Course | null;
    department: Department | null;
    error: Error | null;
    departmentError: Error | null;
  }>({ courseId: null, loading: true, course: null, department: null, error: null, departmentError: null });
  const [enrollmentState, setEnrollmentState] = useState<{
    courseId: string | null;
    profileId: string | null;
    status: 'loading' | 'enrolled' | 'not_enrolled' | 'unavailable' | 'error';
    enrollment: CourseEnrollment | null;
    error: Error | null;
  }>({ courseId: null, profileId: null, status: 'loading', enrollment: null, error: null });
  const [learningState, setLearningState] = useState<{
    courseId: string | null;
    profileId: string | null;
    loading: boolean;
    content: CourseLearningContent | null;
  }>({ courseId: null, profileId: null, loading: true, content: null });
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadCourse = async () => {
      const result = await getPublishedCourseById(id);
      const departmentResult = result.data?.department_id
        ? await getDepartmentById(result.data.department_id)
        : { data: null, error: null };

      if (!isActive) return;
      setCourseState({
        courseId: id,
        loading: false,
        course: result.data,
        department: departmentResult.data,
        error: result.error,
        departmentError: departmentResult.error,
      });
    };

    void loadCourse();
    return () => {
      isActive = false;
    };
  }, [id]);

  useEffect(() => {
    let isActive = true;
    const authError = auth.status === 'error' || (auth.status === 'profile' && auth.roleStatus === 'error');
    const profileId = auth.status === 'profile' && auth.roleStatus === 'loaded' && auth.roles.includes('student')
      ? auth.profile?.id ?? null
      : null;
    const request = authError
      ? Promise.resolve({ data: null, error: new Error(auth.error ?? 'The authenticated profile or role could not be verified.') })
      : profileId
        ? getCourseEnrollment(id, profileId)
        : Promise.resolve({ data: null, error: null });

    void request.then((result) => {
      if (!isActive) return;
      setEnrollmentState({
        courseId: id,
        profileId,
        status: result.error ? 'error' : profileId ? result.data ? 'enrolled' : 'not_enrolled' : 'unavailable',
        enrollment: result.data,
        error: result.error,
      });
    });

    return () => {
      isActive = false;
    };
  }, [auth.error, auth.profile?.id, auth.roleStatus, auth.roles, auth.status, id]);

  const hasLearningAccess = auth.status === 'profile'
    && auth.roleStatus === 'loaded'
    && auth.roles.includes('student')
    && enrollmentState.courseId === id
    && enrollmentState.profileId === auth.profile?.id
    && enrollmentState.status === 'enrolled'
    && enrollmentState.enrollment?.course_id === id
    && enrollmentState.enrollment?.status !== 'dropped';

  useEffect(() => {
    if (!hasLearningAccess || !auth.profile?.id || courseState.courseId !== id || !courseState.course) return;

    let isActive = true;
    void getCourseLearningContent(id).then((content) => {
      if (!isActive) return;
      setLearningState({
        courseId: id,
        profileId: auth.profile?.id ?? null,
        loading: false,
        content,
      });
    });

    return () => {
      isActive = false;
    };
  }, [auth.profile?.id, courseState.course, courseState.courseId, hasLearningAccess, id]);

  const authLoading = auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading');
  const expectedProfileId = auth.status === 'profile' && auth.roleStatus === 'loaded' && auth.roles.includes('student')
    ? auth.profile?.id ?? null
    : null;
  const enrollmentLoading = authLoading || enrollmentState.status === 'loading' ||
    enrollmentState.courseId !== id || enrollmentState.profileId !== expectedProfileId;
  const courseLoading = courseState.loading || courseState.courseId !== id;
  const learningLoading = hasLearningAccess && (
    learningState.loading || learningState.courseId !== id || learningState.profileId !== auth.profile?.id
  );
  const modules = learningState.content?.modules ?? [];
  const materials = modules.flatMap((module) => module.materials);
  const activeMaterial = materials.find((material) => material.id === selectedMaterialId) ?? materials[0] ?? null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Breadcrumb Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/student/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Link>

            <Badge variant="info">{courseState.course ? `Course: ${courseState.course.code}` : 'Course Details'}</Badge>
          </div>

          {courseLoading || enrollmentLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" aria-label="Loading course">
              <div className="lg:col-span-2 h-72 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/90" />
              <div className="h-56 animate-pulse rounded-2xl border border-slate-800 bg-slate-900/90" />
            </div>
          ) : courseState.error || !courseState.course ? (
            <Card className="border-amber-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
                <div>
                  <h1 className="font-bold">Course unavailable</h1>
                  <p className="mt-1 text-sm text-slate-400">
                    This course was not found, is not published, or is not visible under current database access policies.
                  </p>
                  {courseState.error && <p className="mt-2 text-xs text-slate-500">Course data could not be loaded. Try again later.</p>}
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="border-slate-800 bg-slate-900/90 text-white">
                  <CardHeader className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <Badge variant="info">{courseState.course.code}</Badge>
                      <Badge variant="success">{courseState.course.status}</Badge>
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-black">{courseState.course.title}</CardTitle>
                    <CardDescription className="text-sm text-slate-400">
                      {courseState.course.description ?? 'No course description is available.'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 border-t border-slate-800 pt-4 text-xs text-slate-400">
                    <p className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-sky-400" />
                      {courseState.course.department_id
                        ? courseState.departmentError
                          ? 'Department information is unavailable.'
                          : courseState.department?.name ?? 'Department not available or not visible.'
                        : 'No department assigned.'}
                    </p>
                    <p>Enrollment: {enrollmentState.status === 'error'
                      ? 'Status unavailable.'
                      : enrollmentState.status === 'unavailable'
                        ? 'Sign in to view enrollment status.'
                        : enrollmentState.status === 'not_enrolled'
                          ? 'No visible enrollment record was found.'
                          : enrollmentState.enrollment?.status ?? 'Loading.'}
                    </p>
                    {enrollmentState.status === 'error' && (
                      <p className="text-amber-400">Enrollment status could not be loaded. No enrollment was created.</p>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card className="border-slate-800 bg-slate-900/90 text-white">
                  <CardHeader>
                    <CardTitle className="text-sm font-bold flex items-center justify-between">
                      <span>Course Modules</span>
                      <span className="text-xs text-sky-400 font-mono">
                        {learningLoading ? 'Loading' : `${modules.length} Modules`}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-xs text-slate-400">
                    {!hasLearningAccess ? (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
                        <p>
                          {auth.status === 'error' || (auth.status === 'profile' && auth.roleStatus === 'error')
                            ? 'Learning access could not be verified under current database access policies.'
                            : auth.status !== 'profile'
                              ? 'Sign in with an approved, enrolled student profile to view course learning content.'
                              : !auth.roles.includes('student')
                                ? 'A student role is required to view course learning content.'
                                : enrollmentState.status === 'error'
                                  ? 'Enrollment status is unavailable. Learning content is hidden until access can be confirmed.'
                                  : enrollmentState.status === 'not_enrolled' || enrollmentState.enrollment?.status === 'dropped'
                                    ? 'An active or completed enrollment is required to view course learning content.'
                                    : 'Course enrollment could not be confirmed.'}
                        </p>
                      </div>
                    ) : learningLoading ? (
                      <div className="space-y-2" aria-label="Loading modules and materials">
                        {[0, 1, 2].map((item) => <div key={item} className="h-10 animate-pulse rounded-lg bg-slate-800" />)}
                      </div>
                    ) : learningState.content?.moduleError ? (
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        <p>Course modules could not be loaded or are not visible under current database access policies.</p>
                      </div>
                    ) : modules.length === 0 ? (
                      <div className="flex items-start gap-3">
                        <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-sky-400" />
                        <p>No visible modules are available for this course.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {learningState.content?.materialError && (
                          <div className="flex items-start gap-2 text-amber-400">
                            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                            <p>Materials could not be loaded or are not visible under current database access policies.</p>
                          </div>
                        )}
                        {modules.map((module) => (
                          <section key={module.id} className="space-y-2">
                            <h2 className="font-bold text-slate-200">{module.title}</h2>
                            {learningState.content?.materialError ? null : module.materials.length === 0 ? (
                              <p className="pl-3 text-slate-500">No materials are available for this module.</p>
                            ) : (
                              <ul className="space-y-1">
                                {module.materials.map((material) => {
                                  const isSelected = activeMaterial?.id === material.id;
                                  const duration = formatDuration(material.duration_seconds);
                                  return (
                                    <li key={material.id}>
                                      <button
                                        type="button"
                                        onClick={() => setSelectedMaterialId(material.id)}
                                        aria-pressed={isSelected}
                                        className={`flex w-full items-center justify-between gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${isSelected
                                          ? 'border-sky-500/50 bg-sky-500/10 text-white'
                                          : 'border-slate-800 bg-slate-950/30 text-slate-300 hover:bg-slate-800/60'
                                        }`}
                                      >
                                        <span className="flex min-w-0 items-center gap-2">
                                          {material.type === 'video'
                                            ? <PlayCircle className="h-4 w-4 shrink-0 text-sky-400" />
                                            : <FileText className="h-4 w-4 shrink-0 text-teal-400" />}
                                          <span className="truncate">{material.title}</span>
                                        </span>
                                        <span className="shrink-0 text-[10px] capitalize text-slate-500">
                                          {getMaterialTypeLabel(material.type)}{duration ? ` · ${duration}` : ''}
                                        </span>
                                      </button>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </section>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {!courseLoading && !courseState.error && courseState.course && hasLearningAccess && !learningLoading && !learningState.content?.moduleError && !learningState.content?.materialError && activeMaterial && (
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-base flex items-center justify-between gap-3">
                  <span className="min-w-0 truncate">{activeMaterial.title}</span>
                  <Badge variant="info">{getMaterialTypeLabel(activeMaterial.type)}</Badge>
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  {activeMaterial.is_required === null ? 'Requirement not specified.' : activeMaterial.is_required ? 'Required material' : 'Optional material'}
                  {formatDuration(activeMaterial.duration_seconds) ? ` · ${formatDuration(activeMaterial.duration_seconds)}` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {getSafeMaterialUrl(activeMaterial.url) ? (
                  activeMaterial.type === 'video' ? (
                    <video
                      key={activeMaterial.id}
                      controls
                      preload="metadata"
                      src={getSafeMaterialUrl(activeMaterial.url) ?? undefined}
                      className="aspect-video w-full rounded-xl bg-black"
                    >
                      Your browser does not support video playback.
                    </video>
                  ) : (
                    <a
                      href={getSafeMaterialUrl(activeMaterial.url) ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-sky-500/30 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-300 hover:bg-sky-500/20"
                    >
                      <ExternalLink className="h-4 w-4" /> Open {getMaterialTypeLabel(activeMaterial.type)}
                    </a>
                  )
                ) : (
                  <div className="flex items-center gap-2 text-sm text-amber-400">
                    <AlertCircle className="h-4 w-4" /> This material has no usable URL.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
