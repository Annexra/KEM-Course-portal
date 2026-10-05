import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from './supabase-client';

export type AuthResult = {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: Error | null;
};

export async function signUp(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) {
    return {
      data: { user: data.user, session: data.session },
      error: new Error(error.message),
    };
  }

  return {
    data: { user: data.user, session: data.session },
    error: null,
  };
}

export async function signIn(email: string, password: string) {
  const client = getSupabaseClient();
  const { data, error } = await client.auth.signInWithPassword({ email, password });

  if (error) {
    return {
      data: { user: data.user, session: data.session },
      error: new Error(error.message),
    };
  }

  return {
    data: { user: data.user, session: data.session },
    error: null,
  };
}

export async function signOut() {
  const client = getSupabaseClient();
  const { error } = await client.auth.signOut();
  return { error };
}

export async function getSession() {
  const client = getSupabaseClient();
  return client.auth.getSession();
}

export async function getCurrentUser() {
  const client = getSupabaseClient();
  const { data: sessionData, error: sessionError } = await client.auth.getSession();

  if (sessionError) {
    return { user: null, error: sessionError };
  }

  if (!sessionData.session) {
    return { user: null, error: null };
  }

  const { data, error } = await client.auth.getUser();
  return {
    user: data.user,
    error,
  };
}

export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const client = getSupabaseClient();
  return client.auth.onAuthStateChange(callback);
}
