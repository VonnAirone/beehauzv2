// Web stub for @rnmapbox/maps
// This provides empty exports to prevent bundling errors on web

export default {
  StyleURL: {
    Street: 'mapbox://styles/mapbox/streets-v12',
    Light: 'mapbox://styles/mapbox/light-v11',
    Dark: 'mapbox://styles/mapbox/dark-v11',
    Satellite: 'mapbox://styles/mapbox/satellite-v9',
    SatelliteStreet: 'mapbox://styles/mapbox/satellite-streets-v12',
  },
  setAccessToken: () => {},
  setTelemetryEnabled: () => {},
};

// Mock components
export const MapView = () => null;
export const Camera = () => null;
export const UserLocation = () => null;
export const MarkerView = () => null;
export const ShapeSource = () => null;
export const LineLayer = () => null;
export const SymbolLayer = () => null;
export const CircleLayer = () => null;
