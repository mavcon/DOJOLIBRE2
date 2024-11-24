import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types/user';
import { UserActions } from './UserActions';

interface UserCardProps {
  user: UserProfile;
  showActions?: boolean;
  showStats?: boolean;
  onMessageClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
}

export function UserCard({ 
  user, 
  showActions = true, 
  showStats = false,
  onMessageClick,
  size = 'md' 
}: UserCardProps) {
  const navigate = useNavigate();

  const sizeClasses = {
    sm: {
      container: 'p-2',
      avatar: 'w-8 h-8',
      name: 'text-sm',
      username: 'text-xs',
    },
    md: {
      container: 'p-3',
      avatar: 'w-10 h-10',
      name: 'text-base',
      username: 'text-sm',
    },
    lg: {
      container: 'p-4',
      avatar: 'w-12 h-12',
      name: 'text-lg',
      username: 'text-base',
    },
  }[size];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between ${sizeClasses.container} bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow`}
    >
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => navigate(`/profile/${user.username}`)}
      >
        <div className={`${sizeClasses.avatar} rounded-full bg-indigo-100 flex items-center justify-center`}>
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className={`${sizeClasses.name} font-medium text-indigo-600`}>
              {user.name[0]}
            </span>
          )}
        </div>
        <div>
          <p className={`${sizeClasses.name} font-medium`}>@{user.username}</p>
          <p className={`${sizeClasses.username} text-gray-600`}>{user.name}</p>
          {showStats && (
            <div className="flex gap-4 mt-1 text-sm text-gray-500">
              <span>{user.interactions.followers.length} followers</span>
              <span>{user.interactions.following.length} following</span>
            </div>
          )}
        </div>
      </div>

      {showActions && (
        <UserActions 
          user={user} 
          onMessageClick={onMessageClick}
          size={size === 'sm' ? 'sm' : 'md'}
        />
      )}
    </motion.div>
  );
}