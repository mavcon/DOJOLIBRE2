import { create } from 'zustand';
import { AttendanceRecord, LocationAttendance, AttendanceStats } from '../types/attendance';
import { Role } from '../types/auth';

interface AttendanceState {
  records: Record<string, LocationAttendance>;
  checkIn: (userId: string, locationId: string, userRole: Role) => void;
  checkOut: (userId: string, locationId: string, userRole: Role) => void;
  getCurrentAttendees: (locationId: string) => string[];
  getUserStats: (userId: string) => AttendanceStats;
  getLocationStats: (locationId: string) => AttendanceStats;
  isCheckedIn: (userId: string) => string | null;
}

// Initial mock data
const MOCK_RECORDS: Record<string, LocationAttendance> = {
  '1': {
    locationId: '1',
    currentAttendees: ['1'], // Only member@dojo.com is checked in
    history: [
      {
        id: '1-1-1',
        userId: '1',
        locationId: '1',
        checkInTime: new Date(),
      },
    ],
  },
};

export const useAttendanceStore = create<AttendanceState>((set, get) => ({
  records: MOCK_RECORDS,

  checkIn: (userId: string, locationId: string, userRole: Role) => {
    // Only allow members to check in
    if (userRole !== 'MEMBER') return;

    // Check if user is already checked in somewhere
    const currentLocation = get().isCheckedIn(userId);
    if (currentLocation) {
      get().checkOut(userId, currentLocation, userRole);
    }

    set((state) => {
      const locationAttendance = state.records[locationId] || {
        locationId,
        currentAttendees: [],
        history: [],
      };

      // Only check in if not already present
      if (!locationAttendance.currentAttendees.includes(userId)) {
        const newRecord: AttendanceRecord = {
          id: `${userId}-${locationId}-${Date.now()}`,
          userId,
          locationId,
          checkInTime: new Date(),
        };

        return {
          records: {
            ...state.records,
            [locationId]: {
              ...locationAttendance,
              currentAttendees: [...locationAttendance.currentAttendees, userId],
              history: [...locationAttendance.history, newRecord],
            },
          },
        };
      }
      return state;
    });
  },

  checkOut: (userId: string, locationId: string, userRole: Role) => {
    // Only allow members to check out
    if (userRole !== 'MEMBER') return;

    set((state) => {
      const locationAttendance = state.records[locationId];
      if (!locationAttendance) return state;

      const currentRecord = locationAttendance.history.find(
        record => record.userId === userId && !record.checkOutTime
      );

      if (currentRecord) {
        const checkOutTime = new Date();
        const duration = Math.round(
          (checkOutTime.getTime() - currentRecord.checkInTime.getTime()) / 60000
        );

        const updatedHistory = locationAttendance.history.map(record =>
          record.id === currentRecord.id
            ? { ...record, checkOutTime, duration }
            : record
        );

        return {
          records: {
            ...state.records,
            [locationId]: {
              ...locationAttendance,
              currentAttendees: locationAttendance.currentAttendees.filter(
                id => id !== userId
              ),
              history: updatedHistory,
            },
          },
        };
      }
      return state;
    });
  },

  getCurrentAttendees: (locationId: string) => {
    const locationAttendance = get().records[locationId];
    return locationAttendance?.currentAttendees || [];
  },

  isCheckedIn: (userId: string) => {
    const allLocations = Object.values(get().records);
    const checkedInLocation = allLocations.find(location =>
      location.currentAttendees.includes(userId)
    );
    return checkedInLocation ? checkedInLocation.locationId : null;
  },

  getUserStats: (userId: string) => {
    const allRecords = Object.values(get().records)
      .flatMap(loc => loc.history)
      .filter(record => record.userId === userId);

    const completedVisits = allRecords.filter(record => record.checkOutTime);

    return {
      totalVisits: allRecords.length,
      averageDuration: completedVisits.reduce((acc, record) => acc + (record.duration || 0), 0) / completedVisits.length || 0,
      peakHours: calculatePeakHours(allRecords),
      popularDays: calculatePopularDays(allRecords),
      currentStreak: calculateStreak(allRecords),
    };
  },

  getLocationStats: (locationId: string) => {
    const locationAttendance = get().records[locationId];
    if (!locationAttendance) {
      return {
        totalVisits: 0,
        averageDuration: 0,
        peakHours: [],
        popularDays: [],
        currentStreak: 0,
      };
    }

    const completedVisits = locationAttendance.history.filter(
      record => record.checkOutTime
    );

    return {
      totalVisits: locationAttendance.history.length,
      averageDuration: completedVisits.reduce((acc, record) => acc + (record.duration || 0), 0) / completedVisits.length || 0,
      peakHours: calculatePeakHours(locationAttendance.history),
      popularDays: calculatePopularDays(locationAttendance.history),
      currentStreak: 0, // Not applicable for locations
    };
  },
}));

// Helper functions
function calculatePeakHours(records: AttendanceRecord[]): { hour: number; count: number }[] {
  const hourCounts = new Array(24).fill(0);
  records.forEach(record => {
    const hour = new Date(record.checkInTime).getHours();
    hourCounts[hour]++;
  });

  return hourCounts
    .map((count, hour) => ({ hour, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
}

function calculatePopularDays(records: AttendanceRecord[]): { day: number; count: number }[] {
  const dayCounts = new Array(7).fill(0);
  records.forEach(record => {
    const day = new Date(record.checkInTime).getDay();
    dayCounts[day]++;
  });

  return dayCounts
    .map((count, day) => ({ day, count }))
    .sort((a, b) => b.count - a.count);
}

function calculateStreak(records: AttendanceRecord[]): number {
  if (records.length === 0) return 0;

  const dates = records
    .map(record => new Date(record.checkInTime).toDateString())
    .sort()
    .reverse();

  let streak = 1;
  const today = new Date().toDateString();
  const lastVisit = new Date(dates[0]).toDateString();

  // If last visit wasn't today or yesterday, streak is broken
  if (lastVisit !== today && lastVisit !== new Date(Date.now() - 86400000).toDateString()) {
    return 0;
  }

  for (let i = 0; i < dates.length - 1; i++) {
    const current = new Date(dates[i]);
    const next = new Date(dates[i + 1]);
    const diffDays = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}