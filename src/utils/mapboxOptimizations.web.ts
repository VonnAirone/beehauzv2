// Optimized Mapbox Configuration for Reduced API Usage
// This configuration minimizes tile requests and API calls during development

// Web version - Mapbox not available, provide fallback configurations

// 🎯 Optimized settings for beta testing
export const OPTIMIZED_MAP_CONFIG = {
  // Reduce tile requests by limiting zoom range
  minZoomLevel: 12,  // Don't allow zooming out too far
  maxZoomLevel: 18,  // Don't allow extreme zoom in
  
  // Reduce initial map area
  initialZoom: 15,   // Good balance between detail and coverage
  
  // Disable expensive features during development
  pitchEnabled: false,    // Saves 3D rendering
  rotateEnabled: false,   // Simpler interactions
  compassEnabled: false,  // Less UI elements
  
  // Optimize performance
  localizeLabels: false,  // Use default labels
  scaleBarEnabled: false, // Remove scale bar
  
  // Cache settings (if supported)
  offlinePackDownloadEnabled: false,
  telemetryEnabled: false, // Reduce tracking calls
};

// 🗺️ Map style optimization
export const getOptimizedMapStyle = (isDev: boolean = false) => {
  // Return string URLs for web compatibility
  return 'mapbox://styles/mapbox/light-v11';
};

// 📍 Marker optimization - reduce marker complexity
export const OPTIMIZED_MARKER_CONFIG = {
  // Reduce marker update frequency
  shouldUpdate: false, // Only update when necessary
  
  // Simplify interactions
  allowOverlap: true,  // Prevent expensive collision detection
  
  // Reduce visual complexity
  iconAllowOverlap: true,
  textAllowOverlap: false,
};

// 🎯 Performance monitoring (mock for web)
export const trackMapPerformance = {
  tileRequests: 0,
  apiCalls: 0,
  renderTime: 0,
  
  reset: () => {
    trackMapPerformance.tileRequests = 0;
    trackMapPerformance.apiCalls = 0;
    trackMapPerformance.renderTime = 0;
  },
  
  log: () => {
    console.log('📊 Map Performance (Web):', {
      tileRequests: trackMapPerformance.tileRequests,
      apiCalls: trackMapPerformance.apiCalls,
      renderTime: trackMapPerformance.renderTime,
    });
  },
};

// 💡 Best practices for Mapbox optimization
export const MAPBOX_BEST_PRACTICES = {
  // Use appropriate zoom levels
  useMinMaxZoom: true,
  
  // Batch marker updates
  batchMarkerUpdates: true,
  
  // Implement viewport culling
  renderOnlyVisibleMarkers: true,
  
  // Cache route calculations
  cacheRoutes: true,
  
  // Limit map interactions
  limitGestures: true,
  
  // Use simplified styles in dev
  simplifyDevStyles: true,
};

// 🚀 Apply optimizations (no-op for web)
export const initializeOptimizedMapbox = (accessToken: string) => {
  console.log('⚠️ Mapbox not available on web, using fallback configuration');
};

// 📦 Export configuration
export const MAPBOX_SETTINGS = {
  ...OPTIMIZED_MAP_CONFIG,
  style: getOptimizedMapStyle(),
  markerConfig: OPTIMIZED_MARKER_CONFIG,
};
