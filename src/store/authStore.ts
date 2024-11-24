import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { Role, User } from '../types/auth';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, dob: Date) => Promise<void>;
  logout: () => Promise<void>;
  googleAuth: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  resendConfirmation: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      console.log('Attempting login...');

      // First, sign in with email/password
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error('No user data returned');

      // Then fetch the user's profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: authData.user.id,
              email: authData.user.email,
              name: authData.user.email?.split('@')[0] || 'User',
              role: 'MEMBER',
              dob: new Date().toISOString(),
              is_active: true,
              privacy_settings: { showConnections: true, showBio: true },
              interactions: { following: [], followers: [], blocked: [] }
            }])
            .select()
            .single();

          if (createError) throw createError;
          if (!newProfile) throw new Error('Failed to create profile');
          
          set({
            user: {
              id: authData.user.id,
              email: authData.user.email!,
              name: newProfile.name,
              role: newProfile.role as Role,
              memberSince: new Date(authData.user.created_at),
              isActive: newProfile.is_active,
              subscriptionTier: newProfile.subscription_tier,
              partnerInfo: newProfile.partner_info,
            },
            isAuthenticated: true,
            isLoading: false,
          });
          return;
        }
        throw profileError;
      }

      // Update auth store with user data
      set({
        user: {
          id: authData.user.id,
          email: authData.user.email!,
          name: profile.name,
          role: profile.role as Role,
          memberSince: new Date(authData.user.created_at),
          isActive: profile.is_active,
          subscriptionTier: profile.subscription_tier,
          partnerInfo: profile.partner_info,
        },
        isAuthenticated: true,
        isLoading: false,
      });

      console.log('Login successful');
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, dob: Date) => {
    try {
      set({ isLoading: true });

      const { data: { user }, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            dob: dob.toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      if (!user) throw new Error('No user data returned');

      set({ isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resendConfirmation: async (email: string) => {
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    
    if (error) throw error;
  },

  logout: async () => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  googleAuth: async () => {
    try {
      set({ isLoading: true });
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (error) throw error;
  },

  updatePassword: async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  },
}));