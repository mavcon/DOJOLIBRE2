import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleHashParams = async () => {
      try {
        // Get hash parameters from URL
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        if (accessToken && refreshToken) {
          const { data: { session }, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });

          if (error) throw error;

          if (session) {
            if (type === 'signup') {
              // For new signups, show success message
              navigate('/login', { 
                state: { 
                  message: 'Email verified successfully! You can now log in.' 
                }
              });
            } else {
              // For other auth callbacks (password reset, etc)
              navigate('/dashboard');
            }
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          }
        });
      }
    };

    if (window.location.hash) {
      handleHashParams();
    }
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  );
}