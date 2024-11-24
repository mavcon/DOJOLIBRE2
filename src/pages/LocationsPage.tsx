import React, { useState } from 'react';
import { useLocationStore } from '../store/locationStore';
import { GoogleMap } from '../components/locations/GoogleMap';
import { LocationCard } from '../components/locations/LocationCard';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { useAttendanceStore } from '../store/attendanceStore';

export function LocationsPage() {
  const { locations, selectedLocation, selectLocation } = useLocationStore();
  const currentUser = useAuthStore(state => state.user);
  const { checkIn, checkOut, isCheckedIn } = useAttendanceStore();
  const [processingLocationId, setProcessingLocationId] = useState<string | null>(null);

  const handleLocationSelect = (locationId: string) => {
    const location = locations.find((loc) => loc.id === locationId);
    if (location) {
      selectLocation(location);
      const element = document.getElementById(`location-${locationId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleCheckInOut = async (locationId: string) => {
    if (!currentUser || processingLocationId) return;
    
    setProcessingLocationId(locationId);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const userCheckedInHere = isCheckedIn(currentUser.id) === locationId;
      
      if (userCheckedInHere) {
        checkOut(currentUser.id, locationId, currentUser.role);
      } else {
        checkIn(currentUser.id, locationId, currentUser.role);
      }
    } finally {
      setProcessingLocationId(null);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Locations</h1>

      <div className="bg-white dark:bg-black rounded-lg shadow-md border dark:border-gray-800">
        <GoogleMap 
          locations={locations} 
          onLocationSelect={handleLocationSelect}
          onCheckInOut={handleCheckInOut}
        />
      </div>

      <motion.div 
        layout 
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {locations.map((location) => (
          <div key={location.id} id={`location-${location.id}`}>
            <LocationCard
              location={location}
              selected={selectedLocation?.id === location.id}
              onCheckInOut={handleCheckInOut}
              isProcessing={processingLocationId === location.id}
            />
          </div>
        ))}
      </motion.div>
    </div>
  );
}