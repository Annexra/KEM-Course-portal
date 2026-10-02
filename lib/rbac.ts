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

// Role to Permissions mapping
const ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  super_admin: [
    'course:read',
    'course:write',
    'course:delete',
    'assessment:take',
    'assessment:manage',
    'question_bank:manage',
    'student:approve',
    'student:view_all',
    'users:manage',
    'integrity:review',
    'audit:view_restore',
    'settings:manage',
  ],
  sub_admin: [
    'course:read',
    'course:write',
    'assessment:manage',
    'question_bank:manage',
    'student:approve',
    'student:view_all',
    'integrity:review',
  ],
  faculty: [
    'course:read',
    'course:write',
    'assessment:manage',
    'question_bank:manage',
    'student:view_all',
    'integrity:review',
  ],
  student: ['course:read', 'assessment:take'],
};

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

  const role = user.activeRole || user.roles[0];
  const allowedPermissions = ROLE_PERMISSIONS[role] || [];

  if (!allowedPermissions.includes(permission)) {
    return false;
  }

  // Super admins have global access
  if (role === 'super_admin') return true;

  // Evaluate Scope
  if (user.scopes.some((s) => s.scopeType === 'global')) {
    return true;
  }

  if (options?.departmentId) {
    const hasDeptScope = user.scopes.some(
      (s) => s.scopeType === 'department' && s.targetId === options.departmentId
    );
    if (hasDeptScope) return true;
  }

  if (options?.courseId) {
    const hasCourseScope = user.scopes.some(
      (s) => s.scopeType === 'course' && s.targetId === options.courseId
    );
    if (hasCourseScope) return true;
  }

  // If no restrictive options passed and user has permission
  return true;
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
