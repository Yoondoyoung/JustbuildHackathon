import { supabase } from "../../shared/supabase";

export type AuthState = {
  isAuthenticated: boolean;
  user: any | null;
};

export const checkAuth = async (): Promise<AuthState> => {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    isAuthenticated: !!session,
    user: session?.user ?? null,
  };
};

export const signUp = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const onAuthStateChange = (callback: (state: AuthState) => void) => {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback({
      isAuthenticated: !!session,
      user: session?.user ?? null,
    });
  });
};
