/**
 * Guest Access Utility
 * Manages what features are available to guest users vs authenticated users
 */

// Beta Testing Flag - Set to true to disable property viewing limits
export const BETA_TESTING_MODE = true;

export type FeatureType = 
  | 'browse_properties'
  | 'view_property_details'
  | 'view_photos'
  | 'view_amenities'
  | 'view_pricing'
  | 'view_location'
  | 'read_reviews'
  | 'save_favorites'
  | 'contact_owner'
  | 'make_booking'
  | 'write_review'
  | 'view_owner_details'
  | 'access_full_map'
  | 'view_all_properties';

// Features available to guest users
const GUEST_ALLOWED_FEATURES: FeatureType[] = [
  'browse_properties',
  'view_property_details',
  'view_photos',
  'view_amenities',
  'view_pricing',
  'view_location',
  'read_reviews'
];

// Features that require authentication
const AUTH_REQUIRED_FEATURES: FeatureType[] = [
  'save_favorites',
  'contact_owner',
  'make_booking',
  'write_review',
  'view_owner_details',
  'access_full_map',
  'view_all_properties'
];

export const canAccessFeature = (feature: FeatureType, isAuthenticated: boolean): boolean => {
  if (isAuthenticated) return true;
  
  // In beta testing mode, allow all browsing features for guests
  if (BETA_TESTING_MODE && ['browse_properties', 'view_property_details', 'view_all_properties'].includes(feature)) {
    return true;
  }
  
  return GUEST_ALLOWED_FEATURES.includes(feature);
};

export const requiresAuth = (feature: FeatureType): boolean => {
  // In beta testing mode, only require auth for interaction features
  if (BETA_TESTING_MODE && ['browse_properties', 'view_property_details', 'view_all_properties'].includes(feature)) {
    return false;
  }
  
  return AUTH_REQUIRED_FEATURES.includes(feature);
};

// Guest limitations
export const GUEST_LIMITS = {
  MAX_PROPERTIES_VIEW: 7,  // Show auth prompt after viewing 7 properties
  MAX_REVIEWS_VIEW: 5,     // Show only 5 reviews to guests
  SHOW_AUTH_PROMPT_AFTER: 7 // Show auth prompt after viewing 7 properties
};

// Auth prompt messages for different features
export const AUTH_PROMPT_MESSAGES = {
  save_favorites: {
    title: "Save Your Favorites",
    message: "Create an account to save properties you love and access them anytime.",
    action: "Sign Up to Save"
  },
  contact_owner: {
    title: "Contact Property Owner",
    message: "Sign up to directly message property owners and get quick responses.",
    action: "Sign Up to Message"
  },
  make_booking: {
    title: "Book This Property",
    message: "Create an account to book this boarding house and secure your stay.",
    action: "Sign Up to Book"
  },
  write_review: {
    title: "Share Your Experience",
    message: "Sign up to write reviews and help other students find great places.",
    action: "Sign Up to Review"
  },
  read_reviews: {
    title: "Read All Reviews",
    message: "Sign up to read all reviews and get complete insights from other tenants.",
    action: "Sign Up to Read More"
  },
  view_owner_details: {
    title: "View Owner Details",
    message: "Sign up to see complete owner information and contact details.",
    action: "Sign Up to View"
  },
  access_full_map: {
    title: "Explore All Properties",
    message: "Create an account to see all boarding houses on the map and unlock advanced search.",
    action: "Sign Up to Explore"
  },
  view_all_properties: {
    title: "See All Properties",
    message: "You've seen our featured properties! Sign up to browse our complete collection.",
    action: "Sign Up for Full Access"
  }
};

export const getAuthPromptForFeature = (feature: FeatureType) => {
  return AUTH_PROMPT_MESSAGES[feature as keyof typeof AUTH_PROMPT_MESSAGES] || {
    title: "Sign Up Required",
    message: "Create an account to access this feature.",
    action: "Sign Up"
  };
};