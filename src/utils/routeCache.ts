import AsyncStorage from '@react-native-async-storage/async-storage';

// 🚨 DEVELOPMENT MODE - Set to false in production
export const IS_DEV_MODE = __DEV__;
export const CACHE_ROUTES = true;
export const USE_MOCK_ROUTES = IS_DEV_MODE; // Use mock data in development

const ROUTE_CACHE_KEY = '@route_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

interface CachedRoute {
  coordinates: number[][];
  distance: number;
  duration: number;
  timestamp: number;
}

interface RouteInfo {
  distance: string;
  duration: string;
}

// Generate cache key for route
const generateCacheKey = (fromLng: number, fromLat: number, toLng: number, toLat: number): string => {
  return `${ROUTE_CACHE_KEY}${fromLat.toFixed(4)}_${fromLng.toFixed(4)}_${toLat.toFixed(4)}_${toLng.toFixed(4)}`;
};

// Check if cached route is still valid
const isCacheValid = (timestamp: number): boolean => {
  return Date.now() - timestamp < CACHE_EXPIRY;
};

// Mock route data for development (saves API calls)
const generateMockRoute = (fromLng: number, fromLat: number, toLng: number, toLat: number): CachedRoute => {
  // Calculate rough distance using Haversine formula (for realistic mock data)
  const R = 6371; // Earth's radius in km
  const dLat = (toLat - fromLat) * Math.PI / 180;
  const dLng = (toLng - fromLng) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(fromLat * Math.PI / 180) * Math.cos(toLat * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c * 1000; // Distance in meters

  // Generate mock walking route coordinates (simple line with some curves)
  const steps = 8;
  const coordinates: number[][] = [];
  
  for (let i = 0; i <= steps; i++) {
    const progress = i / steps;
    const lat = fromLat + (toLat - fromLat) * progress;
    const lng = fromLng + (toLng - fromLng) * progress;
    
    // Add slight curve to make it look more realistic
    const offset = Math.sin(progress * Math.PI) * 0.0002;
    coordinates.push([lng + offset, lat + offset]);
  }

  return {
    coordinates,
    distance,
    duration: Math.ceil(distance / 1.4), // Walking speed ~1.4 m/s
    timestamp: Date.now()
  };
};

// Get cached route or fetch new one
export const getCachedRoute = async (
  fromLng: number, 
  fromLat: number, 
  toLng: number, 
  toLat: number
): Promise<CachedRoute | null> => {
  if (!CACHE_ROUTES) return null;

  try {
    const cacheKey = generateCacheKey(fromLng, fromLat, toLng, toLat);
    const cached = await AsyncStorage.getItem(cacheKey);
    
    if (cached) {
      const parsedCache: CachedRoute = JSON.parse(cached);
      
      if (isCacheValid(parsedCache.timestamp)) {
        if (__DEV__) console.log('📦 Using cached route data');
        return parsedCache;
      } else {
        // Remove expired cache
        await AsyncStorage.removeItem(cacheKey);
      }
    }
  } catch (error) {
    if (__DEV__) console.log('Cache read error:', error);
  }

  return null;
};

// Cache route data
export const cacheRoute = async (
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number,
  routeData: CachedRoute
): Promise<void> => {
  if (!CACHE_ROUTES) return;

  try {
    const cacheKey = generateCacheKey(fromLng, fromLat, toLng, toLat);
    await AsyncStorage.setItem(cacheKey, JSON.stringify({
      ...routeData,
      timestamp: Date.now()
    }));
    if (__DEV__) console.log('💾 Route cached successfully');
  } catch (error) {
    if (__DEV__) console.log('Cache write error:', error);
  }
};

// Get mock route for development
export const getMockRoute = (
  fromLng: number,
  fromLat: number,
  toLng: number,
  toLat: number
): CachedRoute => {
  if (__DEV__) console.log('🧪 Using mock route data (dev mode)');
  return generateMockRoute(fromLng, fromLat, toLng, toLat);
};

// Format route info for display
export const formatRouteInfo = (distance: number, duration: number): RouteInfo => {
  const distanceKm = distance / 1000;
  const durationMin = Math.ceil(duration / 60);
  
  return {
    distance: distanceKm < 1 ? `${Math.round(distance)}m` : `${distanceKm.toFixed(2)}km`,
    duration: durationMin < 60 ? `${durationMin} min walk` : `${Math.floor(durationMin / 60)}h ${durationMin % 60}m walk`
  };
};

// Clear all cached routes (for testing)
export const clearRouteCache = async (): Promise<void> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY));
    await AsyncStorage.multiRemove(routeKeys);
    if (__DEV__) console.log('🗑️ Route cache cleared');
  } catch (error) {
    if (__DEV__) console.log('Cache clear error:', error);
  }
};

// Get cache statistics
export const getCacheStats = async (): Promise<{count: number, size: string}> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const routeKeys = keys.filter(key => key.startsWith(ROUTE_CACHE_KEY));
    
    let totalSize = 0;
    for (const key of routeKeys) {
      const value = await AsyncStorage.getItem(key);
      if (value) totalSize += value.length;
    }
    
    return {
      count: routeKeys.length,
      size: `${(totalSize / 1024).toFixed(2)}KB`
    };
  } catch (error) {
    return { count: 0, size: '0KB' };
  }
};