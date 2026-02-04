import React from 'react';
import { MapScreenFallback } from './MapScreenFallback';

// For web, use the fallback map since @rnmapbox/maps is not available
// In the future, this can be replaced with react-map-gl or mapbox-gl-js
export const MapScreenMapbox: React.FC = () => {
  return <MapScreenFallback />;
};
