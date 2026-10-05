import React from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { CertificateCard } from '@/components/certificate-card';
import { AIChatbot } from '@/components/ai-chatbot';
import { Award, CheckCircle2 } from 'lucide-react';

export default function StudentCertificatesPage() {
  const sampleCert = {
    certificateNumber: 'KEM-2026-8942',
    studentName: 'Dr. Arjun Mehta',
    courseTitle: 'Advanced Cardiac Life Support (ACLS 2026)',
    issuedAt: 'September 28, 2026',
    verificationCode: '0x9f8b4a2e1d7c3b5a',
    grade: 'Passed (95.0%)',
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="student" />

        <main className="flex-1 p-6 sm:p-8 space-y-8 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" /> Earned Residency Certificates
            </h1>
            <p className="text-xs text-slate-400">
              Official Kauvery Emergency Medicine Institute Issued Credentials
            </p>
          </div>

          <CertificateCard cert={sampleCert} />
        </main>
      </div>

      <AIChatbot />
      <Footer />
    </div>
  );
}
