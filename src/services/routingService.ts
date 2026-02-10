// Routing service using OSRM (Open Source Routing Machine)
// Provides actual walking routes that follow roads

interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: number[][];
    };
    distance: number; // in meters
    duration: number; // in seconds
  }>;
}

export interface WalkingRoute {
  coordinates: [number, number][]; // Array of [lat, lng] points
  distance: number; // in meters
  duration: number; // in seconds
}

/**
 * Get walking route between two points using OSRM
 * @param from [latitude, longitude]
 * @param to [latitude, longitude]
 * @returns Walking route with actual road path
 */
export const getWalkingRoute = async (
  from: [number, number],
  to: [number, number]
): Promise<WalkingRoute | null> => {
  try {
    // OSRM expects coordinates in [longitude, latitude] format
    const [fromLat, fromLng] = from;
    const [toLat, toLng] = to;

    // Using OSRM demo server (foot-walking profile)
    const url = `https://router.project-osrm.org/route/v1/foot/${fromLng},${fromLat};${toLng},${toLat}?overview=full&geometries=geojson`;

    const response = await fetch(url);

    if (!response.ok) {
      console.warn('OSRM routing failed:', response.status);
      return null;
    }

    const data: OSRMResponse = await response.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      console.warn('No route found');
      return null;
    }

    const route = data.routes[0];

    // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
    const coordinates: [number, number][] = route.geometry.coordinates.map(
      ([lng, lat]) => [lat, lng]
    );

    return {
      coordinates,
      distance: route.distance, // meters
      duration: route.duration, // seconds
    };
  } catch (error) {
    console.error('Error fetching walking route:', error);
    return null;
  }
};

/**
 * Format distance for display
 * @param meters Distance in meters
 * @returns Formatted string (e.g., "1.2 km" or "350 m")
 */
export const formatRouteDistance = (meters: number): string => {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  } else {
    return `${(meters / 1000).toFixed(1)} km`;
  }
};

/**
 * Format duration for display
 * @param seconds Duration in seconds
 * @returns Formatted string (e.g., "15 min" or "1h 20min")
 */
export const formatRouteDuration = (seconds: number): string => {
  const minutes = Math.round(seconds / 60);

  if (minutes < 60) {
    return `${minutes} min`;
  } else {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  }
};
