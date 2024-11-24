import { Role } from './auth';

export interface Location {
  id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  amenities: ('Showers' | 'Lockers' | 'Washrooms' | 'Changerooms')[];
  hours: LocationHours[];
  capacity: number;
  currentOccupancy: number;
  partnerId: string;
  imageUrl: string;
  createdBy: {
    id: string;
    role: Role;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface LocationHours {
  open: string;
  close: string;
  days: number[]; // 0-6 for Sunday-Saturday
}

export interface LocationStats {
  totalVisits: number;
  peakHours: { hour: number; count: number }[];
  repeatVisitors: number;
  averageDuration: number;
  revenue?: number; // Only available for location owners
}

export interface LocationFilters {
  partnerId?: string;
  createdById?: string;
  creatorRole?: Role;
}