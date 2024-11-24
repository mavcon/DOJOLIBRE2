import React, { createContext, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../lib/theme';
import { Role } from '../../types/auth';

interface AuthContextType {
  isInitialized: boolean;
}

const AuthContext = createContext<AuthContextType>({ isInitialized: false });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const { getTheme } = useThemeStore();
  const { user } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          throw sessionError;
        }

        if (session?.user) {
          // Fetch user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            console.error('Profile error:', profileError);
            throw profileError;
          }

          if (profile && mounted) {
            // Update auth store
            useAuthStore.setState({
              user: {
                id: session.user.id,
                email: session.user.email!,
                name: profile.name,
                role: profile.role as Role,
                memberSince: new Date(session.user.created_at),
                isActive: profile.is_active,
                subscriptionTier: profile.subscription_tier,
                partnerInfo: profile.partner_info,
              },
              isAuthenticated: true,
              isLoading: false,
            });

            // Apply theme
            const theme = getTheme(profile.role);
            document.documentElement.classList.remove('light', 'dark');
            document.documentElement.classList.add(theme);

            // Handle navigation
            const path = window.location.pathname;
            if (path === '/login' || path === '/signup' || path === '/') {
              navigate('/dashboard');
            }
          }
        } else if (mounted) {
          // Clear auth state if no session
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
          // Clear any stale session data
          await supabase.auth.signOut();
          localStorage.clear();
        }
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state change:', event, session?.user?.id);

        if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
          useAuthStore.setState({ 
            user: null, 
            isAuthenticated: false,
            isLoading: false,
          });
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add('light');
          localStorage.clear();
          navigate('/login');
          return;
        }

        if (session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profileError) throw profileError;

            if (profile && mounted) {
              useAuthStore.setState({
                user: {
                  id: session.user.id,
                  email: session.user.email!,
                  name: profile.name,
                  role: profile.role as Role,
                  memberSince: new Date(session.user.created_at),
                  isActive: profile.is_active,
                  subscriptionTier: profile.subscription_tier,
                  partnerInfo: profile.partner_info,
                },
                isAuthenticated: true,
                isLoading: false,
              });

              const theme = getTheme(profile.role);
              document.documentElement.classList.remove('light', 'dark');
              document.documentElement.classList.add(theme);
            }
          } catch (error) {
            console.error('Profile update error:', error);
            if (mounted) {
              useAuthStore.setState({ 
                user: null, 
                isAuthenticated: false,
                isLoading: false,
              });
              await supabase.auth.signOut();
              localStorage.clear();
              navigate('/login');
            }
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, getTheme]);

  return (
    <AuthContext.Provider value={{ isInitialized: true }}>
      {children}
    </AuthContext.Provider>
  );
}