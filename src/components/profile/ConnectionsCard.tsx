import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Users } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../store/authStore';
import { UserCard } from '../shared/UserCard';

interface ConnectionsCardProps {
  profile: any;
  isOwnProfile: boolean;
}

export function ConnectionsCard({ profile, isOwnProfile }: ConnectionsCardProps) {
  const [activeTab, setActiveTab] = React.useState<'followers' | 'following'>('followers');
  const [connections, setConnections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', profile.interactions[activeTab]);

        if (error) throw error;
        setConnections(data || []);
      } catch (err) {
        console.error('Error fetching connections:', err);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.interactions?.[activeTab]?.length > 0) {
      fetchConnections();
    } else {
      setConnections([]);
      setLoading(false);
    }
  }, [profile, activeTab]);

  // Only show connections for members
  if (!user || user.role !== 'MEMBER') {
    return null;
  }

  if (!profile.privacySettings?.showConnections && !isOwnProfile) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Connections</h2>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'followers' ? 'default' : 'outline'}
            onClick={() => setActiveTab('followers')}
            className="flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Followers ({profile.interactions.followers.length})
          </Button>
          <Button
            variant={activeTab === 'following' ? 'default' : 'outline'}
            onClick={() => setActiveTab('following')}
            className="flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Following ({profile.interactions.following.length})
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            Loading...
          </p>
        ) : connections.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No {activeTab} yet
          </p>
        ) : (
          connections.map(connection => (
            <motion.div
              key={connection.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <UserCard user={connection} size="sm" />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}