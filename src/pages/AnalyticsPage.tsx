import React from 'react';
import { useLocationStore } from '../store/locationStore';
import { Users, Clock, BarChart2, RepeatIcon } from 'lucide-react';

export function AnalyticsPage() {
  const { locations, stats } = useLocationStore();

  const totalVisits = Object.values(stats).reduce(
    (sum, stat) => sum + stat.totalVisits,
    0
  );

  const averageDuration = Object.values(stats).reduce(
    (sum, stat) => sum + stat.averageDuration,
    0
  ) / Object.values(stats).length;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Total Visits</h3>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">{totalVisits}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Avg. Duration</h3>
            <Clock className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">{Math.round(averageDuration)} min</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Peak Hours</h3>
            <BarChart2 className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">17:00</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Repeat Visitors</h3>
            <RepeatIcon className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">68%</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Location Performance</h2>
        <div className="space-y-4">
          {locations.map((location) => {
            const locationStats = stats[location.id];
            if (!locationStats) return null;

            return (
              <div
                key={location.id}
                className="border-b last:border-b-0 pb-4 last:pb-0"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">{location.name}</h3>
                  <span className="text-sm text-gray-600">
                    {locationStats.totalVisits} visits
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full"
                    style={{
                      width: `${(locationStats.currentOccupancy / location.capacity) * 100}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}