import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { UserProfile } from '../../types/user';
import { useUserStore } from '../../store/userStore';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { MemberInteractions } from '../shared/MemberInteractions';

interface FollowersListProps {
  profile: UserProfile;
  type: 'followers' | 'following';
  onClose: () => void;
}

export function FollowersList({ profile, type, onClose }: FollowersListProps) {
  const navigate = useNavigate();
  const { users } = useUserStore();
  
  const connections = type === 'followers' 
    ? profile.interactions.followers
    : profile.interactions.following;

  const connectionUsers = users.filter(user => connections.includes(user.id));

  return (
    <div className="bg-white rounded-lg border p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          {type === 'followers' ? 'Followers' : 'Following'}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-4 max-h-64 overflow-y-auto">
        {connectionUsers.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No {type} yet
          </p>
        ) : (
          connectionUsers.map(user => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg"
            >
              <div 
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => {
                  navigate(`/profile/${user.username}`);
                  onClose();
                }}
              >
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-indigo-600">
                      {user.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-medium">@{user.username}</p>
                  <p className="text-sm text-gray-600">{user.name}</p>
                </div>
              </div>

              <MemberInteractions 
                member={user}
                size="sm"
                onMessageClick={() => {
                  navigate(`/messages?user=${user.username}`);
                  onClose();
                }}
              />
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}