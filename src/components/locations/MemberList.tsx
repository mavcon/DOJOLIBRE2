import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, UserPlus, UserMinus, Ban } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';

interface MemberListProps {
  memberIds: string[];
  onMessageClick: (member: any) => void;
}

export function MemberList({ memberIds, onMessageClick }: MemberListProps) {
  const navigate = useNavigate();
  const currentUser = useAuthStore(state => state.user);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!memberIds.length) {
        setMembers([]);
        setLoading(false);
        return;
      }

      try {
        // Validate UUIDs before querying
        const validUuids = memberIds.filter(id => {
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          return uuidRegex.test(id);
        });

        if (!validUuids.length) {
          setMembers([]);
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .in('id', validUuids)
          .eq('role', 'MEMBER')
          .eq('is_active', true);

        if (error) throw error;
        setMembers(data || []);
      } catch (err) {
        console.error('Error fetching members:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    // Subscribe to realtime changes
    const subscription = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=in.(${memberIds.filter(id => {
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
            return uuidRegex.test(id);
          }).join(',')})` 
        }, 
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [memberIds]);

  // Only allow member interactions
  const canInteract = currentUser?.role === 'MEMBER';

  const handleFollow = async (memberId: string) => {
    if (!currentUser || !canInteract) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('interactions')
        .eq('id', currentUser.id)
        .single();

      if (!profile) return;

      const isFollowing = profile.interactions.following.includes(memberId);
      const newFollowing = isFollowing
        ? profile.interactions.following.filter((id: string) => id !== memberId)
        : [...profile.interactions.following, memberId];

      await supabase
        .from('profiles')
        .update({
          interactions: {
            ...profile.interactions,
            following: newFollowing
          }
        })
        .eq('id', currentUser.id);
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
  };

  const handleBlock = async (memberId: string) => {
    if (!currentUser || !canInteract) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('interactions')
        .eq('id', currentUser.id)
        .single();

      if (!profile) return;

      const isBlocked = profile.interactions.blocked.includes(memberId);
      const newBlocked = isBlocked
        ? profile.interactions.blocked.filter((id: string) => id !== memberId)
        : [...profile.interactions.blocked, memberId];

      await supabase
        .from('profiles')
        .update({
          interactions: {
            ...profile.interactions,
            blocked: newBlocked
          }
        })
        .eq('id', currentUser.id);
    } catch (err) {
      console.error('Error updating block status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
        Current Members ({members.length})
      </h3>
      <div className="space-y-2">
        {members.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-4">
            No members currently checked in
          </p>
        ) : (
          members.map(member => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-900 rounded-lg transition-colors"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => navigate(`/dashboard/profile/${member.username}`)}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
                      {member.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium">@{member.username || member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{member.name}</p>
                </div>
              </div>

              {canInteract && currentUser.id !== member.id && (
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleFollow(member.id)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    {member.interactions?.followers?.includes(currentUser.id) ? (
                      <UserMinus className="w-4 h-4" />
                    ) : (
                      <UserPlus className="w-4 h-4" />
                    )}
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onMessageClick(member)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleBlock(member.id)}
                    className={`p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full ${
                      member.interactions?.blocked?.includes(currentUser.id) ? 'text-red-600' : ''
                    }`}
                  >
                    <Ban className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}