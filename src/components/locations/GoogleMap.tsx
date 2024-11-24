import React, { useEffect, useRef, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { Wrapper } from '@googlemaps/react-wrapper';
import { Location } from '../../types/location';
import { useAuthStore } from '../../store/authStore';
import { useAttendanceStore } from '../../store/attendanceStore';
import { CheckInOutButton } from '../shared/CheckInOutButton';

interface MapComponentProps {
  locations: Location[];
  onLocationSelect: (locationId: string) => void;
  onCheckInOut: (locationId: string) => void;
}

function MapComponent({ locations, onLocationSelect, onCheckInOut }: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);

  const currentUser = useAuthStore(state => state.user);
  const { getCurrentAttendees } = useAttendanceStore();

  // Add user location functionality
  const getUserLocation = useCallback(() => {
    if (!mapInstanceRef.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Center map on user location if no locations are provided
          if (locations.length === 0) {
            mapInstanceRef.current?.setCenter(userLocation);
          }

          // Update or create user marker
          if (userMarkerRef.current) {
            userMarkerRef.current.setPosition(userLocation);
          } else {
            userMarkerRef.current = new google.maps.Marker({
              position: userLocation,
              map: mapInstanceRef.current,
              title: 'Your Location',
              icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 8,
                fillColor: '#10B981',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#FFFFFF',
              },
              zIndex: 999, // Ensure user marker stays on top
            });

            // Add info window for user marker
            const userInfoWindow = new google.maps.InfoWindow({
              content: '<div class="p-2 text-sm font-medium">Your Location</div>',
            });

            userMarkerRef.current.addListener('mouseover', () => {
              userInfoWindow.open(mapInstanceRef.current, userMarkerRef.current);
            });

            userMarkerRef.current.addListener('mouseout', () => {
              userInfoWindow.close();
            });
          }
        },
        (error) => {
          console.error('Error getting user location:', error);
        }
      );
    }
  }, [locations]);

  const createInfoContent = useCallback((location: Location) => {
    const currentAttendees = getCurrentAttendees(location.id);
    const actualOccupancy = currentAttendees.length;
    const capacityPercentage = (actualOccupancy / location.capacity) * 100;
    const capacityColor = 
      capacityPercentage > 80 ? '#EF4444' : 
      capacityPercentage > 50 ? '#F59E0B' : 
      '#10B981';

    const div = document.createElement('div');
    div.className = 'location-info-window';
    div.innerHTML = `
      <div class="location-name">${location.name}</div>
      <div class="location-address">
        <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.address)}" target="_blank">
          ${location.address}
        </a>
      </div>
      <div class="location-stats">
        <span>${actualOccupancy}/${location.capacity} members</span>
        <span>${location.hours[0].open} - ${location.hours[0].close}</span>
      </div>
      <div class="capacity-bar">
        <div class="capacity-fill" style="
          width: ${capacityPercentage}%;
          background-color: ${capacityColor};
        "></div>
      </div>
      <div id="check-in-button-container-${location.id}"></div>
    `;

    const buttonContainer = div.querySelector(`#check-in-button-container-${location.id}`);
    if (buttonContainer) {
      const root = document.createElement('div');
      buttonContainer.appendChild(root);
      
      const button = React.createElement(CheckInOutButton, {
        locationId: location.id,
        isProcessing: false,
        onCheckInOut: (id) => {
          onCheckInOut(id);
          if (infoWindowRef.current) {
            const newContent = createInfoContent(location);
            infoWindowRef.current.setContent(newContent);
          }
        },
        variant: 'bubble'
      });
      
      createRoot(root).render(button);
    }

    return div;
  }, [getCurrentAttendees, onCheckInOut]);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const center = locations[0]
      ? { lat: locations[0].coordinates[0], lng: locations[0].coordinates[1] }
      : { lat: 43.6532, lng: -79.3832 }; // Toronto center

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
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    infoWindowRef.current = new google.maps.InfoWindow({
      pixelOffset: new google.maps.Size(0, -20)
    });

    // Get user location after map initialization
    getUserLocation();

    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      .gm-style .gm-style-iw-c {
        padding: 0 !important;
        border-radius: 12px !important;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1) !important;
        max-width: 300px !important;
      }
      .gm-style .gm-style-iw-d {
        overflow: hidden !important;
        padding: 0 !important;
      }
      .gm-style .gm-style-iw-tc,
      .gm-style .gm-style-iw-t::after {
        display: none !important;
      }
      .gm-style .gm-ui-hover-effect {
        display: none !important;
      }
      .location-info-window {
        background: white;
        border-radius: 12px;
        padding: 12px 16px;
        min-width: 250px;
      }
      .location-name {
        font-size: 16px;
        font-weight: 600;
        color: #1F2937;
        margin-bottom: 2px;
      }
      .location-address {
        font-size: 14px;
        color: #3B82F6;
        margin-bottom: 6px;
      }
      .location-address a {
        text-decoration: underline;
        color: inherit;
      }
      .location-stats {
        font-size: 14px;
        color: #6B7280;
        margin-bottom: 6px;
        display: flex;
        justify-content: space-between;
      }
      .capacity-bar {
        width: 100%;
        height: 4px;
        background: #E5E7EB;
        border-radius: 2px;
        margin: 6px 0;
        overflow: hidden;
      }
      .capacity-fill {
        height: 100%;
        border-radius: 2px;
        transition: width 0.3s ease;
      }
      .check-button {
        width: 100%;
        padding: 8px;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        text-align: center;
        margin-top: 8px;
        background-color: #4F46E5;
        color: white;
        border: none;
      }
      .check-button:hover {
        opacity: 0.9;
      }
      .check-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      .check-button.checked-in {
        background-color: transparent;
        color: #10B981;
        border: 1px solid #10B981;
      }
    `;
    document.head.appendChild(style);

    // Close info window when clicking on map (but not on info window)
    mapInstanceRef.current.addListener('click', (e: google.maps.MapMouseEvent) => {
      if (e.domEvent && e.domEvent.target) {
        const target = e.domEvent.target as HTMLElement;
        const isInfoWindowClick = target.closest('.gm-style-iw');
        if (!isInfoWindowClick) {
          infoWindowRef.current?.close();
        }
      }
    });
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    locations.forEach(location => {
      const marker = new google.maps.Marker({
        position: { lat: location.coordinates[0], lng: location.coordinates[1] },
        map: mapInstanceRef.current,
        title: location.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#4F46E5',
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: '#FFFFFF',
        },
      });

      marker.addListener('mouseover', () => {
        if (infoWindowRef.current) {
          const content = createInfoContent(location);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
      });

      marker.addListener('click', () => {
        if (infoWindowRef.current) {
          const content = createInfoContent(location);
          infoWindowRef.current.setContent(content);
          infoWindowRef.current.open(mapInstanceRef.current, marker);
        }
        onLocationSelect(location.id);
      });

      markersRef.current.push(marker);
    });
  }, [locations, createInfoContent, onLocationSelect]);

  return <div ref={mapRef} className="w-full h-[400px]" />;
}

export function GoogleMap(props: MapComponentProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return (
      <div className="p-4 bg-yellow-50 text-yellow-800 rounded-lg">
        <p>Map configuration is incomplete. Please check the environment variables.</p>
      </div>
    );
  }

  return (
    <Wrapper apiKey={apiKey} libraries={["places"]}>
      <MapComponent {...props} />
    </Wrapper>
  );
}