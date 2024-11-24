import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Users, Clock, Eye, EyeOff, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Location } from '../../types/location';
import { useAttendanceStore } from '../../store/attendanceStore';

interface LocationCardProps {
  location: Location;
  onEdit: () => void;
  onDelete: () => void;
}

export function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const [showMemberView, setShowMemberView] = useState(false);
  const { getCurrentAttendees, getLocationStats } = useAttendanceStore();
  
  const currentAttendees = getCurrentAttendees(location.id);
  const locationStats = getLocationStats(location.id);
  const actualOccupancy = currentAttendees.length;
  const occupancyRate = (actualOccupancy / location.capacity) * 100;

  const formatHours = (hours: Location['hours']) => {
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const groupedHours = hours.reduce((acc, slot) => {
      const timeStr = `${slot.open} - ${slot.close}`;
      const days = slot.days.map(d => dayNames[d]);
      
      if (!acc[timeStr]) {
        acc[timeStr] = [];
      }
      acc[timeStr].push(...days);
      return acc;
    }, {} as Record<string, string[]>);

    return Object.entries(groupedHours).map(([time, days]) => (
      <div key={time} className="text-sm">
        <span className="font-medium">{days.join(', ')}: </span>
        <span>{time}</span>
      </div>
    ));
  };

  if (showMemberView) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800"
      >
        <div className="relative">
          <div
            className="h-48 bg-cover bg-center"
            style={{ backgroundImage: `url(${location.imageUrl})` }}
          />
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMemberView(false)}
              className="bg-white/90 dark:bg-black/90 backdrop-blur-sm"
            >
              <Eye className="w-4 h-4 mr-2" />
              Partner View
            </Button>
          </div>
        </div>

        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">{location.name}</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <p>{location.address}</p>
            </div>

            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-gray-500" />
              <div className="flex-1">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {actualOccupancy} / {location.capacity} members
                  </span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {Math.round(occupancyRate)}% capacity
                  </span>
                </div>
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
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-gray-500 mt-1" />
              <div className="flex-1 space-y-1">
                {formatHours(location.hours)}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Amenities</h3>
              <div className="flex flex-wrap gap-2">
                {location.amenities.map((amenity) => (
                  <span
                    key={amenity}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
                  >
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800"
    >
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex gap-4">
            <div className="relative group">
              <div 
                className="w-32 h-32 bg-cover bg-center rounded-lg"
                style={{ backgroundImage: `url(${location.imageUrl})` }}
              />
              {location.imageUrl && (
                <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm">Image uploaded</p>
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{location.name}</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMemberView(true)}
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Member View
                </Button>
              </div>
              <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                <MapPin className="w-4 h-4" />
                <p>{location.address}</p>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {actualOccupancy} / {location.capacity} members
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {Math.round(occupancyRate)}% capacity
                    </span>
                  </div>
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
                </div>
              </div>
              <div className="flex items-start gap-2 mt-2">
                <Clock className="w-4 h-4 text-gray-500 mt-1" />
                <div className="flex-1 space-y-1">
                  {formatHours(location.hours)}
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onEdit}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </Button>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="font-medium mb-2">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {location.amenities.map((amenity) => (
              <span
                key={amenity}
                className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <h3 className="font-medium mb-2">Current Stats</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Visits</p>
                <p className="text-lg font-semibold">{locationStats.totalVisits}</p>
              </div>
              <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg. Duration</p>
                <p className="text-lg font-semibold">{Math.round(locationStats.averageDuration)} min</p>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Peak Hours</h4>
            <div className="flex flex-wrap gap-2">
              {locationStats.peakHours.slice(0, 3).map(({ hour, count }) => (
                <div key={hour} className="px-3 py-1 bg-gray-50 dark:bg-gray-900 rounded-full text-sm">
                  {hour}:00 ({count} visits)
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}