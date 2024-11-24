import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Mail, Copy, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useAdminStore } from '../../store/adminStore';
import { Role } from '../../types/auth';
import { format } from 'date-fns';

export function AdminInvitesPage() {
  const { invites, createInvite, revokeInvite } = useAdminStore();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<Role>('PARTNER');
  const [copied, setCopied] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email && role) {
      await createInvite(email, role);
      setEmail('');
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(link);
    setCopied(token);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Partner Invites</h1>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Send New Invite</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                placeholder="partner@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Role
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                required
              >
                <option value="PARTNER">Partner</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
          </div>
          <Button type="submit" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Send Invite
          </Button>
        </form>
      </div>

      <div className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800">
        <div className="p-6 border-b dark:border-gray-800">
          <h2 className="text-lg font-semibold">Active Invites</h2>
        </div>
        <div className="divide-y dark:divide-gray-800">
          {invites.map((invite) => (
            <motion.div
              key={invite.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-6 flex items-center justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{invite.email}</span>
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  Expires: {format(new Date(invite.expiresAt), 'MMM d, yyyy')}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyInviteLink(invite.token)}
                  className="flex items-center gap-2"
                >
                  {copied === invite.token ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy Link
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => revokeInvite(invite.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  Revoke
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}