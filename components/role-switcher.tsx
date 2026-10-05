'use client';

import Link from 'next/link';
import { useAuthProfile } from '@/components/auth-profile-provider';

export function RoleSwitcher() {
  const { status, roleStatus, profile, roles, error } = useAuthProfile();
  const label = status === 'loading'
    ? 'Loading role'
    : status === 'profile'
      ? roleStatus === 'loading'
        ? 'Loading role'
        : roleStatus === 'error'
          ? 'Role unavailable'
          : roles.length === 0
            ? 'No role assigned'
            : roles.map((role) => role.replace('_', ' ')).join(', ')
      : status === 'profile_missing'
        ? 'Profile not linked'
        : status === 'error'
          ? 'Role unavailable'
          : 'Sign in';

  return (
    status === 'signed_out' ? (
      <Link
        href="/login"
        className="inline-flex max-w-44 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
        <span>{label}</span>
      </Link>
    ) : (
      <div
        title={error ?? (profile ? `${profile.fullName} · ${profile.email}` : undefined)}
        aria-live="polite"
        className="inline-flex max-w-48 items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${status === 'profile' ? 'bg-emerald-500' : status === 'error' ? 'bg-rose-500' : 'bg-amber-500'}`} />
        <span className="truncate">{label}</span>
      </div>
    )
  );
}
