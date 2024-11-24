import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../ui/Button';

interface ProfileEditorProps {
  profile: any;
  onCancel: () => void;
  onSave: (updatedProfile: any) => void;
}

export function ProfileEditor({ profile, onCancel, onSave }: ProfileEditorProps) {
  const [formData, setFormData] = useState({
    username: profile.username || '',
    name: profile.name || '',
    bio: profile.bio || '',
  });
  const [error, setError] = useState('');

  const validateUsername = (value: string) => {
    if (value.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (value.length > 20) {
      return 'Username must be less than 20 characters';
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      return 'Username can only contain letters, numbers, and underscores';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const usernameError = validateUsername(formData.username);
    if (usernameError) {
      setError(usernameError);
      return;
    }

    onSave({
      username: formData.username,
      name: formData.name,
      bio: formData.bio,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Username
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => {
            setFormData({ ...formData, username: e.target.value });
            setError('');
          }}
          className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
            <AlertCircle className="w-4 h-4" />
            {error}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Display Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Bio
        </label>
        <textarea
          value={formData.bio}
          onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Save Changes
        </Button>
      </div>
    </form>
  );
}