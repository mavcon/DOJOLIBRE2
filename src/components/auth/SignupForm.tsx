import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { Logo } from '../shared/Logo';

export function SignupForm() {
  const navigate = useNavigate();
  const { signup, isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    dob: null as Date | null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const validateForm = (): boolean => {
    if (!formData.email) {
      setError('Email is required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    if (!formData.dob) {
      setError('Date of birth is required');
      return false;
    }
    const age = new Date().getFullYear() - formData.dob.getFullYear();
    if (age < 13) {
      setError('You must be at least 13 years old to sign up');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) return;
    if (!formData.dob) return;

    try {
      await signup(formData.email, formData.password, formData.dob);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md text-center"
        >
          <div className="flex justify-center mb-8">
            <Logo className="w-16 h-16" />
          </div>
          
          <h2 className="text-2xl font-bold mb-4">Verify Your Email</h2>
          <p className="text-gray-600 mb-6">
            We've sent you an email verification link. Please check your email and click the link to activate your account.
          </p>
          <Button onClick={() => navigate('/login')} className="w-full">
            Return to Login
          </Button>
        </motion.div>
      </div>
    );
  }

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

          <div className="form-group">
            <input
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              placeholder="Confirm Password"
              className="peer"
              required
            />
            <label>Confirm Password</label>
          </div>

          <div className="form-group">
            <DatePicker
              selected={formData.dob}
              onChange={(date) => setFormData({ ...formData, dob: date })}
              dateFormat="MM/dd/yyyy"
              showMonthDropdown
              showYearDropdown
              dropdownMode="select"
              placeholderText="Date of Birth"
              className="peer"
              maxDate={new Date()}
              minDate={new Date('1900-01-01')}
              required
            />
            <label>Date of Birth</label>
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </button>
        </p>
      </motion.div>
    </div>
  );
}