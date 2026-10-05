import React from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function PendingApprovalPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 font-sans">
      <Card className="w-full max-w-lg border-amber-500/30 bg-slate-900/90 text-white shadow-2xl text-center">
        <CardContent className="p-8 space-y-6">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/40 animate-pulse">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              STATUS: PENDING APPROVAL
            </span>
            <h1 className="text-2xl font-black text-white">Registration Awaiting Verification</h1>
            <p className="text-xs text-slate-400 leading-relaxed max-w-md mx-auto">
              Your Google OAuth authentication was successful. However, access to Kauvery Emergency Medicine protected courses and assessments requires faculty approval.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
            <p className="font-bold text-slate-200 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Account Status Checklist:
            </p>
            <ul className="space-y-1 text-[11px] text-slate-400 pl-5 list-disc">
              <li>Google OAuth Identity: Verified</li>
              <li>Kauvery EM Residency Roster: Pending Verification</li>
              <li>Estimated Review Time: Within 24 Hours</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login">
              <Button variant="outline" size="sm" className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" /> Switch Account
              </Button>
            </Link>
            <Link href="/">
              <Button variant="primary" size="sm" className="w-full sm:w-auto">
                Return to Overview
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
