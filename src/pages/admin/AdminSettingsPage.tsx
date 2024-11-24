import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Shield, Bell, Lock, Sun, Moon } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useThemeStore } from '../../lib/theme';

export function AdminSettingsPage() {
  const user = useAuthStore(state => state.user);
  const { getTheme, setTheme } = useThemeStore();

  if (!user) return null;

  const currentTheme = getTheme(user.role);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(user.role, newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Admin Settings</h1>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Settings className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Button
            variant={currentTheme === 'light' ? 'default' : 'outline'}
            className="flex flex-col items-center gap-2 p-4 h-auto"
            onClick={() => handleThemeChange('light')}
          >
            <Sun className="w-6 h-6" />
            <span>Light</span>
          </Button>
          <Button
            variant={currentTheme === 'dark' ? 'default' : 'outline'}
            className="flex flex-col items-center gap-2 p-4 h-auto"
            onClick={() => handleThemeChange('dark')}
          >
            <Moon className="w-6 h-6" />
            <span>Dark</span>
          </Button>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Shield className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold">Security</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Two-Factor Authentication</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Add an extra layer of security to your account
              </p>
            </div>
            <Button variant="outline">Enable</Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Session Management</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage your active sessions
              </p>
            </div>
            <Button variant="outline">View Sessions</Button>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Bell className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold">Notifications</h2>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">Email Notifications</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Receive notifications about important updates
              </p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>

          <div className="flex items-center justify-between py-2">
            <div>
              <h3 className="font-medium">System Alerts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Get notified about system events
              </p>
            </div>
            <Button variant="outline">Configure</Button>
          </div>
        </div>
      </div>

      {/* Password Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold">Password</h2>
        </div>

        <Button variant="outline">Change Password</Button>
      </div>
    </div>
  );
}