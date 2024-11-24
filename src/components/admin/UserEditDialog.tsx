import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Shield } from 'lucide-react';
import { Button } from '../ui/Button';
import { User, Role } from '../../types/auth';
import { useUserStore } from '../../store/userStore';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';

interface UserEditDialogProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

export function UserEditDialog({ user, isOpen, onClose }: UserEditDialogProps) {
  const currentUser = useAuthStore(state => state.user);
  const { updateUser } = useUserStore();
  const { addChangelogEntry } = useAdminStore();
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    subscriptionTier: user.subscriptionTier,
    partnerInfo: user.partnerInfo ? {
      ...user.partnerInfo,
      verified: user.partnerInfo.verified,
    } : undefined,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const changes = {
      ...formData,
      updatedAt: new Date(),
    };

    updateUser(user.id, changes);
    addChangelogEntry({
      userId: currentUser?.id || '',
      action: 'update',
      entityType: 'user',
      entityId: user.id,
      changes,
    });
    onClose();
  };

  // Only super admins can edit admin roles
  const availableRoles: Role[] = currentUser?.role === 'SUPER_ADMIN'
    ? ['MEMBER', 'PARTNER', 'ADMIN']
    : ['MEMBER', 'PARTNER'];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-lg my-8 border dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b dark:border-gray-800 bg-white dark:bg-black rounded-t-lg">
          <h2 className="text-xl font-semibold">Edit User</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as Role })}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                required
              >
                {availableRoles.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>

            {formData.role === 'MEMBER' && (
              <div>
                <label className="block text-sm font-medium mb-2">Subscription Tier</label>
                <select
                  value={formData.subscriptionTier}
                  onChange={(e) => setFormData({ ...formData, subscriptionTier: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                >
                  <option value="basic">Basic</option>
                  <option value="pro">Pro</option>
                  <option value="premium">Premium</option>
                </select>
              </div>
            )}

            {formData.role === 'PARTNER' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Business Name</label>
                  <input
                    type="text"
                    value={formData.partnerInfo?.businessName || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      partnerInfo: {
                        ...formData.partnerInfo!,
                        businessName: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Business Address</label>
                  <input
                    type="text"
                    value={formData.partnerInfo?.businessAddress || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      partnerInfo: {
                        ...formData.partnerInfo!,
                        businessAddress: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.partnerInfo?.phone || ''}
                    onChange={(e) => setFormData({
                      ...formData,
                      partnerInfo: {
                        ...formData.partnerInfo!,
                        phone: e.target.value,
                      },
                    })}
                    className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                    required
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.partnerInfo?.verified || false}
                    onChange={(e) => setFormData({
                      ...formData,
                      partnerInfo: {
                        ...formData.partnerInfo!,
                        verified: e.target.checked,
                      },
                    })}
                    id="verified"
                  />
                  <label htmlFor="verified" className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4" />
                    Verified Partner
                  </label>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                id="active"
              />
              <label htmlFor="active" className="text-sm">Active Account</label>
            </div>

            <div className="sticky bottom-0 pt-6 mt-6 border-t dark:border-gray-800 bg-white dark:bg-black">
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}