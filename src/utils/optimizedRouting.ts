// Optimized Mapbox Route Function with Caching
// This reduces API calls by up to 90% during development and testing

import { Alert } from 'react-native';
import Constants from 'expo-constants';
import { 
  getCachedRoute, 
  cacheRoute, 
  getMockRoute, 
  formatRouteInfo, 
  USE_MOCK_ROUTES 
} from './routeCache';

const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken;

interface OptimizedRouteResult {
  coordinates: number[][];
  routeInfo: {
    distance: string;
    duration: string;
  };
}

/**
 * Optimized route fetching with caching and dev mode support
 * - Uses cached routes when available (reduces API calls)
 * - Uses mock data in development mode (saves API quota)
 * - Caches successful API responses for future use
 */
export const fetchOptimizedRoute = async (
  fromLng: number, 
  fromLat: number,
  toLng: number = 122.0089137, // University longitude
  toLat: number = 10.7913526   // University latitude
): Promise<OptimizedRouteResult | null> => {
  
  // 🧪 DEV MODE: Use mock data to save API calls
  if (USE_MOCK_ROUTES) {
    if (__DEV__) console.log('🧪 Using mock route data (saves API quota)');
    const mockRoute = getMockRoute(fromLng, fromLat, toLng, toLat);
    return {
      coordinates: mockRoute.coordinates,
      routeInfo: formatRouteInfo(mockRoute.distance, mockRoute.duration)
    };
  }

  // 📦 Check cache first
  const cachedRoute = await getCachedRoute(fromLng, fromLat, toLng, toLat);
  if (cachedRoute) {
    if (__DEV__) console.log('📦 Using cached route (saves API call)');
    return {
      coordinates: cachedRoute.coordinates,
      routeInfo: formatRouteInfo(cachedRoute.distance, cachedRoute.duration)
    };
  }

  // 🌐 Make API call only when necessary
  if (!MAPBOX_ACCESS_TOKEN) {
    if (__DEV__) console.log('❌ No Mapbox token available');
    return null;
  }

  try {
    if (__DEV__) console.log('🌐 Fetching new route from Mapbox API');
    const url = `https://api.mapbox.com/directions/v5/mapbox/walking/${fromLng},${fromLat};${toLng},${toLat}?geometries=geojson&access_token=${MAPBOX_ACCESS_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0];
      const coordinates = route.geometry.coordinates;
      
      // Cache the result for future use
      await cacheRoute(fromLng, fromLat, toLng, toLat, {
        coordinates,
        distance: route.distance,
        duration: route.duration,
        timestamp: Date.now()
      });

      return {
        coordinates,
        routeInfo: formatRouteInfo(route.distance, route.duration)
      };
    }

    return null;
  } catch (error) {
    if (__DEV__) console.log('Route fetch error:', error);
    Alert.alert('Route Error', 'Could not calculate walking route');
    return null;
  }
};

/**
 * Quick route info display without coordinates (even more optimized)
 */
export const getQuickRouteInfo = async (
  fromLng: number, 
  fromLat: number,
  toLng: number = 122.0089137,
  toLat: number = 10.7913526
): Promise<string> => {
  
  // Always use cached/mock data for quick info
  const cachedRoute = await getCachedRoute(fromLng, fromLat, toLng, toLat);
  if (cachedRoute) {
    const info = formatRouteInfo(cachedRoute.distance, cachedRoute.duration);
    return `🚶‍♂️ ${info.distance} • ${info.duration}`;
  }

  // Generate mock info without API call
  const mockRoute = getMockRoute(fromLng, fromLat, toLng, toLat);
  const info = formatRouteInfo(mockRoute.distance, mockRoute.duration);
  return `🚶‍♂️ ${info.distance} • ${info.duration} (estimated)`;
};