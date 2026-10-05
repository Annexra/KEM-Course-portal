import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 p-4 font-sans text-center">
      <div className="max-w-md space-y-6">
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-2xl">
          <ShieldAlert className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-widest px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
            ERROR 404
          </span>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Page Not Found</h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            The Emergency Medicine resource or route you are attempting to access does not exist or has been relocated.
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="sm">
              <Home className="w-4 h-4" /> Return to KEM Home
            </Button>
          </Link>
          <Link href="/student/dashboard">
            <Button variant="outline" size="sm">
              Student Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
