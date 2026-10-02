'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserRole, UserProfile, getDefaultDashboardForRole } from '@/lib/rbac';
import { getInitialUser, saveCurrentUser, MOCK_USERS } from '@/lib/supabase/client';
import { useToast } from '@/components/toast-provider';
import { Shield, UserCheck, GraduationCap, Stethoscope, ChevronDown } from 'lucide-react';

export function RoleSwitcher() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<UserProfile>(MOCK_USERS[0]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => setCurrentUser(getInitialUser()), 0);
    return () => window.clearTimeout(timeout);
  }, []);

  const handleRoleChange = (newRole: UserRole) => {
    const updatedUser = { ...currentUser, activeRole: newRole };
    setCurrentUser(updatedUser);
    saveCurrentUser(updatedUser);
    setIsOpen(false);

    toast(`Switched active role to ${newRole.replace('_', ' ').toUpperCase()}`, undefined, 'info');

    const targetRoute = getDefaultDashboardForRole(newRole);
    router.push(targetRoute);
  };

  const handleUserSelect = (userId: string) => {
    const targetUser = MOCK_USERS.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      saveCurrentUser(targetUser);
      setIsOpen(false);
      toast(`Logged in as ${targetUser.fullName}`, `Role: ${targetUser.activeRole}`, 'success');
      const targetRoute = getDefaultDashboardForRole(targetUser.activeRole);
      router.push(targetRoute);
    }
  };

  const roleIcons = {
    super_admin: <Shield className="w-4 h-4 text-rose-400" />,
    sub_admin: <UserCheck className="w-4 h-4 text-amber-400" />,
    faculty: <Stethoscope className="w-4 h-4 text-sky-400" />,
    student: <GraduationCap className="w-4 h-4 text-emerald-400" />,
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-200"
      >
        <span className="flex items-center gap-1.5 capitalize">
          {roleIcons[currentUser.activeRole]}
          <span>{currentUser.activeRole.replace('_', ' ')}</span>
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-3 z-[110] text-slate-900 dark:text-slate-100 space-y-3">
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 mb-1.5">
              Active Role Switcher
            </p>
            <div className="space-y-1">
              {currentUser.roles.map((role) => (
                <button
                  key={role}
                  onClick={() => handleRoleChange(role)}
                  className={`flex items-center justify-between w-full px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                    currentUser.activeRole === role
                      ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 font-bold border border-sky-500/20'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <span className="flex items-center gap-2 capitalize">
                    {roleIcons[role]}
                    {role.replace('_', ' ')}
                  </span>
                  {currentUser.activeRole === role && <span className="text-[10px] font-bold text-sky-500">ACTIVE</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
            <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400 px-2 mb-1.5">
              Quick Switch User Context
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {MOCK_USERS.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleUserSelect(user.id)}
                  className={`flex items-center gap-2.5 w-full p-2 rounded-xl text-xs transition-colors text-left ${
                    currentUser.id === user.id
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  <img src={user.avatarUrl} alt={user.fullName} className="w-6 h-6 rounded-full object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-semibold text-[11px] leading-tight">{user.fullName}</p>
                    <p className="text-[10px] text-slate-400 capitalize truncate">{user.activeRole.replace('_', ' ')}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
