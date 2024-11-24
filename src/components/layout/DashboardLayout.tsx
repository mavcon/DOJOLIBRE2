import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { TopBar } from './TopBar';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../lib/theme';

export function DashboardLayout() {
  const { user, isAuthenticated } = useAuthStore();
  const { getTheme } = useThemeStore();
  const location = useLocation();

  useEffect(() => {
    if (user) {
      const theme = getTheme(user.role);
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  }, [user, getTheme]);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopBar />
      <main className="container mx-auto px-4 py-6 max-w-7xl">
        <Outlet />
      </main>
    </div>
  );
}