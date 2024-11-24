import React from 'react';
import { MessageCircle, UserPlus, UserMinus, Ban } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserProfile } from '../../types/user';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';

interface MemberInteractionsProps {
  member: UserProfile;
  onMessageClick?: () => void;
  size?: 'sm' | 'md';
  showMessage?: boolean;
}

export function MemberInteractions({ 
  member, 
  onMessageClick, 
  size = 'md',
  showMessage = true 
}: MemberInteractionsProps) {
  const currentUser = useAuthStore(state => state.user);
  const { followUser, unfollowUser, blockUser, unblockUser } = useUserStore();

  // Only show interactions if both users are members
  if (!currentUser || 
      currentUser.id === member.id || 
      currentUser.role !== 'MEMBER' || 
      member.role !== 'MEMBER') {
    return null;
  }

  const isFollowing = member.interactions.followers.includes(currentUser.id);
  const isBlocked = member.interactions.blocked.includes(currentUser.id);

  const handleFollow = () => {
    if (isFollowing) {
      unfollowUser(currentUser.id, member.id);
    } else {
      followUser(currentUser.id, member.id);
    }
  };

  const handleBlock = () => {
    if (isBlocked) {
      unblockUser(currentUser.id, member.id);
    } else {
      blockUser(currentUser.id, member.id);
    }
  };

  return (
    <div className="flex items-center gap-2">
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

      {showMessage && onMessageClick && (
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
    </div>
  );
}