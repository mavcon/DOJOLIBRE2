import { create } from 'zustand';
import { UserProfile, UserFilters } from '../types/user';
import { Role } from '../types/auth';

// Mock users for development - Include partner users
const MOCK_USERS: UserProfile[] = [
  {
    id: '1',
    email: 'member@dojo.com',
    username: 'member',
    name: 'Demo Member',
    role: 'MEMBER',
    memberSince: new Date(),
    dob: new Date('1990-05-15'),
    isActive: true,
    totalVisits: 25,
    checkInStreak: 2,
    lastCheckIn: new Date('2024-03-15'),
    membershipStatus: 'active',
    subscriptionTier: 'basic',
    bio: 'Fitness enthusiast',
    privacySettings: {
      showConnections: true,
    },
    interactions: {
      following: [],
      followers: [],
      blocked: [],
    },
  },
  {
    id: '2',
    email: 'partner@dojo.com',
    username: 'partner',
    name: 'Demo Partner',
    role: 'PARTNER',
    memberSince: new Date('2024-01-01'),
    dob: new Date('1985-03-15'),
    isActive: true,
    totalVisits: 0,
    checkInStreak: 0,
    lastCheckIn: null,
    membershipStatus: 'active',
    subscriptionTier: 'premium',
    bio: 'Downtown Toronto Dojo Owner',
    privacySettings: {
      showConnections: false,
    },
    interactions: {
      following: [],
      followers: [],
      blocked: [],
    },
    partnerInfo: {
      businessName: 'Downtown Toronto Dojo',
      businessAddress: '317 Dundas St W, Toronto, ON M5T 1G4',
      phone: '(416) 555-0123',
      verified: true,
    },
  },
  // Add more mock users...
];

interface UserState {
  users: UserProfile[];
  filters: UserFilters;
  setFilters: (filters: UserFilters) => void;
  addUser: (user: UserProfile) => void;
  updateUser: (id: string, user: Partial<UserProfile>) => void;
  deleteUser: (id: string) => void;
  followUser: (followerId: string, targetId: string) => void;
  unfollowUser: (followerId: string, targetId: string) => void;
  blockUser: (userId: string, targetId: string) => void;
  unblockUser: (userId: string, targetId: string) => void;
  getMemberUsers: () => UserProfile[];
  getPartnerUsers: () => UserProfile[];
}

export const useUserStore = create<UserState>((set, get) => ({
  users: MOCK_USERS,
  filters: { status: 'active' },
  
  setFilters: (filters) => set({ filters }),
  
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  
  updateUser: (id, updatedUser) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updatedUser } : user
      ),
    })),
  
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),

  followUser: (followerId: string, targetId: string) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.id === targetId) {
          return {
            ...user,
            interactions: {
              ...user.interactions,
              followers: [...user.interactions.followers, followerId],
            },
          };
        }
        if (user.id === followerId) {
          return {
            ...user,
            interactions: {
              ...user.interactions,
              following: [...user.interactions.following, targetId],
            },
          };
        }
        return user;
      }),
    })),

  unfollowUser: (followerId: string, targetId: string) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.id === targetId) {
          return {
            ...user,
            interactions: {
              ...user.interactions,
              followers: user.interactions.followers.filter(id => id !== followerId),
            },
          };
        }
        if (user.id === followerId) {
          return {
            ...user,
            interactions: {
              ...user.interactions,
              following: user.interactions.following.filter(id => id !== targetId),
            },
          };
        }
        return user;
      }),
    })),

  blockUser: (userId: string, targetId: string) =>
    set((state) => ({
      users: state.users.map((user) => {
        if (user.id === userId) {
          const newFollowing = user.interactions.following.filter(id => id !== targetId);
          return {
            ...user,
            interactions: {
              ...user.interactions,
              following: newFollowing,
              blocked: [...user.interactions.blocked, targetId],
            },
          };
        }
        if (user.id === targetId) {
          return {
            ...user,
            interactions: {
              ...user.interactions,
              followers: user.interactions.followers.filter(id => id !== userId),
            },
          };
        }
        return user;
      }),
    })),

  unblockUser: (userId: string, targetId: string) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === userId
          ? {
              ...user,
              interactions: {
                ...user.interactions,
                blocked: user.interactions.blocked.filter(id => id !== targetId),
              },
            }
          : user
      ),
    })),

  // Get only member users for social interactions
  getMemberUsers: () => {
    return get().users.filter(user => user.role === 'MEMBER');
  },

  // Get only partner users for admin management
  getPartnerUsers: () => {
    return get().users.filter(user => user.role === 'PARTNER');
  },
}));