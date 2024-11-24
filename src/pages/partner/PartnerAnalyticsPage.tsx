// Previous content with added filtering and sorting options
import React, { useState } from 'react';
import { useLocationStore } from '../../store/locationStore';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Users, Clock, TrendingUp, Activity, Filter, SortAsc } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { LocationMetricsCard } from '../../components/partner/LocationMetricsCard';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

type SortOption = 'visits' | 'duration' | 'occupancy';
type TimeRange = 'day' | 'week' | 'month' | 'year';

export function PartnerAnalyticsPage() {
  const { locations, stats } = useLocationStore();
  const { getCurrentAttendees } = useAttendanceStore();
  const currentUser = useAuthStore(state => state.user);
  const [sortBy, setSortBy] = useState<SortOption>('visits');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);

  if (!currentUser) return null;

  // Filter locations for this partner
  const partnerLocations = locations.filter(loc => loc.partnerId === currentUser.id);

  // Sort locations based on selected metric
  const sortedLocations = [...partnerLocations].sort((a, b) => {
    switch (sortBy) {
      case 'visits':
        return (stats[b.id]?.totalVisits || 0) - (stats[a.id]?.totalVisits || 0);
      case 'duration':
        return (stats[b.id]?.averageDuration || 0) - (stats[a.id]?.averageDuration || 0);
      case 'occupancy':
        return (b.currentOccupancy / b.capacity) - (a.currentOccupancy / a.capacity);
      default:
        return 0;
    }
  });

  // Calculate total metrics
  const totalVisits = partnerLocations.reduce((sum, loc) => 
    sum + (stats[loc.id]?.totalVisits || 0), 0
  );

  const averageDuration = partnerLocations.reduce((sum, loc) => 
    sum + (stats[loc.id]?.averageDuration || 0), 0
  ) / partnerLocations.length;

  const currentOccupancy = partnerLocations.reduce((sum, loc) => 
    sum + loc.currentOccupancy, 0
  );

  const totalCapacity = partnerLocations.reduce((sum, loc) => 
    sum + loc.capacity, 0
  );

  // Generate time-based data
  const getTimeRangeData = () => {
    switch (timeRange) {
      case 'day':
        return Array.from({ length: 24 }, (_, i) => ({
          time: `${i}:00`,
          visits: Math.floor(Math.random() * 50),
        }));
      case 'week':
        return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
          time: day,
          visits: Math.floor(Math.random() * 200),
        }));
      case 'month':
        return Array.from({ length: 30 }, (_, i) => ({
          time: i + 1,
          visits: Math.floor(Math.random() * 300),
        }));
      case 'year':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(month => ({
          time: month,
          visits: Math.floor(Math.random() * 1000),
        }));
    }
  };

  const timeRangeData = getTimeRangeData();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
        <div className="flex gap-4">
          <div className="flex gap-2">
            {(['day', 'week', 'month', 'year'] as TimeRange[]).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                onClick={() => setTimeRange(range)}
                size="sm"
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </Button>
            ))}
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="px-3 py-1 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
          >
            <option value="visits">Sort by Visits</option>
            <option value="duration">Sort by Duration</option>
            <option value="occupancy">Sort by Occupancy</option>
          </select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ... Previous overview cards ... */}
      </div>

      {/* Time-based Chart */}
      <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md border dark:border-gray-800">
        <h2 className="text-lg font-semibold mb-4">Visits Over Time</h2>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeRangeData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: 'none',
                }}
              />
              <Area
                type="monotone"
                dataKey="visits"
                stroke="#6366F1"
                fill="#6366F1"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Location Metrics */}
      <div className="grid gap-6">
        {sortedLocations.map((location) => (
          <LocationMetricsCard
            key={location.id}
            location={location}
            stats={stats[location.id]}
            currentAttendees={getCurrentAttendees(location.id)}
            isExpanded={selectedLocation === location.id}
            onToggle={() => setSelectedLocation(
              selectedLocation === location.id ? null : location.id
            )}
          />
        ))}
      </div>
    </div>
  );
}