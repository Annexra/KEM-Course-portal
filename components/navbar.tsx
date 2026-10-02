'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { RoleSwitcher } from '@/components/role-switcher';
import {
  Sun,
  Moon,
  Menu,
  X,
  GraduationCap,
  Stethoscope,
  Users,
  ChevronRight,
} from 'lucide-react';

export function Navbar() {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isStudent = pathname?.startsWith('/student');
  const isFaculty = pathname?.startsWith('/faculty');
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/85 dark:bg-slate-950/85 backdrop-blur-2xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Kauvery Hospital Logo & Brand */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex min-w-0 items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.06, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="relative h-14 w-14 shrink-0"
            >
              <Image
                src="/kauvery-seal.svg"
                alt="Kauvery Hospital"
                width={56}
                height={56}
                priority
                className="w-full h-full object-contain filter drop-shadow-[0_4px_12px_rgba(217,27,92,0.3)]"
              />
            </motion.div>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="w-fit text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 via-purple-500/20 to-amber-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30 uppercase tracking-widest">
                KEM
              </span>
              <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide">
                Emergency Medicine Residency & Assessment
              </p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5 pl-4 border-l border-slate-200 dark:border-slate-800">
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all relative ${
                pathname === '/'
                  ? 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border border-rose-500/20'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              Overview
            </Link>

            <Link
              href="/student/dashboard"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isStudent
                  ? 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              Student Portal
            </Link>

            <Link
              href="/faculty/dashboard"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isFaculty
                  ? 'bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Stethoscope className="w-3.5 h-3.5" />
              Faculty Portal
            </Link>

            <Link
              href="/admin/approvals"
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                isAdmin
                  ? 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              Admin Hub
            </Link>
          </nav>
        </div>

        {/* Right Tools: Role Switcher & Theme Toggle */}
        <div className="flex items-center gap-3">
          <RoleSwitcher />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92 }}
            onClick={toggleTheme}
            aria-label="Toggle dark/light mode"
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </motion.button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
            className="p-2.5 rounded-xl lg:hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-4 space-y-2 overflow-hidden"
          >
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3.5 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900"
            >
              Overview & Capabilities
            </Link>
            <Link
              href="/student/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40"
            >
              <span className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4" /> Student Portal
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              href="/faculty/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40"
            >
              <span className="flex items-center gap-2">
                <Stethoscope className="w-4 h-4" /> Faculty Portal
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
            <Link
              href="/admin/approvals"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40"
            >
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4" /> Admin Portal
              </span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
