import React from 'react';
import { MapScreenMapbox } from './MapScreenMapbox';
import { MapScreenFallback } from './MapScreenFallback';
import Constants from 'expo-constants';

export const MapScreen: React.FC = () => {
  const MAPBOX_ACCESS_TOKEN = Constants.expoConfig?.extra?.mapboxAccessToken;
  
  // Use Mapbox if token is configured, otherwise use fallback
  if (MAPBOX_ACCESS_TOKEN && MAPBOX_ACCESS_TOKEN !== 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
    return <MapScreenMapbox />;
  }
  
  return <MapScreenFallback />;
};