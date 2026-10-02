import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getPriorityBadgeColor(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-rose-500/10 text-rose-500 border-rose-500/20 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/40';
    case 'high':
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/40';
    case 'medium':
      return 'bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800/40';
    case 'low':
    default:
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/40';
  }
}

export function getStatusBadgeColor(status: string): string {
  switch (status) {
    case 'active':
      return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    case 'in_review':
      return 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30';
    case 'completed':
      return 'bg-indigo-500/15 text-indigo-700 dark:text-indigo-300 border-indigo-500/30';
    case 'archived':
      return 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30';
    case 'draft':
    default:
      return 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/30';
  }
}
