import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { supabase } from '../../lib/supabase';

interface PrivacySettingsProps {
  profile: any;
}

export function PrivacySettings({ profile }: PrivacySettingsProps) {
  const toggleSetting = async (setting: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          privacy_settings: {
            ...profile.privacy_settings,
            [setting]: !profile.privacy_settings[setting],
          },
        })
        .eq('id', profile.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating privacy settings:', err);
    }
  };

  const settings = [
    { key: 'showConnections', label: 'Show Connections' },
    { key: 'showBio', label: 'Show Bio' },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Privacy Settings</h3>
      <div className="space-y-2">
        {settings.map(({ key, label }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleSetting(key)}
              className="flex items-center gap-2"
            >
              {profile.privacy_settings?.[key] ? (
                <>
                  <Eye className="w-4 h-4" />
                  Public
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4" />
                  Private
                </>
              )}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}