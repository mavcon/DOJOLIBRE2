import React, { useEffect, useRef, useState } from 'react';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Location } from '../../types/location';
import { MapPin } from 'lucide-react';

interface MapProps {
  locations: Location[];
  onLocationSelect: (locationId: string) => void;
}

function Map({ locations, onLocationSelect }: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    // Center map on the first location or default to Toronto
    const center = locations[0]
      ? { lat: locations[0].coordinates[0], lng: locations[0].coordinates[1] }
      : { lat: 43.6532, lng: -79.3832 };

    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center,
      zoom: 12,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }],
        },
      ],
    });

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each location
    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: {
          lat: location.coordinates[0],
          lng: location.coordinates[1],
        },
        map: mapInstanceRef.current,
        title: location.name,
        animation: google.maps.Animation.DROP,
      });

      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-2">
            <h3 class="font-semibold">${location.name}</h3>
            <p class="text-sm text-gray-600">${location.address}</p>
            <p class="text-sm mt-1">
              ${location.currentOccupancy}/${location.capacity} members
            </p>
          </div>
        `,
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
        onLocationSelect(location.id);
      });

      markersRef.current.push(marker);
    });
  }, [locations, onLocationSelect]);

  return <div ref={mapRef} className="w-full h-[400px] rounded-lg" />;
}

export function LocationMap(props: MapProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    console.error('Google Maps API key is not configured');
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        <p>Map configuration is incomplete. Please check the environment variables.</p>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} libraries={['places']}>
      <Map {...props} />
    </Wrapper>
  );
}