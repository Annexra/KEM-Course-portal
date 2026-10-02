'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Award, ShieldCheck, Download, ExternalLink, Calendar, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export interface CertificateData {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  verificationCode: string;
  grade?: string;
}

export function CertificateCard({ cert }: { cert: CertificateData }) {
  const handleDownload = () => {
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Certificate Frame */}
      <div className="relative p-8 sm:p-12 rounded-3xl border-4 border-amber-500/40 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white shadow-2xl overflow-hidden print:m-0 print:p-8 print:border-2">
        {/* Background Watermark Kauvery Emblem */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 opacity-5 pointer-events-none -z-0">
          <img src="/kauvery-icon.svg" alt="Kauvery Watermark" className="w-full h-full object-contain" />
        </div>

        <div className="relative z-10 space-y-6 text-center">
          {/* Official Kauvery Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 p-2.5 rounded-2xl bg-white/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-xl backdrop-blur-md">
              <img src="/kauvery-icon.svg" alt="Kauvery Emblem" className="w-full h-full object-contain" />
            </div>
            <p className="text-xs uppercase font-extrabold tracking-widest text-amber-400">
              Kauvery Hospital • Emergency Medicine Institute
            </p>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-serif">
              Certificate of Completion
            </h1>
          </div>

          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            This is to certify that the following healthcare professional has successfully satisfied all academic, clinical video module watch requirements (90%+ threshold), and passed proctored examinations for:
          </p>

          {/* Student & Course Box */}
          <div className="py-6 border-y border-slate-800 space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-rose-400 via-purple-300 to-amber-300">
              {cert.studentName}
            </h2>
            <p className="text-base font-bold text-slate-100">
              {cert.courseTitle}
            </p>
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs pt-2 text-slate-300">
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Certificate No.</p>
              <p className="font-mono font-bold text-amber-400 mt-1">{cert.certificateNumber}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-semibold text-slate-400">Date Issued</p>
              <p className="font-medium mt-1">{cert.issuedAt}</p>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-[10px] uppercase font-semibold text-slate-400">Verification Hash</p>
              <p className="font-mono text-[10px] text-slate-400 truncate mt-1">{cert.verificationCode}</p>
            </div>
          </div>

          {/* Official Signatures Bar */}
          <div className="pt-8 flex items-center justify-between gap-4 border-t border-slate-800 text-left text-xs">
            <div className="space-y-1">
              <p className="font-bold text-slate-200">Dr. Rajesh V.</p>
              <p className="text-[10px] text-slate-400">Director of Emergency Medicine</p>
            </div>
            <div className="w-12 h-12 rounded-full border border-amber-500/40 bg-amber-500/10 flex items-center justify-center text-amber-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div className="space-y-1 text-right">
              <p className="font-bold text-slate-200">Dr. Sarah Lin</p>
              <p className="text-[10px] text-slate-400">Academic Dean, Kauvery EM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <Link
          href={`/certificates/verify/${cert.certificateNumber}`}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 font-bold"
        >
          <ExternalLink className="w-4 h-4" /> Verify Certificate Online
        </Link>

        <Button variant="primary" size="sm" onClick={handleDownload} className="bg-gradient-to-r from-rose-600 to-amber-600">
          <Download className="w-4 h-4" /> Download Printable PDF
        </Button>
      </div>
    </div>
  );
}
