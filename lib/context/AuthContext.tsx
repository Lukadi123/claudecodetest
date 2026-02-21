'use client';

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextType, Profile } from '@/lib/types/auth';
import type { User } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data as Profile;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  // Tracks the user ID that just signed up — blocks ALL onAuthStateChange
  // profile fetches for this user until cleared after navigation
  const signUpUserId = useRef<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        fetchProfile(currentUser.id).then(setProfile);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        // If a signup is in progress ('pending') or this specific user just signed up,
        // skip all fetches — profile is already set locally
        if (signUpUserId.current === 'pending' || signUpUserId.current === currentUser.id) {
          return;
        }
        fetchProfile(currentUser.id).then(setProfile);
      } else {
        setProfile(null);
        signUpUserId.current = null;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function signUp(
    email: string,
    password: string,
    profileData: Omit<Profile, 'id' | 'avatar_id' | 'avatar_url'>
  ): Promise<{ error: string | null }> {
    // Set the flag BEFORE calling signUp so any onAuthStateChange events are blocked.
    // We use 'pending' as a sentinel to block ALL auth events during the signup call,
    // then replace with the real user ID once we have it.
    signUpUserId.current = 'pending';

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      signUpUserId.current = null;
      return { error: error.message };
    }

    const newUser = data.user;
    if (!newUser) {
      signUpUserId.current = null;
      return { error: 'Sign up succeeded but no user returned.' };
    }

    signUpUserId.current = newUser.id;

    const insertData = {
      id: newUser.id,
      name: profileData.name,
      age: profileData.age,
      gender: profileData.gender,
      email: profileData.email,
    };

    const { error: profileError } = await supabase
      .from('profiles')
      .upsert(insertData);

    if (profileError) {
      signUpUserId.current = null;
      return { error: profileError.message };
    }

    setProfile({ ...insertData, avatar_id: null, avatar_url: null });

    // Clear the signup guard after a delay to let all auth events settle
    setTimeout(() => {
      signUpUserId.current = null;
    }, 5000);

    return { error: null };
  }

  async function updateAvatar(avatarId: number | null, avatarUrl: string | null): Promise<{ error: string | null }> {
    if (!user) return { error: 'Not authenticated.' };

    const { error } = await supabase
      .from('profiles')
      .update({ avatar_id: avatarId, avatar_url: avatarUrl })
      .eq('id', user.id);

    if (error) return { error: error.message };

    setProfile((prev) => prev ? { ...prev, avatar_id: avatarId, avatar_url: avatarUrl } : prev);
    return { error: null };
  }

  async function signIn(
    email: string,
    password: string
  ): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, updateAvatar }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
