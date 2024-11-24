import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, MessageCircle, UserPlus, UserMinus, Ban, Edit } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';

interface ProfileHeaderProps {
  profile: any;
  isOwnProfile: boolean;
  onMessageClick: () => void;
  onEditClick: () => void;
}

export function ProfileHeader({
  profile,
  isOwnProfile,
  onMessageClick,
  onEditClick,
}: ProfileHeaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarClick = () => {
    if (isOwnProfile) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `${profile.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile.id);

      if (updateError) throw updateError;

      // Show success feedback
      const button = document.querySelector('.upload-feedback');
      if (button) {
        button.classList.add('success');
        setTimeout(() => button.classList.remove('success'), 2000);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  return (
    <div className="relative bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800">
      <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600" />

      <div className="px-6 -mt-12 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-6">
            <motion.div
              className="relative"
              whileHover={isOwnProfile ? { scale: 1.05 } : {}}
              whileTap={isOwnProfile ? { scale: 0.95 } : {}}
            >
              <div
                onClick={handleAvatarClick}
                className="w-24 h-24 rounded-full bg-white dark:bg-gray-900 p-1 cursor-pointer ring-4 ring-white dark:ring-gray-900"
              >
                {profile.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                    <span className="text-3xl font-medium text-indigo-600 dark:text-indigo-400">
                      {profile.name[0].toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              {isOwnProfile && (
                <>
                  <motion.button
                    className="upload-feedback absolute bottom-0 right-0 p-1.5 bg-indigo-600 rounded-full text-white hover:bg-indigo-700 transition-all duration-200"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <Camera className="w-4 h-4" />
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </>
              )}
            </motion.div>

            <div className="flex flex-col justify-end mb-1">
              <h1 className="text-2xl font-bold">
                {profile.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Member since {format(new Date(profile.memberSince), 'MMMM yyyy')}
              </p>
              {profile.bio && profile.privacy_settings?.showBio && (
                <p className="text-gray-600 dark:text-gray-300 mt-4 max-w-2xl">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {isOwnProfile ? (
              <Button
                onClick={onEditClick}
                variant="ghost"
                size="sm"
                className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <Edit className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button
                  onClick={onMessageClick}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  {profile.interactions?.followers?.includes(profile.id) ? (
                    <UserMinus className="w-4 h-4" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                >
                  <Ban className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <style>{`
        .upload-feedback.success {
          background-color: #10B981;
          transform: scale(1.2);
        }
        .upload-feedback.success::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 9999px;
          background: rgba(16, 185, 129, 0.2);
          animation: pulse 1s ease-out;
        }
        @keyframes pulse {
          from { transform: scale(1); opacity: 1; }
          to { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}