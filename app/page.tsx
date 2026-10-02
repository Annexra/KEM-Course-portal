'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AIChatbot } from '@/components/ai-chatbot';
import { GhostCursorLayer } from '@/components/effects/GhostCursorLayer';
import {
  ShieldAlert,
  GraduationCap,
  Stethoscope,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  Activity,
  Lock,
  Users,
  BarChart3,
  FileCheck2,
  Flame,
} from 'lucide-react';

export default function LandingPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-rose-500 selection:text-white overflow-hidden">
      <Navbar />

      <main className="flex-1 space-y-28 pb-24">
        {/* Hero Section with Ambient Animations */}
        <section className="relative pt-24 pb-20 overflow-hidden">
          {/* GhostCursor Visual Effect */}
          <GhostCursorLayer tone="hero" zIndex={5} />

          {/* Animated Background Mesh Spheres */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[450px] bg-gradient-to-tr from-rose-600/25 via-purple-600/20 to-amber-500/15 rounded-full blur-[140px] pointer-events-none -z-0 animate-pulse" />
          <div className="absolute -top-10 left-10 w-80 h-80 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8 text-center"
          >
            {/* Top Kauvery Hospital Launch Badge */}
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-950/40 text-rose-300 text-xs font-bold backdrop-blur-xl shadow-xl">
              <img src="/kauvery-icon.svg" alt="Kauvery" className="w-5 h-5" />
              <span>Target Launch: 20 October 2026</span>
              <span className="text-slate-600">•</span>
              <span className="text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Kauvery Hospital EM Standard
              </span>
            </motion.div>

            {/* Main Headline */}
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-tight max-w-5xl mx-auto">
              Empowering Emergency Medicine Residency with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300">
                Precision Proctored Learning
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed font-normal">
              KEM is Kauvery Hospital’s dedicated online learning, assessment, and credentialing platform. Master ACLS resuscitation, emergency airway management, and high-stakes clinical decisions with real-time integrity monitoring.
            </motion.p>

            {/* CTA Action Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Link href="/student/dashboard">
                <Button variant="primary" size="lg" className="shadow-2xl shadow-rose-500/30 bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500">
                  <GraduationCap className="w-5 h-5" /> Launch Student Portal
                </Button>
              </Link>
              <Link href="/faculty/dashboard">
                <Button variant="outline" size="lg" className="border-slate-700 hover:bg-slate-800">
                  <Stethoscope className="w-5 h-5 text-teal-400" /> Faculty Workspace <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>

            {/* Live Stat Counters Row */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-5 max-w-5xl mx-auto pt-14 text-left">
              <Card className="border-slate-800/80 bg-slate-900/70 backdrop-blur-xl hover:border-rose-500/40 transition-all group">
                <CardContent className="p-6 space-y-1">
                  <p className="text-3xl font-black text-white">90%+</p>
                  <p className="text-xs text-slate-400 font-medium">Video Watch Completion Enforced</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/70 backdrop-blur-xl hover:border-sky-500/40 transition-all group">
                <CardContent className="p-6 space-y-1">
                  <p className="text-3xl font-black text-sky-400">Proctored</p>
                  <p className="text-xs text-slate-400 font-medium">Real-Time Integrity Violation Logs</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/70 backdrop-blur-xl hover:border-purple-500/40 transition-all group">
                <CardContent className="p-6 space-y-1">
                  <p className="text-3xl font-black text-purple-400">Multi-RBAC</p>
                  <p className="text-xs text-slate-400 font-medium">Scope & Department Boundaries</p>
                </CardContent>
              </Card>

              <Card className="border-slate-800/80 bg-slate-900/70 backdrop-blur-xl hover:border-amber-500/40 transition-all group">
                <CardContent className="p-6 space-y-1">
                  <p className="text-3xl font-black text-amber-400">KEM-2026</p>
                  <p className="text-xs text-slate-400 font-medium">Verified PDF Certificates Issued</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* Kauvery Hospital Branding Showcase */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 rounded-3xl border border-rose-500/30 bg-gradient-to-r from-rose-950/40 via-slate-900/90 to-purple-950/40 backdrop-blur-2xl flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 shrink-0 p-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                <img src="/kauvery-icon.svg" alt="Kauvery Hospital Logo" className="w-full h-full object-contain" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">Official Clinical Standard</span>
                <h3 className="text-2xl font-extrabold text-white">Kauvery Hospital Emergency Medicine Residency</h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Designed in alignment with Kauvery Hospital&apos;s clinical guidelines for emergency resuscitation, trauma care, and intensive care unit preparedness.
                </p>
              </div>
            </div>

            <Link href="/student/dashboard">
              <Button variant="primary" size="lg" className="shrink-0 bg-gradient-to-r from-rose-600 to-amber-600">
                Explore Residency Modules
              </Button>
            </Link>
          </div>
        </section>

        {/* Core Capabilities Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-rose-400">Platform Features</span>
            <h2 className="text-3xl font-extrabold text-white">Built Specifically for High-Stakes Medical Evaluation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md hover:border-sky-500/50 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 flex items-center justify-center">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">1. Structured Learning & Video Rule</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Interactive modules featuring non-skippable video lessons with a 90% watch completion requirement, position saving, and clinical PDF manuals.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md hover:border-rose-500/50 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">2. Proctored Exam Integrity</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Fullscreen exam environment with live countdown timers, randomized options, negative marking (-0.25), and automatic logging of tab changes and window blur.
                </p>
              </CardContent>
            </Card>

            <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-md hover:border-amber-500/50 transition-all duration-300">
              <CardContent className="p-8 space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold">3. Auto Certificates & Online Verification</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Certificates are automatically generated upon satisfying completion criteria, featuring downloadable PDFs and instant public online verification links.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <AIChatbot />
      <Footer />
    </div>
  );
}
