'use client';

import React from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/sidebar';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Settings, ShieldCheck, Mail, Database } from 'lucide-react';
import { useToast } from '@/components/toast-provider';

export default function PlatformSettingsPage() {
  const { toast } = useToast();

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast('Platform Settings Saved!', 'All global configurations updated.', 'success');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-white font-sans">
      <Navbar />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        <Sidebar portal="admin" />

        <main className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-rose-400" /> Platform Global Settings
            </h1>
            <p className="text-xs text-slate-400">
              Configure system defaults, email notifications, and Cloudflare video integration.
            </p>
          </div>

          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            <Card className="border-slate-800 bg-slate-900/90 text-white">
              <CardHeader>
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-sky-400" /> System Defaults & Production Target
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-200">Platform Name</label>
                  <input
                    type="text"
                    defaultValue="Kauvery Emergency Medicine (KEM)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-200">Production Launch Date</label>
                  <input
                    type="text"
                    defaultValue="20 October 2026"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs"
                  />
                </div>

                <div className="pt-2">
                  <Button type="submit" variant="primary" size="sm">
                    Save Global Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </main>
      </div>

      <Footer />
    </div>
  );
}
