import { Loader } from '@googlemaps/js-api-loader';

// Create a singleton loader instance
export const mapsLoader = new Loader({
  apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  libraries: ["places"],
});