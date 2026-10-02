'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/toast-provider';
import { ShieldCheck, UserCheck, UserX, Clock, Search, CheckCircle2 } from 'lucide-react';

export default function StudentApprovalsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState([
    {
      id: 'u4444444-4444-4444-4444-444444444444',
      fullName: 'Dr. Priya Sharma',
      email: 'em.resident2@kauvery.org',
      department: 'Emergency Medicine',
      registeredAt: '2026-10-01 18:20',
      status: 'pending',
    },
    {
      id: 'u3333333-3333-3333-3333-333333333333',
      fullName: 'Dr. Arjun Mehta',
      email: 'em.resident1@kauvery.org',
      department: 'Emergency Medicine',
      registeredAt: '2026-09-20 10:15',
      status: 'approved',
    },
  ]);

  const handleApprove = (id: string, name: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'approved' } : s))
    );
    toast('Student Approved Successfully!', `${name} can now access protected EM courses. Notification email queued.`, 'success');
  };

  const handleRevoke = (id: string, name: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: 'revoked' } : s))
    );
    toast('Access Revoked', `${name} has been blocked from all protected KEM content.`, 'error');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-rose-400" /> Student Verification & Approval Queue
            </h1>
            <p className="text-xs text-slate-400">
              New Google OAuth registered students start as &quot;pending&quot; and require faculty/admin approval before course access.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold flex items-center justify-between">
                <span>Registration Queue</span>
                <Badge variant="warning">1 Pending Approval</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">Student Name & Email</th>
                    <th className="p-4">Department</th>
                    <th className="p-4">Registered Date</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Approval Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {students.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-800/40">
                      <td className="p-4">
                        <p className="font-bold text-white">{st.fullName}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                      </td>
                      <td className="p-4 text-slate-300 font-medium">{st.department}</td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{st.registeredAt}</td>
                      <td className="p-4">
                        <Badge
                          variant={
                            st.status === 'approved'
                              ? 'success'
                              : st.status === 'pending'
                              ? 'warning'
                              : 'danger'
                          }
                        >
                          {st.status.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {st.status !== 'approved' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleApprove(st.id, st.fullName)}
                              className="text-xs py-1"
                            >
                              <UserCheck className="w-3.5 h-3.5" /> Approve
                            </Button>
                          )}
                          {st.status !== 'revoked' && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRevoke(st.id, st.fullName)}
                              className="text-xs py-1"
                            >
                              <UserX className="w-3.5 h-3.5" /> Revoke
                            </Button>
                          )}
                        </div>
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
