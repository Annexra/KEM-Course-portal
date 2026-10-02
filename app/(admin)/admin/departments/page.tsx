import React from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, BookOpen } from 'lucide-react';

export default function DepartmentsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Building2 className="w-6 h-6 text-rose-400" /> Departments & Scope Boundaries
            </h1>
            <p className="text-xs text-slate-400">
              Manage Kauvery Hospital Academic Departments and scope definitions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <Badge variant="info">CODE: EM-KAUVERY</Badge>
                  <Badge variant="success">1 Active Course</Badge>
                </div>
                <CardTitle className="text-lg font-bold mt-2">
                  Emergency Medicine & Trauma Care
                </CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-slate-400 space-y-2">
                <p>Primary Department for EM Residency, ACLS certification, and critical airway management.</p>
                <p className="font-semibold text-slate-300">Lead Faculty: Dr. Rajesh V.</p>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
