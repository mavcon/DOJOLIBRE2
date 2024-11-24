import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Users, Clock, Activity } from 'lucide-react';
import { Location, LocationStats } from '../../types/location';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface LocationMetricsCardProps {
  location: Location;
  stats: LocationStats;
  currentAttendees: string[];
  isExpanded: boolean;
  onToggle: () => void;
}

export function LocationMetricsCard({
  location,
  stats,
  currentAttendees,
  isExpanded,
  onToggle,
}: LocationMetricsCardProps) {
  const occupancyRate = (currentAttendees.length / location.capacity) * 100;
  
  // Generate hourly data for the current day
  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}:00`,
    occupancy: Math.floor(Math.random() * location.capacity),
  }));

  // Generate weekly data
  const weeklyData = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => ({
    day,
    visits: Math.floor(Math.random() * stats.totalVisits * 0.2),
  }));

  return (
    <motion.div
      layout
      className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800 overflow-hidden"
    >
      <div 
        className="p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
        onClick={onToggle}
      >
        <div className="flex justify-between items-start">
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">{location.name}</h3>
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {currentAttendees.length} / {location.capacity}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {stats.totalVisits} total visits
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round(stats.averageDuration)} min avg
                </span>
              </div>
            </div>
          </div>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>

        <div className="mt-4">
          <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                occupancyRate > 80
                  ? 'bg-red-500'
                  : occupancyRate > 50
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${occupancyRate}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {Math.round(occupancyRate)}% capacity
          </p>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t dark:border-gray-800"
          >
            <div className="p-6 grid grid-cols-2 gap-6">
              {/* Hourly Occupancy Chart */}
              <div>
                <h4 className="text-sm font-medium mb-4">Today's Occupancy</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hourlyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="hour" />
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
                        dataKey="occupancy"
                        stroke="#6366F1"
                        fill="#6366F1"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Weekly Visits Chart */}
              <div>
                <h4 className="text-sm font-medium mb-4">Weekly Visits</h4>
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weeklyData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                      <XAxis dataKey="day" />
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

              {/* Peak Hours */}
              <div className="col-span-2">
                <h4 className="text-sm font-medium mb-4">Peak Hours</h4>
                <div className="grid grid-cols-4 gap-4">
                  {stats.peakHours.map(({ hour, count }) => (
                    <div
                      key={hour}
                      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg"
                    >
                      <p className="text-lg font-semibold">{hour}:00</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {count} visits
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}