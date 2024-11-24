import { create } from 'zustand';
import { AdminInvite, ChangelogEntry, Role, User } from '../types/auth';

interface AdminState {
  invites: AdminInvite[];
  changelog: ChangelogEntry[];
  createInvite: (email: string, role: Role) => Promise<void>;
  revokeInvite: (id: string) => Promise<void>;
  addChangelogEntry: (entry: Omit<ChangelogEntry, 'id' | 'timestamp'>) => void;
  getChangelog: (filters?: {
    entityType?: ChangelogEntry['entityType'];
    userId?: string;
    startDate?: Date;
    endDate?: Date;
  }) => ChangelogEntry[];
}

// Mock data
const MOCK_CHANGELOG: ChangelogEntry[] = [
  {
    id: '1',
    userId: '1',
    action: 'create',
    entityType: 'location',
    entityId: '1',
    changes: {
      name: 'Downtown Toronto Dojo',
      address: '123 Main St',
    },
    timestamp: new Date('2024-03-15T10:00:00'),
  },
  // Add more mock entries...
];

export const useAdminStore = create<AdminState>((set, get) => ({
  invites: [],
  changelog: MOCK_CHANGELOG,

  createInvite: async (email: string, role: Role) => {
    const newInvite: AdminInvite = {
      id: Date.now().toString(),
      email,
      role,
      token: Math.random().toString(36).substring(7),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      used: false,
    };

    set((state) => ({
      invites: [...state.invites, newInvite],
    }));
  },

  revokeInvite: async (id: string) => {
    set((state) => ({
      invites: state.invites.filter((invite) => invite.id !== id),
    }));
  },

  addChangelogEntry: (entry) => {
    const newEntry: ChangelogEntry = {
      id: Date.now().toString(),
      timestamp: new Date(),
      ...entry,
    };

    set((state) => ({
      changelog: [newEntry, ...state.changelog],
    }));
  },

  getChangelog: (filters) => {
    const { changelog } = get();
    if (!filters) return changelog;

    return changelog.filter((entry) => {
      if (filters.entityType && entry.entityType !== filters.entityType) return false;
      if (filters.userId && entry.userId !== filters.userId) return false;
      if (filters.startDate && entry.timestamp < filters.startDate) return false;
      if (filters.endDate && entry.timestamp > filters.endDate) return false;
      return true;
    });
  },
}));