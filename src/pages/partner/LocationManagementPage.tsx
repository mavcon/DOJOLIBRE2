import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useLocationStore } from '../../store/locationStore';
import { useAuthStore } from '../../store/authStore';
import { LocationEditor } from '../../components/partner/LocationEditor';
import { LocationCard } from '../../components/partner/LocationCard';
import { Location } from '../../types/location';

export function LocationManagementPage() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { locations, deleteLocation } = useLocationStore();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Filter locations for this partner
  const partnerLocations = locations.filter(loc => loc.partnerId === user?.id);

  // Redirect if not partner
  if (!user || user.role !== 'PARTNER') {
    navigate('/');
    return null;
  }

  const handleDelete = (locationId: string) => {
    deleteLocation(locationId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Location Management</h1>
        <Button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add New Location
        </Button>
      </div>

      <div className="grid gap-6">
        {partnerLocations.map((location) => (
          <div key={location.id}>
            <LocationCard
              location={location}
              onEdit={() => setSelectedLocation(location)}
              onDelete={() => setShowDeleteConfirm(location.id)}
            />

            {/* Delete Confirmation */}
            <AnimatePresence>
              {showDeleteConfirm === location.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 border dark:border-gray-800 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg"
                >
                  <div className="flex items-center gap-2 text-red-600 dark:text-red-400 mb-2">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">Confirm Deletion</p>
                  </div>
                  <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                    Are you sure you want to delete this location? This action cannot be undone.
                  </p>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(location.id)}
                    >
                      Delete Location
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Location Editor Modal */}
      <AnimatePresence>
        {(selectedLocation || isCreating) && (
          <LocationEditor
            location={selectedLocation}
            isOpen={true}
            onClose={() => {
              setSelectedLocation(null);
              setIsCreating(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}