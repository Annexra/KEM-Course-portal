'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@supabase/supabase-js';
import type { PermissionKey, UserRole, UserScope } from '@/lib/rbac';
import { getCurrentUser, onAuthStateChange } from '@/lib/supabase/auth';
import {
  getProfileForUser,
  type AuthenticatedProfile,
} from '@/lib/supabase/profile';
import { getRolesForProfile } from '@/lib/supabase/roles';

type AuthProfileStatus = 'loading' | 'signed_out' | 'profile' | 'profile_missing' | 'error';
type RoleLookupStatus = 'idle' | 'loading' | 'loaded' | 'error';

export interface AuthProfileSnapshot {
  status: AuthProfileStatus;
  roleStatus: RoleLookupStatus;
  loading: boolean;
  user: User | null;
  profile: AuthenticatedProfile | null;
  roles: UserRole[];
  primaryRole: UserRole | null;
  permissions: PermissionKey[];
  scopes: UserScope[];
  error: string | null;
}

interface AuthProfileState extends AuthProfileSnapshot {
  refreshProfile: (user?: User | null) => Promise<AuthProfileSnapshot | null>;
}

const AuthProfileContext = createContext<AuthProfileState | null>(null);

const emptySnapshot = (
  status: AuthProfileStatus,
  error: string | null = null
): AuthProfileSnapshot => ({
  status,
  roleStatus: 'idle',
  loading: status === 'loading',
  user: null,
  profile: null,
  roles: [],
  primaryRole: null,
  permissions: [],
  scopes: [],
  error,
});

export function AuthProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthProfileSnapshot>(emptySnapshot('loading'));
  const requestId = useRef(0);
  const refreshProfileRef = useRef<AuthProfileState['refreshProfile']>(async () => null);

  const refreshProfile: AuthProfileState['refreshProfile'] = async (providedUser) => {
    const currentRequest = ++requestId.current;
    let user = providedUser;

    try {
      if (user === undefined) {
        const authResult = await getCurrentUser();
        if (currentRequest !== requestId.current) return null;

        if (authResult.error) {
          const snapshot = emptySnapshot('error', authResult.error.message);
          setState(snapshot);
          return snapshot;
        }

        user = authResult.user;
      }

      if (!user) {
        const snapshot = emptySnapshot('signed_out');
        setState(snapshot);
        return snapshot;
      }

      setState({ ...emptySnapshot('loading'), user });
      const profileResult = await getProfileForUser(user);
      if (currentRequest !== requestId.current) return null;

      if (profileResult.error) {
        const snapshot = { ...emptySnapshot('error', profileResult.error.message), user };
        setState(snapshot);
        return snapshot;
      }

      if (!profileResult.profile) {
        const snapshot = { ...emptySnapshot('profile_missing'), user };
        setState(snapshot);
        return snapshot;
      }

      setState({
        ...emptySnapshot('loading'),
        user,
        profile: profileResult.profile,
        roleStatus: 'loading',
      });
      const roleResult = await getRolesForProfile(profileResult.profile.id);
      if (currentRequest !== requestId.current) return null;

      const snapshot: AuthProfileSnapshot = {
        status: 'profile',
        roleStatus: roleResult.error ? 'error' : 'loaded',
        loading: false,
        user,
        profile: profileResult.profile,
        roles: roleResult.roles,
        primaryRole: roleResult.primaryRole,
        permissions: roleResult.permissions,
        scopes: roleResult.scopes,
        error: roleResult.error?.message ?? null,
      };
      setState(snapshot);
      return snapshot;
    } catch (error) {
      if (currentRequest !== requestId.current) return null;
      const snapshot = emptySnapshot(
        'error',
        error instanceof Error ? error.message : 'Unable to load the authenticated user state.'
      );
      setState(snapshot);
      return snapshot;
    }
  };

  useEffect(() => {
    refreshProfileRef.current = refreshProfile;
  });

  useEffect(() => {
    let isMounted = true;
    const { data: { subscription } } = onAuthStateChange((_event, session) => {
      if (!isMounted) return;

      if (!session?.user) {
        requestId.current += 1;
        setState(emptySnapshot('signed_out'));
        return;
      }

      window.setTimeout(() => {
        if (isMounted) void refreshProfileRef.current(session.user);
      }, 0);
    });

    void refreshProfileRef.current();

    return () => {
      isMounted = false;
      requestId.current += 1;
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthProfileContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthProfileContext.Provider>
  );
}

export function useAuthProfile() {
  const context = useContext(AuthProfileContext);
  if (!context) {
    throw new Error('useAuthProfile must be used within an AuthProfileProvider.');
  }

  return context;
}