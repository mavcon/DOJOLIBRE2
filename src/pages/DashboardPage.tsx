import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { Activity, TrendingUp, Users, MapPin } from 'lucide-react';

export function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { locations, stats } = useLocationStore();
  const { users } = useUserStore();

  const totalVisits = Object.values(stats).reduce(
    (sum, stat) => sum + stat.totalVisits,
    0
  );

  const activeUsers = users.filter((u) => u.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back, {user?.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Total Visits</h3>
            <Activity className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">{totalVisits}</p>
          <p className="text-sm text-gray-500 mt-2">+12% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Active Users</h3>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">{activeUsers}</p>
          <p className="text-sm text-gray-500 mt-2">+5% from last month</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Locations</h3>
            <MapPin className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">{locations.length}</p>
          <p className="text-sm text-gray-500 mt-2">Across 3 cities</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600">Growth Rate</h3>
            <TrendingUp className="w-5 h-5 text-indigo-600" />
          </div>
          <p className="text-2xl font-bold">15%</p>
          <p className="text-sm text-gray-500 mt-2">Month over month</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {users.slice(0, 5).map((user) => (
              <div key={user.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                    <span className="text-indigo-600 font-medium">
                      {user.name[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-500">
                      Checked in at {user.favoriteLocation}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {user.lastCheckIn?.toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4">Location Overview</h2>
          <div className="space-y-4">
            {locations.map((location) => (
              <div key={location.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{location.name}</p>
                  <p className="text-sm text-gray-500">
                    {location.currentOccupancy} / {location.capacity} capacity
                  </p>
                </div>
                <div className="w-32">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{
                        width: `${(location.currentOccupancy / location.capacity) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}