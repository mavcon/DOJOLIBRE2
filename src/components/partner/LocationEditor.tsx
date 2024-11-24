import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Minus, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Location, LocationHours } from '../../types/location';
import { useLocationStore } from '../../store/locationStore';
import { useAuthStore } from '../../store/authStore';
import { mapsLoader } from '../../lib/maps';

interface LocationEditorProps {
  location: Location | null;
  isOpen: boolean;
  onClose: () => void;
}

export function LocationEditor({ location, isOpen, onClose }: LocationEditorProps) {
  const { addLocation, updateLocation } = useLocationStore();
  const currentUser = useAuthStore(state => state.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const [formData, setFormData] = useState<Partial<Location>>({
    name: '',
    address: '',
    coordinates: [43.6532, -79.3832],
    amenities: [],
    hours: [
      {
        open: '09:00',
        close: '17:00',
        days: [1, 2, 3, 4, 5],
      },
    ],
    capacity: 50,
    currentOccupancy: 0,
    partnerId: currentUser?.id || '',
    imageUrl: '',
  });

  const [addressInput, setAddressInput] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (location) {
      setFormData(location);
      setAddressInput(location.address);
      setImagePreview(location.imageUrl);
    }
  }, [location]);

  useEffect(() => {
    let mounted = true;

    const initAutocomplete = async () => {
      try {
        await mapsLoader.load();
        const input = document.getElementById('address-input') as HTMLInputElement;
        if (input && mounted) {
          const autocompleteInstance = new google.maps.places.Autocomplete(input, {
            types: ['address'],
          });
          setAutocomplete(autocompleteInstance);

          autocompleteInstance.addListener('place_changed', () => {
            const place = autocompleteInstance.getPlace();
            if (place.geometry?.location) {
              setFormData(prev => ({
                ...prev,
                address: place.formatted_address || '',
                coordinates: [
                  place.geometry.location.lat(),
                  place.geometry.location.lng(),
                ],
              }));
            }
          });
        }
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initAutocomplete();

    return () => {
      mounted = false;
    };
  }, []);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setImagePreview(imageUrl);
      setFormData(prev => ({ ...prev, imageUrl }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 2000);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.imageUrl) {
      return;
    }

    const locationData = {
      ...formData,
      createdBy: {
        id: currentUser?.id || '',
        role: currentUser?.role || 'PARTNER',
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Location;

    if (location) {
      updateLocation(location.id, locationData);
    } else {
      addLocation(locationData);
    }
    onClose();
  };

  const addTimeSlot = () => {
    setFormData(prev => ({
      ...prev,
      hours: [
        ...(prev.hours || []),
        {
          open: '09:00',
          close: '17:00',
          days: [1, 2, 3, 4, 5],
        },
      ],
    }));
  };

  const removeTimeSlot = (index: number) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours?.filter((_, i) => i !== index),
    }));
  };

  const updateTimeSlot = (index: number, field: keyof LocationHours, value: any) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours?.map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      ),
    }));
  };

  const handleDayToggle = (slotIndex: number, day: number) => {
    setFormData(prev => ({
      ...prev,
      hours: prev.hours?.map((slot, i) =>
        i === slotIndex
          ? {
              ...slot,
              days: slot.days.includes(day)
                ? slot.days.filter(d => d !== day)
                : [...slot.days, day].sort(),
            }
          : slot
      ),
    }));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.9 }}
        className="relative bg-white dark:bg-black rounded-lg shadow-xl w-full max-w-2xl my-4 border dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex justify-between items-center p-6 border-b dark:border-gray-800 bg-white dark:bg-black rounded-t-lg">
          <h2 className="text-xl font-semibold">
            {location ? 'Edit Location' : 'Add New Location'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Address</label>
              <input
                id="address-input"
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                placeholder="Start typing to search..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                min="1"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Image</label>
              <div className="relative">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                {imagePreview ? (
                  <div className="relative group">
                    <img
                      src={imagePreview}
                      alt="Location preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div 
                      className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                    {uploadSuccess && (
                      <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                        Uploaded!
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-48 flex flex-col items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <ImageIcon className="w-8 h-8" />
                    <span>Click to upload image</span>
                  </Button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Amenities</label>
              <div className="space-y-2">
                {['Showers', 'Lockers', 'Washrooms', 'Changerooms'].map((amenity) => (
                  <label key={amenity} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.amenities?.includes(amenity)}
                      onChange={(e) => {
                        const amenities = e.target.checked
                          ? [...(formData.amenities || []), amenity]
                          : (formData.amenities || []).filter((a) => a !== amenity);
                        setFormData({ ...formData, amenities });
                      }}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium">Hours</label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTimeSlot}
                  className="flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  Add Time Slot
                </Button>
              </div>
              <div className="space-y-4">
                {formData.hours?.map((slot, index) => (
                  <div key={index} className="p-4 border dark:border-gray-800 rounded-lg">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Open</label>
                          <input
                            type="time"
                            value={slot.open}
                            onChange={(e) => updateTimeSlot(index, 'open', e.target.value)}
                            className="px-2 py-1 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Close</label>
                          <input
                            type="time"
                            value={slot.close}
                            onChange={(e) => updateTimeSlot(index, 'close', e.target.value)}
                            className="px-2 py-1 border dark:border-gray-800 rounded-md bg-white dark:bg-black"
                            required
                          />
                        </div>
                      </div>
                      {formData.hours!.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                        >
                          <Minus className="w-4 h-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Days</label>
                      <div className="flex flex-wrap gap-2">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(index, i)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              slot.days.includes(i)
                                ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="sticky bottom-0 pt-6 mt-6 border-t dark:border-gray-800 bg-white dark:bg-black">
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit">
                  {location ? 'Update Location' : 'Add Location'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}