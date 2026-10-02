'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  GraduationCap,
  BookOpen,
  FileCheck2,
  Award,
  BarChart3,
  Stethoscope,
  HelpCircle,
  Users,
  ShieldCheck,
  Building2,
  History,
  Settings,
  ClipboardList,
} from 'lucide-react';

interface SidebarProps {
  portal: 'student' | 'faculty' | 'admin';
}

export function Sidebar({ portal }: SidebarProps) {
  const pathname = usePathname();

  const navItems = {
    student: [
      { label: 'My Dashboard', href: '/student/dashboard', icon: GraduationCap },
      { label: 'Courses & Modules', href: '/student/courses/c1111111-1111-1111-1111-111111111111', icon: BookOpen },
      { label: 'Assessments', href: '/student/assessments/a1111111-1111-1111-1111-111111111111', icon: FileCheck2 },
      { label: 'Mock Tests', href: '/student/mock-tests', icon: ClipboardList },
      { label: 'My Certificates', href: '/student/certificates', icon: Award },
    ],
    faculty: [
      { label: 'Faculty Dashboard', href: '/faculty/dashboard', icon: BarChart3 },
      { label: 'Manage Courses', href: '/faculty/courses', icon: BookOpen },
      { label: 'Question Bank', href: '/faculty/question-bank', icon: HelpCircle },
      { label: 'Assessment Builder', href: '/faculty/assessments', icon: FileCheck2 },
      { label: 'Analytics & Integrity', href: '/faculty/analytics', icon: Stethoscope },
    ],
    admin: [
      { label: 'Student Approvals', href: '/admin/approvals', icon: ShieldCheck },
      { label: 'User Directory & RBAC', href: '/admin/users', icon: Users },
      { label: 'Departments & Scope', href: '/admin/departments', icon: Building2 },
      { label: 'Audit Log & Restore', href: '/admin/audit-log', icon: History },
      { label: 'Platform Settings', href: '/admin/settings', icon: Settings },
    ],
  };

  const portalColors = {
    student: 'text-sky-500 border-sky-500/20 bg-sky-500/10',
    faculty: 'text-teal-500 border-teal-500/20 bg-teal-500/10',
    admin: 'text-rose-500 border-rose-500/20 bg-rose-500/10',
  };

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200/80 dark:border-slate-800/80 bg-white/50 dark:bg-slate-950/50 backdrop-blur-md hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        {/* Portal Header Badge */}
        <div className="px-3 py-2 rounded-2xl border bg-slate-50 dark:bg-slate-900/60 space-y-1">
          <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Portal View</p>
          <p className="text-sm font-extrabold capitalize text-slate-900 dark:text-white flex items-center justify-between">
            <span>{portal} Hub</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${portalColors[portal]}`}>
              V1 LIVE
            </span>
          </p>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          {navItems[portal].map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/student/dashboard' && item.href !== '/faculty/dashboard');
            const activeClass = portal === 'student'
              ? 'bg-gradient-to-r from-rose-600 via-purple-600 to-amber-500 text-white shadow-lg shadow-purple-500/20 font-bold'
              : 'bg-gradient-to-r from-sky-600 to-teal-600 text-white shadow-lg shadow-sky-500/20 font-bold';
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? activeClass
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* System Status Footer */}
      <div className="p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 bg-slate-100/60 dark:bg-slate-900/40 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-slate-500 dark:text-slate-400 text-[11px] font-medium">System Status</span>
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            OPERATIONAL
          </span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Launch Target: <span className="font-semibold text-slate-300">20 Oct 2026</span>
        </p>
      </div>
    </aside>
  );
}
