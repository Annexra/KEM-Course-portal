'use client';

import React, { useEffect, useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthProfile } from '@/components/auth-profile-provider';
import { getFacultyQuestionBank } from '@/lib/supabase/assessments';
import type { FacultyQuestion } from '@/types/supabase';
import {
  HelpCircle,
  Plus,
  Upload,
  Search,
  Filter,
  FolderTree,
} from 'lucide-react';

export default function QuestionBankPage() {
  const auth = useAuthProfile();
  const [search, setSearch] = useState('');
  const [data, setData] = useState<{ loading: boolean; questions: FacultyQuestion[]; error: Error | null }>({
    loading: true,
    questions: [],
    error: null,
  });
  const authLoading = auth.status === 'loading' || (auth.status === 'profile' && auth.roleStatus === 'loading');

  useEffect(() => {
    if (authLoading) return;

    let isActive = true;
    const timeout = window.setTimeout(() => {
      if (auth.status !== 'profile' || auth.roleStatus !== 'loaded' || auth.profile?.status !== 'approved') {
        setData({
          loading: false,
          questions: [],
          error: new Error(auth.error ?? 'A verified faculty permission is required to view the question bank.'),
        });
        return;
      }

      if (!auth.permissions.includes('question_bank:manage')) {
        setData({ loading: false, questions: [], error: new Error('The question_bank:manage permission is required to view this page.') });
        return;
      }

      void getFacultyQuestionBank().then((result) => {
        if (!isActive) return;
        setData({ loading: false, questions: result.data, error: result.error });
      });
    }, 0);

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
    };
  }, [auth.error, auth.profile?.status, auth.permissions, auth.roleStatus, auth.status, authLoading]);

  const isLoading = data.loading || authLoading;
  const filteredQuestions = data.questions.filter((question) => {
    const searchValue = search.trim().toLowerCase();
    if (!searchValue) return true;
    return [question.text, question.subject?.name, question.topic?.name, question.subtopic?.name]
      .some((value) => value?.toLowerCase().includes(searchValue));
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-sky-400" /> Emergency Question Bank Hierarchy
              </h1>
              <p className="text-xs text-slate-400">
                Organized by Subject &gt; Topic &gt; Subtopic &gt; Question
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled title="Question imports are not implemented.">
                <Upload className="w-4 h-4" /> CSV / Excel Import
              </Button>
              <Button variant="primary" size="sm" disabled title="Question creation is not implemented.">
                <Plus className="w-4 h-4" /> Add Single MCQ
              </Button>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search MCQs by keyword, subject, or subtopic..."
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 text-white"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto">
                  <Filter className="w-3.5 h-3.5" /> All Subjects
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Questions Table */}
          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="p-4">Subject & Hierarchy</th>
                    <th className="p-4">Question Text</th>
                    <th className="p-4">Difficulty</th>
                    <th className="p-4">Marks</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {isLoading ? (
                    <tr><td colSpan={5} className="p-6 text-slate-400">Loading question bank...</td></tr>
                  ) : data.error ? (
                    <tr><td colSpan={5} className="p-6 text-amber-400">Question bank data is unavailable under current database access policies.</td></tr>
                  ) : filteredQuestions.length === 0 ? (
                    <tr><td colSpan={5} className="p-6 text-slate-400">
                      {data.questions.length ? 'No questions match this search.' : 'No visible questions were found.'}
                    </td></tr>
                  ) : filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold">
                        <div className="flex items-center gap-1.5 text-sky-400 text-xs">
                          <FolderTree className="w-3.5 h-3.5" /> {q.subject?.name ?? 'Subject unavailable'}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {q.topic?.name ?? 'Topic unavailable'} &gt; {q.subtopic?.name ?? 'Subtopic unavailable'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-200 font-medium max-w-xs truncate">
                        {q.text}
                      </td>
                      <td className="p-4">
                        <Badge variant={q.difficulty === 'hard' ? 'danger' : 'warning'}>
                          {q.difficulty}
                        </Badge>
                      </td>
                      <td className="p-4 font-mono font-bold text-amber-400">
                        {q.marks} Mark
                      </td>
                      <td className="p-4">
                        <Button variant="ghost" size="sm" className="text-xs" disabled title="Question editing is not implemented.">
                          Read Only
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </main>
      </div>

      <Footer />
    </div>
  );
}
