import { getCurrentProfile, type ProfileLookupResult } from './profile';
import { getSupabaseClient } from './supabase-client';
import type { PermissionKey, UserRole, UserScope } from '@/lib/rbac';

export interface RoleLookupResult {
  roles: UserRole[];
  primaryRole: UserRole | null;
  permissions: PermissionKey[];
  scopes: UserScope[];
  error: Error | null;
}

const emptyRoleResult = (error: Error | null = null): RoleLookupResult => ({
  roles: [],
  primaryRole: null,
  permissions: [],
  scopes: [],
  error,
});

const isUserRole = (name: string): name is UserRole =>
  name === 'student' || name === 'faculty' || name === 'sub_admin' || name === 'super_admin';

const isUserScope = (scopeType: string): scopeType is UserScope['scopeType'] =>
  scopeType === 'global' || scopeType === 'department' || scopeType === 'course';

function failedQuery(query: string, error: { message: string }): RoleLookupResult {
  return emptyRoleResult(new Error(`${query} failed: ${error.message}`));
}

export async function getRolesForProfile(profileId: string): Promise<RoleLookupResult> {
  try {
    const client = getSupabaseClient();
    const userRolesQuery = `SELECT role_id FROM user_roles WHERE user_id = '${profileId}'`;
    const { data: userRoleRows, error: userRolesError } = await client
      .from('user_roles')
      .select('role_id')
      .eq('user_id', profileId);

    if (userRolesError) return failedQuery(userRolesQuery, userRolesError);

    const roleIds = [...new Set((userRoleRows ?? []).map((row) => row.role_id))];
    let roles: UserRole[] = [];

    if (roleIds.length > 0) {
      const rolesQuery = `SELECT id, name FROM roles WHERE id IN (${roleIds.map((id) => `'${id}'`).join(', ')})`;
      const { data: roleRows, error: rolesError } = await client
        .from('roles')
        .select('id, name')
        .in('id', roleIds);

      if (rolesError) return failedQuery(rolesQuery, rolesError);
      roles = [...new Set((roleRows ?? []).map((row) => row.name).filter(isUserRole))];
    }

    const scopesQuery = `SELECT scope_type, target_id FROM user_scopes WHERE user_id = '${profileId}'`;
    const { data: scopeRows, error: scopesError } = await client
      .from('user_scopes')
      .select('scope_type, target_id')
      .eq('user_id', profileId);

    if (scopesError) return failedQuery(scopesQuery, scopesError);

    const scopes: UserScope[] = (scopeRows ?? [])
      .filter((row) => isUserScope(row.scope_type))
      .map((row) => ({ scopeType: row.scope_type, targetId: row.target_id ?? undefined }));

    let permissions: PermissionKey[] = [];
    const assignedRoleIds = [...new Set((userRoleRows ?? []).map((row) => row.role_id))];

    if (assignedRoleIds.length > 0) {
      const rolePermissionsQuery = `SELECT permission_id FROM role_permissions WHERE role_id IN (${assignedRoleIds.map((id) => `'${id}'`).join(', ')})`;
      const { data: rolePermissionRows, error: rolePermissionsError } = await client
        .from('role_permissions')
        .select('permission_id')
        .in('role_id', assignedRoleIds);

      if (rolePermissionsError) return failedQuery(rolePermissionsQuery, rolePermissionsError);

      const permissionIds = [...new Set((rolePermissionRows ?? []).map((row) => row.permission_id))];
      if (permissionIds.length > 0) {
        const permissionsQuery = `SELECT key FROM permissions WHERE id IN (${permissionIds.map((id) => `'${id}'`).join(', ')})`;
        const { data: permissionRows, error: permissionsError } = await client
          .from('permissions')
          .select('key')
          .in('id', permissionIds);

        if (permissionsError) return failedQuery(permissionsQuery, permissionsError);
        permissions = [...new Set((permissionRows ?? []).map((row) => row.key as PermissionKey))];
      }
    }

    return {
      roles,
      primaryRole: roles.length === 1 ? roles[0] : null,
      permissions,
      scopes,
      error: null,
    };
  } catch (error) {
    return emptyRoleResult(error instanceof Error ? error : new Error('Unable to load role assignments.'));
  }
}

export async function getCurrentUserRoles(): Promise<RoleLookupResult> {
  const profileResult: ProfileLookupResult = await getCurrentProfile();
  if (profileResult.error) return emptyRoleResult(profileResult.error);
  if (!profileResult.profile) return emptyRoleResult();

  return getRolesForProfile(profileResult.profile.id);
}

export async function getPrimaryRole(profileId: string) {
  const result = await getRolesForProfile(profileId);
  return { primaryRole: result.primaryRole, error: result.error };
}

export async function getCurrentRole() {
  const result = await getCurrentUserRoles();
  return { role: result.primaryRole, error: result.error };
}