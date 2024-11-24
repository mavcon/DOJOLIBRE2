import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../shared/Logo';

export function LoginForm() {
  const navigate = useNavigate();
  const { login, resendConfirmation, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [resendingEmail, setResendingEmail] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Login error:', err);
      
      if (err.code === 'email_not_confirmed') {
        setError('Please verify your email address before logging in.');
      } else if (err.status === 401) {
        setError('Invalid email or password');
      } else {
        setError(err.message || 'An error occurred during login');
      }
    }
  };

  const handleResendConfirmation = async () => {
    try {
      setResendingEmail(true);
      await resendConfirmation(formData.email);
      setError('Verification email has been resent. Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setResendingEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <Logo className="w-16 h-16" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="form-group">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className="peer"
              required
            />
            <label>Email</label>
          </div>

          <div className="form-group">
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="Password"
              className="peer"
              required
            />
            <label>Password</label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-4 h-4" />
                <span>{error}</span>
              </div>
              {error.includes('verify your email') && (
                <Button
                  type="button"
                  variant="outline"
                  className="w-full mt-2"
                  onClick={handleResendConfirmation}
                  disabled={resendingEmail}
                >
                  {resendingEmail ? 'Sending...' : 'Resend Verification Email'}
                </Button>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/reset-password')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Forgot password?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/signup')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </button>
        </p>
      </motion.div>
    </div>
  );
}