import type { User } from '@supabase/supabase-js';

export interface Profile {
  id: string;
  name: string;
  age: number;
  gender: 'Male' | 'Female';
  email: string;
  avatar_id: number | null;
  avatar_url: string | null;
}

export interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, profileData: Omit<Profile, 'id' | 'avatar_id' | 'avatar_url'>) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateAvatar: (avatarId: number | null, avatarUrl: string | null) => Promise<{ error: string | null }>;
}
