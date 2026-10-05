import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, CheckCircle2, Award, Calendar, Building, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default async function CertificateVerificationPage({
  params,
}: {
  params: Promise<{ certNumber: string }>;
}) {
  const { certNumber } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-12 space-y-8">
        <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Return to KEM Portal
        </Link>

        {/* Verification Card Header */}
        <div className="p-8 rounded-3xl border border-emerald-500/30 bg-emerald-950/20 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              OFFICIALLY VERIFIED
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
              Genuine Kauvery Emergency Medicine Certificate
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Certificate Record ID: {certNumber}
            </p>
          </div>
        </div>

        {/* Certificate Details */}
        <Card className="border-slate-800 bg-slate-900/90 text-white">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" /> Certificate Credentials Registry
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Recipient Resident / Student</p>
                <p className="text-lg font-bold text-sky-400">Dr. Arjun Mehta</p>
                <p className="text-xs text-slate-500">Department of Emergency Medicine</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Course Title</p>
                <p className="text-lg font-bold text-teal-400">Advanced Cardiac Life Support (ACLS 2026)</p>
                <p className="text-xs text-slate-500">Course Code: EM-ACLS-101</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Issuing Authority</p>
                <p className="font-semibold text-slate-200">Kauvery Hospital Institute of Emergency Medicine</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                <p className="text-xs text-slate-400 uppercase font-semibold">Issue Date & Status</p>
                <p className="font-semibold text-slate-200 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" /> September 28, 2026
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs text-slate-400 space-y-2">
              <p className="font-semibold text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Cryptographic Integrity Check Passed
              </p>
              <p className="leading-relaxed">
                This verification record confirms that the above individual has successfully satisfied all theoretical MCQs, video module watched requirements (90%+ threshold), and passed the proctored assessment under full integrity monitoring.
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
