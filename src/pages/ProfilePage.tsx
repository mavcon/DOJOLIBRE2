import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { supabase } from '../lib/supabase';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { ConnectionsCard } from '../components/profile/ConnectionsCard';
import { PrivacySettings } from '../components/profile/PrivacySettings';
import { MessageDialog } from '../components/messages/MessageDialog';
import { ProfileEditor } from '../components/profile/ProfileEditor';

export function ProfilePage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showMessageDialog, setShowMessageDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq(username ? 'username' : 'id', username || user?.id)
          .single();

        if (error) throw error;

        // Format dates and ensure required fields exist
        const profileData = {
          ...data,
          memberSince: new Date(data.created_at),
          dob: new Date(data.dob),
          privacy_settings: data.privacy_settings || { showConnections: true, showBio: true },
          interactions: data.interactions || { following: [], followers: [], blocked: [] }
        };

        setProfile(profileData);
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfile();
    }
  }, [username, user]);

  // Only members can view profiles
  if (!user || user.role !== 'MEMBER') {
    navigate('/dashboard');
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="text-center py-8 text-gray-600 dark:text-gray-400">
        Profile not found
      </div>
    );
  }

  const isOwnProfile = user.id === profile.id;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <ProfileHeader
        profile={profile}
        isOwnProfile={isOwnProfile}
        onMessageClick={() => setShowMessageDialog(true)}
        onEditClick={() => setIsEditing(true)}
      />

      {isEditing && (
        <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
          <ProfileEditor
            profile={profile}
            onCancel={() => setIsEditing(false)}
            onSave={async (updatedProfile) => {
              try {
                const { error } = await supabase
                  .from('profiles')
                  .update(updatedProfile)
                  .eq('id', profile.id);

                if (error) throw error;

                // Update local state
                setProfile({ ...profile, ...updatedProfile });
                setIsEditing(false);
              } catch (err) {
                console.error('Error updating profile:', err);
              }
            }}
          />
        </div>
      )}

      <ConnectionsCard 
        profile={profile}
        isOwnProfile={isOwnProfile}
      />

      {isOwnProfile && (
        <div className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800">
          <PrivacySettings profile={profile} />
        </div>
      )}

      {showMessageDialog && !isOwnProfile && (
        <MessageDialog
          recipient={profile}
          isOpen={showMessageDialog}
          onClose={() => setShowMessageDialog(false)}
        />
      )}
    </div>
  );
}