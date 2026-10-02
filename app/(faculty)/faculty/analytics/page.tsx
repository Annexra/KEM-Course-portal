'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, AlertTriangle, CheckCircle2, User, Clock } from 'lucide-react';

export default function FacultyAnalyticsPage() {
  const integrityLogs = [
    {
      id: 'evt-1',
      studentName: 'Dr. Arjun Mehta',
      assessment: 'ACLS Final Residency Proctored Examination',
      eventType: 'tab_change',
      timestamp: '2026-10-01 19:42:15',
      status: 'Flagged for Review',
    },
    {
      id: 'evt-2',
      studentName: 'Dr. Arjun Mehta',
      assessment: 'ACLS Final Residency Proctored Examination',
      eventType: 'window_blur',
      timestamp: '2026-10-01 19:44:02',
      status: 'Reviewed',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="faculty" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-rose-400" /> Exam Integrity & Audit Review
            </h1>
            <p className="text-xs text-slate-400">
              Review flagged proctoring events: Fullscreen exits, window blurs, and tab switching events.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" /> Recent Integrity Flags Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Student</th>
                    <th className="p-4">Assessment</th>
                    <th className="p-4">Event Type</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {integrityLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-sky-400">{log.studentName}</td>
                      <td className="p-4 text-slate-200">{log.assessment}</td>
                      <td className="p-4">
                        <Badge variant="danger">{log.eventType.replace('_', ' ').toUpperCase()}</Badge>
                      </td>
                      <td className="p-4 font-mono text-slate-400 text-[11px]">{log.timestamp}</td>
                      <td className="p-4 font-semibold text-amber-400">{log.status}</td>
                      <td className="p-4">
                        <Button variant="outline" size="sm" className="text-xs">
                          Dismiss / Approve
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
