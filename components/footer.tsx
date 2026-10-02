import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Heart, Activity, Award } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 text-slate-600 dark:text-slate-400 text-xs py-12 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Kauvery Brand Column */}
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 shrink-0">
                <img src="/kauvery-icon.svg" alt="Kauvery Hospital" className="w-full h-full object-contain" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-lg text-slate-900 dark:text-white">kauvery hospital</span>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">
                  Emergency Medicine Institute
                </span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Kauvery Emergency Medicine (KEM) online learning and proctored assessment system. Accreditation standard for EM residency & critical care training.
            </p>

            <div className="flex items-center gap-2 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Official Target Launch: 20 October 2026</span>
            </div>
          </div>

          {/* Student Portal Links */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Student Portal
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/student/dashboard" className="hover:text-rose-500 transition-colors">
                  My Residency Dashboard
                </Link>
              </li>
              <li>
                <Link href="/student/courses/c1111111-1111-1111-1111-111111111111" className="hover:text-rose-500 transition-colors">
                  ACLS Course & Video Modules
                </Link>
              </li>
              <li>
                <Link href="/student/certificates" className="hover:text-rose-500 transition-colors">
                  Earned Certificates & Credentials
                </Link>
              </li>
            </ul>
          </div>

          {/* Faculty & Admin */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Faculty & Administration
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/faculty/dashboard" className="hover:text-teal-500 transition-colors">
                  Faculty Workspace
                </Link>
              </li>
              <li>
                <Link href="/faculty/question-bank" className="hover:text-teal-500 transition-colors">
                  Emergency Question Bank
                </Link>
              </li>
              <li>
                <Link href="/admin/approvals" className="hover:text-purple-500 transition-colors">
                  Student Verification Queue
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance & SLA */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Compliance & Security
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Protected by multi-tier RBAC, frozen question snapshots, and real-time proctoring event logging.
            </p>
            <div className="pt-2 flex items-center gap-1.5 text-rose-500 font-semibold text-[11px]">
              <ShieldCheck className="w-4 h-4" /> Kauvery Clinical Quality Standard
            </div>
          </div>
        </div>

        {/* Footer Bottom Row */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
          <p>© 2026 Kauvery Hospital. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <Link href="/certificates/verify/KEM-2026-8942" className="text-rose-500 font-bold hover:underline">
              Verify Certificate
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
