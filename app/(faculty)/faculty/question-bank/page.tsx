'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { useToast } from '@/components/toast-provider';
import {
  HelpCircle,
  Plus,
  Upload,
  Search,
  Filter,
  CheckCircle2,
  FolderTree,
  FileSpreadsheet,
} from 'lucide-react';

export default function QuestionBankPage() {
  const { toast } = useToast();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const sampleQuestions = [
    {
      id: 'q-101',
      subject: 'Resuscitation Medicine',
      topic: 'Cardiac Arrest',
      subtopic: 'Defibrillation & VF',
      text: 'A 58-year-old male collapses in the ED waiting room. Monitor reveals Ventricular Fibrillation (VF)...',
      difficulty: 'hard',
      marks: 1.0,
      optionsCount: 4,
    },
    {
      id: 'q-102',
      subject: 'Airway Management',
      topic: 'RSI Pharmacology',
      subtopic: 'Induction Agents',
      text: 'Which induction agent is preferred in a hemodynamically unstable trauma patient requiring RSI?',
      difficulty: 'medium',
      marks: 1.0,
      optionsCount: 4,
    },
    {
      id: 'q-103',
      subject: 'Trauma Care',
      topic: 'Chest Trauma',
      subtopic: 'Tension Pneumothorax',
      text: 'What is the immediate decompression landmark for tension pneumothorax according to ATLS 10th edition?',
      difficulty: 'medium',
      marks: 1.0,
      optionsCount: 4,
    },
  ];

  const handleBulkImport = () => {
    toast('Bulk Questions Imported Successfully!', '15 new MCQs parsed from CSV file.', 'success');
    setIsImportModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-white flex items-center gap-2">
                <HelpCircle className="w-6 h-6 text-sky-400" /> Emergency Question Bank Hierarchy
              </h1>
              <p className="text-xs text-slate-400">
                Organized by Subject &gt; Topic &gt; Subtopic &gt; Question
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
                <Upload className="w-4 h-4" /> CSV / Excel Import
              </Button>
              <Button variant="primary" size="sm">
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
                  {sampleQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4 font-semibold">
                        <div className="flex items-center gap-1.5 text-sky-400 text-xs">
                          <FolderTree className="w-3.5 h-3.5" /> {q.subject}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {q.topic} &gt; {q.subtopic}
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
                        <Button variant="ghost" size="sm" className="text-xs">
                          Edit MCQ
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

      {/* CSV Bulk Import Modal */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Bulk MCQ Import via CSV / Excel"
        description="Upload question bank CSV formatted with columns: Subject, Topic, Subtopic, Question, OptionA, OptionB, OptionC, OptionD, CorrectOption, Marks, Explanation."
      >
        <div className="space-y-4 text-xs">
          <div className="p-8 border-2 border-dashed border-slate-700 rounded-2xl bg-slate-950/60 text-center space-y-2">
            <FileSpreadsheet className="w-10 h-10 text-sky-400 mx-auto" />
            <p className="font-bold text-white">Drag & drop question bank .csv file here</p>
            <p className="text-[10px] text-slate-400">Supported formats: .csv, .xlsx (Max 5MB)</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleBulkImport}>
              Parse & Import 15 MCQs
            </Button>
          </div>
        </div>
      </Modal>

      <Footer />
    </div>
  );
}
