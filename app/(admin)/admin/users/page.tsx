'use client';

import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MOCK_USERS } from '@/lib/supabase/client';
import { Users } from 'lucide-react';

export default function UserManagementPage() {
  const usersList = MOCK_USERS;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-rose-400" /> User Directory & Multi-Role RBAC Matrix
            </h1>
            <p className="text-xs text-slate-400">
              Users can hold multiple roles simultaneously (e.g. Student + Faculty). Scope defines access boundaries.
            </p>
          </div>

          <Card className="border-slate-800 bg-slate-900/90 text-white">
            <CardHeader>
              <CardTitle className="text-sm font-bold">Platform User Roster</CardTitle>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-4">User</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Assigned Roles</th>
                    <th className="p-4">Granted Scope</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/40">
                      <td className="p-4 flex items-center gap-3">
                        <img src={u.avatarUrl} alt={u.fullName} className="w-8 h-8 rounded-full object-cover shrink-0" />
                        <div>
                          <p className="font-bold text-white">{u.fullName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant={u.status === 'approved' ? 'success' : 'warning'}>{u.status}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-1">
                          {u.roles.map((r) => (
                            <Badge key={r} variant="info" className="capitalize">
                              {r.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-300">
                        {u.scopes[0]?.scopeType.toUpperCase() || 'COURSE'}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          title="Role assignment updates are not implemented."
                          className="text-xs"
                        >
                          Role Updates Unavailable
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
