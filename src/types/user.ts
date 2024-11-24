import { Role } from './auth';

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string;
  role: Role;
  avatar?: string;
  memberSince: Date;
  dob: Date;
  isActive: boolean;
  bio?: string;
  privacySettings: {
    showConnections: boolean;
    showBio: boolean;
  };
  interactions: {
    following: string[];
    followers: string[];
    blocked: string[];
  };
}