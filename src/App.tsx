import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { ResetPassword } from './components/auth/ResetPassword';
import { UpdatePassword } from './components/auth/UpdatePassword';
import { AuthCallback } from './components/auth/AuthCallback';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { LandingPage } from './pages/LandingPage';
import { PartnerLandingPage } from './pages/PartnerLandingPage';
import { PerformancePage } from './pages/PerformancePage';
import { LocationsPage } from './pages/LocationsPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { BillingPage } from './pages/BillingPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLocationsPage } from './pages/admin/AdminLocationsPage';
import { PlanManagementPage } from './pages/admin/PlanManagementPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { ChangelogPage } from './pages/admin/ChangelogPage';

export default function App() {
  const { isAuthenticated, user } = useAuthStore();

  const getDefaultRoute = () => {
    if (!user) return '/';
    
    switch (user.role) {
      case 'MEMBER':
        return '/dashboard/performance';
      case 'PARTNER':
        return '/dashboard/locations';
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return '/dashboard/analytics';
      default:
        return '/';
    }
  };

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LandingPage />} />
        <Route path="/partner" element={<PartnerLandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <LoginForm />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to={getDefaultRoute()} /> : <SignupForm />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/update-password" element={<UpdatePassword />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          {/* Member Routes */}
          <Route path="performance" element={<PerformancePage />} />
          <Route path="locations" element={<LocationsPage />} />
          <Route path="messages" element={<MessagesPage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="profile/:username" element={<ProfilePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="billing" element={<BillingPage />} />

          {/* Admin Routes */}
          <Route path="analytics" element={<AdminAnalyticsPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="locations" element={<AdminLocationsPage />} />
          <Route path="plans" element={<PlanManagementPage />} />
          <Route path="admin/settings" element={<AdminSettingsPage />} />
          <Route path="changelog" element={<ChangelogPage />} />

          {/* Default redirect */}
          <Route index element={<Navigate to={getDefaultRoute()} replace />} />
        </Route>

        {/* Catch all route */}
        <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
      </Routes>
    </Router>
  );
}