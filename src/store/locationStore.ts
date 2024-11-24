import { create } from 'zustand';
import { Location, LocationStats, LocationFilters } from '../types/location';
import { Role } from '../types/auth';

interface LocationState {
  locations: Location[];
  selectedLocation: Location | null;
  stats: Record<string, LocationStats>;
  setLocations: (locations: Location[]) => void;
  addLocation: (location: Omit<Location, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateLocation: (id: string, location: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  selectLocation: (location: Location | null) => void;
  getFilteredLocations: (filters: LocationFilters) => Location[];
  getLocationStats: (locationId: string, userId: string, role: Role) => LocationStats | null;
}

// Initial mock data for development
const MOCK_LOCATIONS: Location[] = [
  {
    id: '1',
    name: 'Downtown Toronto Dojo',
    address: '317 Dundas St W, Toronto, ON M5T 1G4',
    coordinates: [43.6536, -79.3928],
    amenities: ['Showers', 'Lockers', 'Washrooms', 'Changerooms'],
    hours: [
      {
        open: '06:00',
        close: '12:00',
        days: [1, 2, 3, 4, 5],
      },
      {
        open: '14:00',
        close: '22:00',
        days: [1, 2, 3, 4, 5],
      },
      {
        open: '08:00',
        close: '20:00',
        days: [6, 0],
      },
    ],
    capacity: 75,
    currentOccupancy: 45,
    partnerId: '2', // partner@dojo.com user ID
    imageUrl: 'https://images.unsplash.com/photo-1545389336-cf090694435e?auto=format&fit=crop&q=80&w=800&h=600',
    createdBy: {
      id: '2',
      role: 'PARTNER'
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  // ... other locations with similar structure
];

const MOCK_STATS: Record<string, LocationStats> = {
  '1': {
    totalVisits: 2450,
    peakHours: [
      { hour: 9, count: 65 },
      { hour: 17, count: 72 },
    ],
    repeatVisitors: 620,
    averageDuration: 95,
    revenue: 24500, // Only visible to location owner
  },
  // ... other stats
};

export const useLocationStore = create<LocationState>((set, get) => ({
  locations: MOCK_LOCATIONS,
  selectedLocation: null,
  stats: MOCK_STATS,

  setLocations: (locations) => set({ locations }),

  addLocation: (locationData) => {
    const newLocation: Location = {
      ...locationData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      locations: [...state.locations, newLocation],
    }));
  },

  updateLocation: (id, updatedData) =>
    set((state) => ({
      locations: state.locations.map((loc) =>
        loc.id === id
          ? {
              ...loc,
              ...updatedData,
              updatedAt: new Date(),
            }
          : loc
      ),
    })),

  deleteLocation: (id) =>
    set((state) => ({
      locations: state.locations.filter((loc) => loc.id !== id),
    })),

  selectLocation: (location) => set({ selectedLocation: location }),

  getFilteredLocations: (filters) => {
    const { locations } = get();
    return locations.filter((location) => {
      if (filters.partnerId && location.partnerId !== filters.partnerId) return false;
      if (filters.createdById && location.createdBy.id !== filters.createdById) return false;
      if (filters.creatorRole && location.createdBy.role !== filters.creatorRole) return false;
      return true;
    });
  },

  getLocationStats: (locationId, userId, role) => {
    const location = get().locations.find(loc => loc.id === locationId);
    const stats = get().stats[locationId];

    if (!location || !stats) return null;

    // Only return revenue data if user is the location owner or an admin/superadmin
    if (
      location.createdBy.id !== userId && 
      role !== 'ADMIN' && 
      role !== 'SUPER_ADMIN'
    ) {
      const { revenue, ...publicStats } = stats;
      return publicStats;
    }

    return stats;
  },
}));