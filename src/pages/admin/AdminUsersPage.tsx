import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, MoreVertical, CheckCircle, XCircle, Building2, Shield } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useUserStore } from '../../store/userStore';
import { useAdminStore } from '../../store/adminStore';
import { Role, User } from '../../types/auth';
import { format } from 'date-fns';
import { UserEditDialog } from '../../components/admin/UserEditDialog';
import { InviteDialog } from '../../components/admin/InviteDialog';

type FilterOptions = {
  role?: Role;
  status?: 'active' | 'inactive';
  search?: string;
  verified?: boolean;
};

export function AdminUsersPage() {
  const { users, updateUser } = useUserStore();
  const { addChangelogEntry } = useAdminStore();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const filteredUsers = users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status === 'active' && !user.isActive) return false;
    if (filters.status === 'inactive' && user.isActive) return false;
    if (filters.verified && (!user.partnerInfo || !user.partnerInfo.verified)) return false;
    if (filters.search) {
      const search = filters.search.toLowerCase();
      return (
        user.name.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.partnerInfo?.businessName?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const handleStatusChange = (user: User) => {
    const changes = { isActive: !user.isActive };
    updateUser(user.id, changes);
    addChangelogEntry({
      userId: user.id,
      action: 'update',
      entityType: 'user',
      entityId: user.id,
      changes,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button
          onClick={() => setShowInviteDialog(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Invite User
        </Button>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800">
        <div className="p-4 border-b dark:border-gray-800">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            <select
              value={filters.role || ''}
              onChange={(e) => setFilters({ ...filters, role: e.target.value as Role })}
              className="px-3 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
            >
              <option value="">All Roles</option>
              <option value="MEMBER">Member</option>
              <option value="PARTNER">Partner</option>
              <option value="ADMIN">Admin</option>
              <option value="SUPER_ADMIN">Super Admin</option>
            </select>
            <select
              value={filters.status || ''}
              onChange={(e) => setFilters({ ...filters, status: e.target.value as 'active' | 'inactive' })}
              className="px-3 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {filters.role === 'PARTNER' && (
              <select
                value={filters.verified ? 'verified' : 'all'}
                onChange={(e) => setFilters({ ...filters, verified: e.target.value === 'verified' })}
                className="px-3 py-2 bg-white dark:bg-black border dark:border-gray-800 rounded-md"
              >
                <option value="all">All Partners</option>
                <option value="verified">Verified Only</option>
              </select>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Member Since
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-black divide-y dark:divide-gray-800">
              {filteredUsers.map((user) => (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                            {user.name[0]}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {user.name}
                          {user.role === 'PARTNER' && user.partnerInfo?.verified && (
                            <Shield className="w-4 h-4 text-green-500 inline-block ml-1" />
                          )}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                        {user.role === 'PARTNER' && user.partnerInfo && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                            <Building2 className="w-3 h-3" />
                            {user.partnerInfo.businessName}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(user.memberSince), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleStatusChange(user)}
                    >
                      {user.isActive ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedUser(user)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {selectedUser && (
          <UserEditDialog
            user={selectedUser}
            isOpen={true}
            onClose={() => setSelectedUser(null)}
          />
        )}
        {showInviteDialog && (
          <InviteDialog
            isOpen={true}
            onClose={() => setShowInviteDialog(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}