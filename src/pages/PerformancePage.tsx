import React from 'react';
import { CalorieMetricsCard } from '../components/performance/CalorieMetricsCard';
import { useAuthStore } from '../store/authStore';
import { useLocationStore } from '../store/locationStore';
import { useUserStore } from '../store/userStore';
import { Activity, TrendingUp, Users, MapPin, Calendar, Award, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const mockVisitData = [
  { date: 'Mon', visits: 5 },
  { date: 'Tue', visits: 7 },
  { date: 'Wed', visits: 4 },
  { date: 'Thu', visits: 8 },
  { date: 'Fri', visits: 6 },
  { date: 'Sat', visits: 9 },
  { date: 'Sun', visits: 3 },
];

const mockDurationData = [
  { time: '6am', duration: 45 },
  { time: '9am', duration: 60 },
  { time: '12pm', duration: 75 },
  { time: '3pm', duration: 90 },
  { time: '6pm', duration: 120 },
  { time: '9pm', duration: 45 },
];

const mockLocationData = [
  { name: 'Downtown', value: 45 },
  { name: 'Yorkville', value: 30 },
  { name: 'Liberty', value: 15 },
  { name: 'Distillery', value: 10 },
];

const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F43F5E'];

export function PerformancePage() {
  const user = useAuthStore((state) => state.user);
  const { locations } = useLocationStore();
  const userProfile = useUserStore((state) => 
    state.users.find(u => u.id === user?.id)
  );

  if (!userProfile) return null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Performance Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalorieMetricsCard />

        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Weekly Visits</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockVisitData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: 'none',
                  }}
                />
                <Bar dataKey="visits" fill="#6366F1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Duration Trends</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockDurationData}>
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
                  dataKey="duration" 
                  stroke="#6366F1" 
                  fill="#6366F1" 
                  fillOpacity={0.2} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-black p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Location Distribution</h2>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mockLocationData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {mockLocationData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    borderRadius: '8px',
                    border: 'none',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {mockLocationData.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm">{entry.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}