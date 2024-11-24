import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Users, Clock } from 'lucide-react';
import { Location } from '../../types/location';
import { useAttendanceStore } from '../../store/attendanceStore';
import { useAuthStore } from '../../store/authStore';
import { MemberList } from './MemberList';
import { CheckInOutButton } from '../shared/CheckInOutButton';

interface LocationCardProps {
  location: Location;
  selected?: boolean;
  onCheckInOut: (locationId: string) => void;
  isProcessing: boolean;
}

export function LocationCard({ location, selected, onCheckInOut, isProcessing }: LocationCardProps) {
  const [showMembers, setShowMembers] = useState(false);
  const { getCurrentAttendees } = useAttendanceStore();
  const currentUser = useAuthStore(state => state.user);
  
  const currentAttendees = getCurrentAttendees(location.id);
  const actualOccupancy = currentAttendees.length;
  const occupancyRate = (actualOccupancy / location.capacity) * 100;

  // Only show member list toggle for members
  const canViewMembers = currentUser?.role === 'MEMBER';

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className={`bg-white dark:bg-black rounded-lg shadow-md overflow-hidden border dark:border-gray-800 ${
        selected ? 'ring-2 ring-indigo-500' : ''
      }`}
    >
      <div className="relative">
        <div
          className="h-48 bg-cover bg-center"
          style={{ backgroundImage: `url(${location.imageUrl})` }}
        />
        <div className="absolute top-4 right-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              occupancyRate >= 100
                ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                : 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            }`}
          >
            {occupancyRate >= 100 ? 'At Capacity' : 'Available'}
          </span>
        </div>
      </div>

      <div className="p-4 border-b dark:border-gray-800">
        <CheckInOutButton
          locationId={location.id}
          isProcessing={isProcessing}
          onCheckInOut={onCheckInOut}
          variant="bubble"
        />
      </div>

      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-semibold">{location.name}</h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mt-1">
              <MapPin className="w-4 h-4 mr-1" />
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  location.address
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {location.address}
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-4">
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

          {canViewMembers && (
            <div>
              <button
                onClick={() => setShowMembers(!showMembers)}
                className="text-sm text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                {showMembers ? 'Hide Members' : 'Show Members'}
              </button>
              <AnimatePresence>
                {showMembers && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <MemberList 
                      memberIds={currentAttendees}
                      onMessageClick={() => {}}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex items-start gap-2">
            <Clock className="w-4 h-4 text-gray-500 mt-1" />
            <div className="flex-1 space-y-1">
              {formatHours(location.hours)}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Amenities</h4>
            <div className="flex flex-wrap gap-2">
              {location.amenities.map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
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