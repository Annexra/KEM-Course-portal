'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Building2 } from 'lucide-react';
import { getDepartments, getPublishedCourses } from '@/lib/supabase/courses';
import type { Course, Department } from '@/types/supabase';

export default function DepartmentsPage() {
  const [data, setData] = useState<{
    loading: boolean;
    departments: Department[];
    courses: Course[];
    departmentError: Error | null;
    courseError: Error | null;
  }>({ loading: true, departments: [], courses: [], departmentError: null, courseError: null });

  useEffect(() => {
    let isActive = true;
    void Promise.all([getDepartments(), getPublishedCourses()]).then(([departments, courses]) => {
      if (!isActive) return;
      setData({
        loading: false,
        departments: departments.data,
        courses: courses.data,
        departmentError: departments.error,
        courseError: courses.error,
      });
    });

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-rose-400" /> Departments & Scope Boundaries
            </h1>
            <p className="text-xs text-slate-400">
              Manage Kauvery Hospital Academic Departments and scope definitions.
            </p>
          </div>

          {data.loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" aria-label="Loading departments">
              {[0, 1].map((item) => <div key={item} className="h-48 animate-pulse rounded-xl border border-slate-800 bg-slate-900/90" />)}
            </div>
          ) : data.departmentError ? (
            <Card className="border-rose-500/30 bg-slate-900/90 text-white">
              <CardContent className="flex items-start gap-3 p-6">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
                <div>
                  <h2 className="font-bold">Department data unavailable</h2>
                  <p className="mt-1 text-sm text-slate-400">Department records could not be loaded under the current database access policies.</p>
                </div>
              </CardContent>
            </Card>
          ) : data.departments.length === 0 ? (
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardContent className="p-6 text-sm text-slate-400">No visible departments were found.</CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.departments.map((department) => {
                const publishedCount = data.courses.filter((course) => course.department_id === department.id).length;
                return (
                  <Card key={department.id} className="border-slate-800 bg-slate-900/90 text-white">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-3">
                        <Badge variant="info">CODE: {department.code}</Badge>
                        <Badge variant={data.courseError ? 'warning' : 'success'}>
                          {data.courseError ? 'Course count unavailable' : `${publishedCount} Published Courses`}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg font-bold mt-2">{department.name}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-xs text-slate-400 space-y-2">
                      <p>{department.description ?? 'No department description is available.'}</p>
                      {data.courseError && <p className="text-amber-400">Published course data could not be loaded.</p>}
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
