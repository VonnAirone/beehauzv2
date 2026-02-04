// 🚀 QUICK INTEGRATION EXAMPLE
// Copy this code directly into your MapScreenMapbox.tsx file

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchOptimizedRoute } from './optimizedRouting';
import { OPTIMIZED_MAP_CONFIG, getOptimizedMapStyle, DevModeHelpers } from './mapboxOptimizations';

// Replace your existing fetchRoute function with this optimized version:
export const createOptimizedFetchRoute = (
  setIsLoadingRoute: (loading: boolean) => void,
  setRouteCoordinates: (coords: number[][]) => void,
  setRouteInfo: (info: {distance: string, duration: string}) => void
) => {
  return useCallback(async (fromLng: number, fromLat: number) => {
    setIsLoadingRoute(true);
    
    try {
      const result = await fetchOptimizedRoute(fromLng, fromLat);
      
      if (result) {
        setRouteCoordinates(result.coordinates);
        setRouteInfo(result.routeInfo);
        
        // Development monitoring
        if (__DEV__) {
          DevModeHelpers.logAPICall('route', false);
        }
      }
    } catch (error) {
      if (__DEV__) console.log('Optimized route error:', error);
    } finally {
      setIsLoadingRoute(false);
    }
  }, [setIsLoadingRoute, setRouteCoordinates, setRouteInfo]);
};

// Replace your MapView configuration with these optimized props:
export const getOptimizedMapProps = () => ({
  styleURL: getOptimizedMapStyle(__DEV__),
  pitchEnabled: OPTIMIZED_MAP_CONFIG.pitchEnabled,
  rotateEnabled: OPTIMIZED_MAP_CONFIG.rotateEnabled,
  compassEnabled: OPTIMIZED_MAP_CONFIG.compassEnabled,
});

// Replace your Camera configuration with these optimized props:
export const getOptimizedCameraProps = (universityCoords: {longitude: number, latitude: number}) => ({
  centerCoordinate: [universityCoords.longitude, universityCoords.latitude],
  zoomLevel: OPTIMIZED_MAP_CONFIG.initialZoom,
  minZoomLevel: OPTIMIZED_MAP_CONFIG.minZoomLevel,
  maxZoomLevel: OPTIMIZED_MAP_CONFIG.maxZoomLevel,
  animationDuration: 1000
});

// Optional: Development monitoring hook
export const useDevMonitoring = (routeCoordinates: number[][]) => {
  useEffect(() => {
    if (__DEV__) {
      DevModeHelpers.calculateUsageEstimate(
        routeCoordinates.length > 0 ? 1 : 0,
        1
      );
    }
  }, [routeCoordinates]);
};