'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VideoPlayer } from '@/components/video-player';
import { AIChatbot } from '@/components/ai-chatbot';
import {
  BookOpen,
  FileText,
  PlayCircle,
  CheckCircle2,
  Lock,
  Download,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';

export default function CoursePage({ params }: { params: { id: string } }) {
  const [activeMaterial, setActiveMaterial] = useState({
    id: 'mat-101',
    title: 'ACLS Arrhythmia Management & High-Quality CPR Protocols',
    type: 'video',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: '18 mins',
    isRequired: true,
  });

  const [modules, setModules] = useState([
    {
      id: 'mod-1',
      title: 'Module 1: Lethal Arrhythmias & Resuscitation',
      materials: [
        {
          id: 'mat-101',
          title: 'ACLS Arrhythmia Management & High-Quality CPR Protocols',
          type: 'video',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
          duration: '18 mins',
          isRequired: true,
          completed: true,
        },
        {
          id: 'mat-102',
          title: '2026 ACLS Cardiac Arrest Algorithm Guidelines (PDF)',
          type: 'pdf',
          url: '#',
          isRequired: false,
          completed: true,
        },
      ],
    },
    {
      id: 'mod-2',
      title: 'Module 2: Post-Cardiac Arrest Care & Targeted Temperature',
      materials: [
        {
          id: 'mat-201',
          title: 'Post-ROSC Hemodynamic Stabilization & Ventilation',
          type: 'video',
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
          duration: '22 mins',
          isRequired: true,
          completed: false,
        },
      ],
    },
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
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

            <Badge variant="info">Course: EM-ACLS-101</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main Player & PDF Viewer */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">
                  {activeMaterial.title}
                </h1>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span>Module Material</span>
                  <span>•</span>
                  <span className="text-amber-400 font-semibold">
                    Rule: 90% Watch Completion Required
                  </span>
                </p>
              </div>

              {/* Video Player */}
              {activeMaterial.type === 'video' ? (
                <VideoPlayer
                  materialId={activeMaterial.id}
                  title={activeMaterial.title}
                  videoUrl={activeMaterial.videoUrl}
                  isRequired={activeMaterial.isRequired}
                />
              ) : (
                <Card className="border-slate-800 bg-slate-900/90 text-white p-8 text-center space-y-4">
                  <FileText className="w-12 h-12 text-sky-400 mx-auto" />
                  <h3 className="font-bold text-lg">{activeMaterial.title}</h3>
                  <p className="text-xs text-slate-400">
                    Clinical Document & PDF Guide for Emergency Resuscitation.
                  </p>
                  <Button variant="primary" size="sm">
                    <Download className="w-4 h-4" /> Download PDF Manual
                  </Button>
                </Card>
              )}

              {/* Module Description & Notes */}
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-sky-400" /> Key Clinical Learning Points
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-slate-300 space-y-3 leading-relaxed">
                  <p>
                    1. High-Quality CPR: Compress at a rate of 100-120/min to a depth of 2 to 2.4 inches (5 to 6 cm) and allow complete chest recoil.
                  </p>
                  <p>
                    2. Epinephrine 1 mg IV/IO administered every 3-5 minutes during non-shockable rhythms (PEA/Asystole) as early as possible.
                  </p>
                  <p>
                    3. Defibrillation: Initial dose 120 to 200 Joules biphasic for VF/pVT.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Right Side Module Outline */}
            <div className="space-y-6">
              <Card className="border-slate-800 bg-slate-900/90 text-white">
                <CardHeader>
                  <CardTitle className="text-sm font-bold flex items-center justify-between">
                    <span>Course Modules</span>
                    <span className="text-xs text-sky-400 font-mono">2 Modules</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {modules.map((mod) => (
                    <div key={mod.id} className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        {mod.title}
                      </h4>
                      <div className="space-y-1">
                        {mod.materials.map((mat) => {
                          const isSelected = activeMaterial.id === mat.id;
                          return (
                            <button
                              key={mat.id}
                              onClick={() =>
                                setActiveMaterial({
                                  id: mat.id,
                                  title: mat.title,
                                  type: mat.type,
                                  videoUrl: (mat as any).videoUrl || '',
                                  duration: (mat as any).duration || '',
                                  isRequired: mat.isRequired,
                                })
                              }
                              className={`w-full p-3 rounded-xl border text-left flex items-start justify-between gap-3 text-xs transition-colors ${
                                isSelected
                                  ? 'bg-sky-950/80 border-sky-500 text-white font-bold'
                                  : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-800/60'
                              }`}
                            >
                              <div className="flex items-start gap-2 min-w-0">
                                {mat.type === 'video' ? (
                                  <PlayCircle className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                                ) : (
                                  <FileText className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                                )}
                                <span className="truncate">{mat.title}</span>
                              </div>
                              {mat.completed ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                              ) : (
                                <Lock className="w-4 h-4 text-slate-600 shrink-0" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-slate-800">
                    <Link href="/student/assessments/a1111111-1111-1111-1111-111111111111">
                      <Button variant="primary" size="sm" className="w-full">
                        <FileCheck2 className="w-4 h-4" /> Go to ACLS Final Exam
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
