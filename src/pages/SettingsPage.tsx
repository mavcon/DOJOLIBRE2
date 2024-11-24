import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../lib/theme';

export function SettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const user = useAuthStore(state => state.user);
  const { getTheme, setTheme } = useThemeStore();

  if (!user) return null;

  const currentTheme = getTheme(user.role);

  const handleThemeChange = (newTheme: 'light' | 'dark') => {
    setTheme(user.role, newTheme);
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      
      setSuccess('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Theme Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            {currentTheme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            ) : (
              <Sun className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            )}
          </div>
          <h2 className="text-lg font-semibold">Appearance</h2>
        </div>

        <div className="grid grid-cols-3 gap-4">
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
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 p-4 h-auto"
            onClick={() => handleThemeChange(
              window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
            )}
          >
            <Monitor className="w-6 h-6" />
            <span>System</span>
          </Button>
        </div>
      </div>

      {/* Password Settings */}
      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-full">
            <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h2 className="text-lg font-semibold">Password Settings</h2>
        </div>

        <form onSubmit={handlePasswordUpdate} className="space-y-6">
          {/* Current Password */}
          <div className="form-group">
            <input
              type={showCurrentPassword ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Current Password"
              className="peer"
              required
            />
            <label>Current Password</label>
            <button
              type="button"
              onClick={() => setShowCurrentPassword(!showCurrentPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showCurrentPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* New Password */}
          <div className="form-group">
            <input
              type={showNewPassword ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="New Password"
              className="peer"
              required
            />
            <label>New Password</label>
            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showNewPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm New Password"
              className="peer"
              required
            />
            <label>Confirm New Password</label>
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400"
            >
              {showConfirmPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-red-50 dark:bg-red-900/50 text-red-700 dark:text-red-200 rounded-md"
            >
              {error}
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-3 bg-green-50 dark:bg-green-900/50 text-green-700 dark:text-green-200 rounded-md"
            >
              {success}
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button type="submit">Update Password</Button>
          </div>
        </form>
      </div>
    </div>
  );
}