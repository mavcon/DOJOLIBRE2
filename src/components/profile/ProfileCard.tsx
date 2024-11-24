import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, UserPlus, UserMinus, Ban } from 'lucide-react';
import { Button } from '../ui/Button';
import { UserProfile } from '../../types/user';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { format } from 'date-fns';

interface ProfileCardProps {
  profile: UserProfile;
  onMessageClick: () => void;
}

export function ProfileCard({ profile, onMessageClick }: ProfileCardProps) {
  const currentUser = useAuthStore((state) => state.user);
  const { followUser, unfollowUser, blockUser, unblockUser } = useUserStore();
  const isOwnProfile = currentUser?.id === profile.id;

  const isFollowing = currentUser && profile.interactions.followers.includes(currentUser.id);
  const isBlocked = currentUser && profile.interactions.blocked.includes(currentUser.id);

  const handleFollow = () => {
    if (!currentUser) return;
    if (isFollowing) {
      unfollowUser(currentUser.id, profile.id);
    } else {
      followUser(currentUser.id, profile.id);
    }
  };

  const handleBlock = () => {
    if (!currentUser) return;
    if (isBlocked) {
      unblockUser(currentUser.id, profile.id);
    } else {
      blockUser(currentUser.id, profile.id);
    }
  };

  return (
    <div className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-2xl font-medium text-indigo-600 dark:text-indigo-400">
                  {profile.name[0]}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">@{profile.username}</h2>
              <p className="text-gray-600 dark:text-gray-400">{profile.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                Member since {format(new Date(profile.memberSince), 'MMMM yyyy')}
              </p>
            </div>
          </div>

          {!isOwnProfile && currentUser && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleFollow}
                className="flex items-center gap-2"
              >
                {isFollowing ? (
                  <>
                    <UserMinus className="w-4 h-4" />
                    Unfollow
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    Follow
                  </>
                )}
              </Button>
              <Button
                onClick={onMessageClick}
                className="flex items-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                Message
              </Button>
              <Button
                variant="ghost"
                onClick={handleBlock}
                className={isBlocked ? 'text-red-600' : ''}
              >
                <Ban className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {profile.privacySettings.showBio && profile.bio && (
          <div className="mb-6">
            <p className="text-gray-600 dark:text-gray-400">{profile.bio}</p>
          </div>
        )}

        <div className="flex gap-6">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Followers</p>
            <p className="text-xl font-bold">
              {profile.interactions.followers.length}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Following</p>
            <p className="text-xl font-bold">
              {profile.interactions.following.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}