import type { User } from '@supabase/supabase-js';
import { getCurrentUser } from './auth';
import { getSupabaseClient } from './supabase-client';

export interface AuthenticatedProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  status: 'pending' | 'approved' | 'revoked';
  departmentId: string | null;
}

export interface ProfileLookupResult {
  profile: AuthenticatedProfile | null;
  error: Error | null;
}

export async function getProfileByEmail(email: string): Promise<ProfileLookupResult> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from('profiles')
      .select('id, email, full_name, avatar_url, status, department_id')
      .eq('email', email)
      .maybeSingle();

    if (error) {
      return {
        profile: null,
        error: new Error(
          `profiles.select("id, email, full_name, avatar_url, status, department_id").eq("email", authenticatedEmail).maybeSingle() failed: ${error.message}`
        ),
      };
    }

    if (!data) {
      return { profile: null, error: null };
    }

    return {
      profile: {
        id: data.id,
        email: data.email,
        fullName: data.full_name,
        avatarUrl: data.avatar_url,
        status: data.status,
        departmentId: data.department_id,
      },
      error: null,
    };
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error : new Error('Unable to load the authenticated profile.'),
    };
  }
}

export async function getCurrentProfile(): Promise<ProfileLookupResult> {
  try {
    const { user, error } = await getCurrentUser();

    if (error) {
      return { profile: null, error: new Error(error.message) };
    }

    if (!user?.email) {
      return { profile: null, error: null };
    }

    return getProfileForUser(user);
  } catch (error) {
    return {
      profile: null,
      error: error instanceof Error ? error : new Error('Unable to load the authenticated profile.'),
    };
  }
}

export function getProfileForUser(user: Pick<User, 'email'>): Promise<ProfileLookupResult> {
  if (!user.email) {
    return Promise.resolve({
      profile: null,
      error: new Error('The authenticated Supabase user does not have an email address.'),
    });
  }

  return getProfileByEmail(user.email);
}