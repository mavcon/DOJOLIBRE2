import { Location } from './location';
import { UserProfile } from './user';

export interface AttendanceRecord {
  id: string;
  userId: string;
  locationId: string;
  checkInTime: Date;
  checkOutTime?: Date;
  duration?: number; // in minutes
}

export interface LocationAttendance {
  locationId: string;
  currentAttendees: string[]; // array of user IDs
  history: AttendanceRecord[];
}

export interface AttendanceStats {
  totalVisits: number;
  averageDuration: number;
  peakHours: { hour: number; count: number }[];
  popularDays: { day: number; count: number }[];
  currentStreak: number;
}