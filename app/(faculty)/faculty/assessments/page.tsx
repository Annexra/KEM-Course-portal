'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/toast-provider';
import { FileCheck2, Plus, Settings, Shuffle, Clock, ShieldAlert } from 'lucide-react';

export default function FacultyAssessmentsPage() {
  const { toast } = useToast();
  const [title, setTitle] = useState('ACLS Emergency Resuscitation Mock Exam 2');
  const [type, setType] = useState<'assessment' | 'mock_test'>('assessment');
  const [duration, setDuration] = useState('30');
  const [passPct, setPassPct] = useState('75');
  const [negativeMarking, setNegativeMarking] = useState('0.25');
  const [randomizeQs, setRandomizeQs] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);

  const handleCreateAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Assessment Playbook Created!', `"${title}" is published and available for student attempts.`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <FileCheck2 className="w-6 h-6 text-teal-400" /> Assessment & Mock Test Builder
            </h1>
            <p className="text-xs text-slate-400">
              Configure exam duration, randomized questions, snapshot options, and negative marking rules.
            </p>
          </div>

          <form onSubmit={handleCreateAssessment} className="max-w-3xl space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Settings className="w-4 h-4 text-sky-400" /> Exam Configuration Settings
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-slate-200">Assessment Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:ring-2 focus:ring-sky-500 text-white text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Type</label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    >
                      <option value="assessment">Proctored Assessment (Recorded Integrity)</option>
                      <option value="mock_test">Practice Mock Test (Self-Paced)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Duration (Minutes)</label>
                    <input
                      type="number"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Passing Score (%)</label>
                    <input
                      type="number"
                      value={passPct}
                      onChange={(e) => setPassPct(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-200">Negative Marking (Marks Deducted)</label>
                    <input
                      type="text"
                      value={negativeMarking}
                      onChange={(e) => setNegativeMarking(e.target.value)}
                      required
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="pt-4 border-t border-slate-800 space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeQs}
                      onChange={(e) => setRandomizeQs(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white">Randomize Question Order</p>
                      <p className="text-[10px] text-slate-400">Pulls unique order for every student attempt.</p>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={randomizeOptions}
                      onChange={(e) => setRandomizeOptions(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-950 border-slate-800"
                    />
                    <div>
                      <p className="font-bold text-white">Randomize Option Choices</p>
                      <p className="text-[10px] text-slate-400">Shuffles A, B, C, D answer choices dynamically.</p>
                    </div>
                  </label>
                </div>

                <div className="pt-4">
                  <Button type="submit" variant="primary" size="md">
                    <Plus className="w-4 h-4" /> Save & Publish Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
