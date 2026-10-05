export type UserRole = 'student' | 'faculty' | 'sub_admin' | 'super_admin';
export type UserStatus = 'pending' | 'approved' | 'revoked';

export interface UserScope {
  scopeType: 'global' | 'department' | 'course';
  targetId?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  status: UserStatus;
  roles: UserRole[];
  activeRole: UserRole;
  permissions?: PermissionKey[];
  scopes: UserScope[];
  departmentId?: string;
}

export type PermissionKey =
  | 'course:read'
  | 'course:write'
  | 'course:delete'
  | 'assessment:take'
  | 'assessment:manage'
  | 'question_bank:manage'
  | 'student:approve'
  | 'student:view_all'
  | 'users:manage'
  | 'integrity:review'
  | 'audit:view_restore'
  | 'settings:manage';

export interface ScopeCheckOptions {
  departmentId?: string;
  courseId?: string;
}

/**
 * Checks if a user has a permission in a given scope context
 */
export function can(
  user: UserProfile | null,
  permission: PermissionKey,
  options?: ScopeCheckOptions
): boolean {
  if (!user) return false;

  // Block revoked or pending students from protected operations
  if (user.status === 'revoked') return false;
  if (user.status === 'pending' && permission !== 'course:read') return false;

  if (!user.permissions?.includes(permission)) {
    return false;
  }

  // Evaluate Scope
  if (user.scopes.some((s) => s.scopeType === 'global')) {
    return true;
  }

  const hasDepartmentConstraint = Boolean(options?.departmentId);
  const hasCourseConstraint = Boolean(options?.courseId);
  if (!hasDepartmentConstraint && !hasCourseConstraint) return true;

  const departmentAllowed = !hasDepartmentConstraint || user.scopes.some(
    (scope) => scope.scopeType === 'department' && scope.targetId === options?.departmentId
  );
  const courseAllowed = !hasCourseConstraint || user.scopes.some(
    (scope) => scope.scopeType === 'course' && scope.targetId === options?.courseId
  );

  return departmentAllowed && courseAllowed;
}

export function getDefaultDashboardForRole(role: UserRole): string {
  switch (role) {
    case 'super_admin':
    case 'sub_admin':
      return '/admin/approvals';
    case 'faculty':
      return '/faculty/dashboard';
    case 'student':
    default:
      return '/student/dashboard';
  }
}
