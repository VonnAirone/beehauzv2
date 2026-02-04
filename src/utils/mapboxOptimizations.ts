// Optimized Mapbox Configuration for Reduced API Usage
// This configuration minimizes tile requests and API calls during development

import Mapbox from '@rnmapbox/maps';

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
export const getOptimizedMapStyle = (isDev: boolean = __DEV__) => {
  if (isDev) {
    // Use simpler style in development to reduce tile requests
    return Mapbox.StyleURL.Light; // Lightweight, fewer details
  } else {
    // Full featured style in production
    return Mapbox.StyleURL.Street; // More detailed for users
  }
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
  
  // Performance settings
  iconIgnorePlacement: false,
  textIgnorePlacement: true,
};

// 🎮 Camera animation optimization
export const OPTIMIZED_CAMERA_CONFIG = {
  // Faster, simpler animations
  animationDuration: 1000, // Reduced from potential longer animations
  animationMode: 'easeTo', // Simple easing
  
  // Limit camera bounds to reduce tile loading
  bounds: {
    // Focus area around Sibalom, Antique
    ne: [122.05, 10.82], // Northeast corner  
    sw: [121.95, 10.76], // Southwest corner
  },
  
  // Padding to prevent edge tile loading
  padding: {
    paddingTop: 50,
    paddingBottom: 50,
    paddingLeft: 50,
    paddingRight: 50,
  }
};

// 🚀 Development mode helpers
export const DevModeHelpers = {
  // Show current API usage estimate
  logTileEstimate: (zoomLevel: number, viewportSize: { width: number, height: number }) => {
    const tilesPerLevel = Math.pow(4, zoomLevel - 10); // Rough estimate
    const visibleTiles = Math.ceil((viewportSize.width / 256) * (viewportSize.height / 256));
    if (__DEV__) console.log(`📊 Estimated tiles at zoom ${zoomLevel}: ~${visibleTiles} visible, ~${tilesPerLevel} total`);
  },
  
  // Monitor route API calls
  logAPICall: (type: 'route' | 'geocode' | 'style', cached: boolean = false) => {
    const emoji = cached ? '📦' : '🌐';
    const status = cached ? 'CACHED' : 'API CALL';
    if (__DEV__) console.log(`${emoji} ${type.toUpperCase()} ${status} - ${cached ? 'Free' : 'Quota used'}`);
  },
  
  // Estimate monthly usage
  calculateUsageEstimate: (routeCalls: number, mapLoads: number) => {
    const estimatedMonthlyCalls = (routeCalls * 30) + (mapLoads * 30 * 20); // 20 map interactions per day
    if (__DEV__) {
      console.log(`📈 Estimated monthly usage: ~${estimatedMonthlyCalls} requests`);
      
      if (estimatedMonthlyCalls > 50000) {
        console.warn('⚠️  Estimated usage exceeds free tier (50k/month)');
      } else {
        console.log('✅ Within free tier limits');
      }
    }
  }
};

// 🎯 Quick setup function for optimized map
export const setupOptimizedMapbox = (mapViewRef: any) => {
  if (!mapViewRef) return;
  
  // Apply optimized settings
  if (__DEV__) {
    if (__DEV__) console.log('🛠️  Applying development optimizations...');
    
    // Log initial setup
    DevModeHelpers.logAPICall('style', false);
    DevModeHelpers.calculateUsageEstimate(0, 1); // Initial load
  }
  
  // Set bounds to limit tile loading
  // mapViewRef.fitBounds(
  //   OPTIMIZED_CAMERA_CONFIG.bounds.ne,
  //   OPTIMIZED_CAMERA_CONFIG.bounds.sw,
  //   OPTIMIZED_CAMERA_CONFIG.padding,
  //   1000
  // );
};