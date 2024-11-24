import React from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, UserPlus, UserMinus, Ban } from 'lucide-react';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { UserProfile } from '../../types/user';

interface UserActionsProps {
  user: UserProfile;
  showMessage?: boolean;
  onMessageClick?: () => void;
  size?: 'sm' | 'md';
}

export function UserActions({ user, showMessage = true, onMessageClick, size = 'md' }: UserActionsProps) {
  const currentUser = useAuthStore(state => state.user);
  const { followUser, unfollowUser, blockUser, unblockUser } = useUserStore();

  if (!currentUser || currentUser.id === user.id) return null;

  const isFollowing = user.interactions.followers.includes(currentUser.id);
  const isBlocked = user.interactions.blocked.includes(currentUser.id);

  const handleFollow = () => {
    if (isFollowing) {
      unfollowUser(currentUser.id, user.id);
    } else {
      followUser(currentUser.id, user.id);
    }
  };

  const handleBlock = () => {
    if (isBlocked) {
      unblockUser(currentUser.id, user.id);
    } else {
      blockUser(currentUser.id, user.id);
    }
  };

  return (
    <motion.div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size={size}
        onClick={handleFollow}
        className="flex items-center gap-1"
      >
        {isFollowing ? (
          <>
            <UserMinus className="w-4 h-4" />
            {size === 'md' && <span>Unfollow</span>}
          </>
        ) : (
          <>
            <UserPlus className="w-4 h-4" />
            {size === 'md' && <span>Follow</span>}
          </>
        )}
      </Button>

      {showMessage && (
        <Button
          variant="ghost"
          size={size}
          onClick={onMessageClick}
          className="flex items-center gap-1"
        >
          <MessageCircle className="w-4 h-4" />
          {size === 'md' && <span>Message</span>}
        </Button>
      )}

      <Button
        variant="ghost"
        size={size}
        onClick={handleBlock}
        className={`flex items-center gap-1 ${isBlocked ? 'text-red-600' : ''}`}
      >
        <Ban className="w-4 h-4" />
        {size === 'md' && <span>{isBlocked ? 'Unblock' : 'Block'}</span>}
      </Button>
    </motion.div>
  );
}