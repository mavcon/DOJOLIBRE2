import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Users } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLocationStore } from '../../store/locationStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { Location } from '../../types/location';
import { LocationEditor } from '../../components/partner/LocationEditor';

export function AdminLocationsPage() {
  const { locations, stats } = useLocationStore();
  const { getCurrentAttendees } = useAttendanceStore();
  const [search, setSearch] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(search.toLowerCase()) ||
    location.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Location Management</h1>
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredLocations.map((location) => {
          const currentAttendees = getCurrentAttendees(location.id);
          const locationStats = stats[location.id];

          return (
            <motion.div
              key={location.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-black rounded-lg shadow-md p-6 border dark:border-gray-800"
            >
              <div className="flex justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{location.name}</h2>
                  <div className="flex items-center gap-2 mt-1 text-gray-600 dark:text-gray-400">
                    <MapPin className="w-4 h-4" />
                    {location.address}
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedLocation(location)}
                >
                  Edit
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-6 mt-6">
                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium">Current Occupancy</h3>
                  </div>
                  <p className="text-2xl font-bold">
                    {currentAttendees.length} / {location.capacity}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {Math.round((currentAttendees.length / location.capacity) * 100)}% capacity
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-medium mb-2">Total Visits</h3>
                  <p className="text-2xl font-bold">{locationStats?.totalVisits || 0}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    All time
                  </p>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <h3 className="font-medium mb-2">Average Duration</h3>
                  <p className="text-2xl font-bold">
                    {Math.round(locationStats?.averageDuration || 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    minutes per visit
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {selectedLocation && (
        <LocationEditor
          location={selectedLocation}
          isOpen={true}
          onClose={() => setSelectedLocation(null)}
        />
      )}
    </div>
  );
}