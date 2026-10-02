'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/toast-provider';
import { History, RotateCcw, Filter, Search, ShieldAlert } from 'lucide-react';

export default function AuditLogPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([
    {
      id: 'aud-101',
      actor: 'Dr. Sarah Lin (Super Admin)',
      action: 'SOFT_DELETE_COURSE',
      entity: 'course: EM-AIRWAY-202',
      timestamp: '2026-10-01 17:30',
      isRestorable: true,
      restored: false,
    },
    {
      id: 'aud-102',
      actor: 'Dr. Rajesh V. (Faculty)',
      action: 'UPDATE_QUESTION_BANK',
      entity: 'question: q-101',
      timestamp: '2026-10-01 16:15',
      isRestorable: false,
      restored: false,
    },
  ]);

  const handleRestore = (id: string, entity: string) => {
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, restored: true, isRestorable: false } : l))
    );
    toast('Data Successfully Restored!', `${entity} has been restored to active status from soft-delete.`, 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <History className="w-6 h-6 text-rose-400" /> System Audit Log & Data Restore
            </h1>
            <p className="text-xs text-slate-400">
              Immutable record of system actions, role updates, and soft-deleted entity restore mechanism.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Audit Trajectory</span>
                <Badge variant="info">Super Admin Privileged</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Actor</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Target Entity</th>
                    <th className="p-4">Timestamp</th>
                    <th className="p-4">Restore Data</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40">
                      <td className="p-4 font-bold text-sky-400">{log.actor}</td>
                      <td className="p-4 font-mono font-bold text-slate-200">{log.action}</td>
                      <td className="p-4 text-slate-300">{log.entity}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                      <td className="p-4">
                        {log.isRestorable && !log.restored ? (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleRestore(log.id, log.entity)}
                            className="text-xs py-1"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Restore Entity
                          </Button>
                        ) : log.restored ? (
                          <Badge variant="success">RESTORED</Badge>
                        ) : (
                          <span className="text-slate-600 text-[10px]">N/A</span>
                        )}
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
