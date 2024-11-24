import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Role } from '../../types/auth';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

interface InviteDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InviteDialog({ isOpen, onClose }: InviteDialogProps) {
  const currentUser = useAuthStore(state => state.user);
  const { createInvite } = useAdminStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('PARTNER');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await createInvite(email, role);
      onClose();
    } catch (err) {
      setError('Failed to create invite');
    }
  };

  // Only super admins can invite admins
  const availableRoles: Role[] = currentUser?.role === 'SUPER_ADMIN' 
    ? ['PARTNER', 'ADMIN']
    : ['PARTNER'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-lg border dark:border-gray-800"
      >
        <div className="flex justify-between items-center p-6 border-b dark:border-gray-800">
          <h2 className="text-xl font-semibold">Invite User</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                placeholder="partner@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
              required
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Send Invite
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}