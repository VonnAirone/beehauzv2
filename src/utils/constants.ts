// App constants

export const APP_CONFIG = {
  API_BASE_URL: 'https://your-api-url.com/api',
  APP_NAME: 'BoardingHouse Finder',
  VERSION: '1.0.0',
  DEVELOPER: 'Your Company Name',
};

export const USER_TYPES = {
  OWNER: 'owner',
  TENANT: 'tenant',
} as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
} as const;

export const PROPERTY_AMENITIES = [
  'WiFi',
  'Air Conditioning',
  'Parking',
  'Kitchen',
  'Laundry',
  'Security',
  'CCTV',
  'Study Area',
  'Common Room',
  'Balcony',
  'Water Heater',
  'Refrigerator',
] as const;

export const COUNTRY_CODES = [
  { code: '+63', country: 'Philippines', flag: '🇵🇭' },
  { code: '+1', country: 'United States', flag: '🇺🇸' },
  { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
  { code: '+86', country: 'China', flag: '🇨🇳' },
  { code: '+81', country: 'Japan', flag: '🇯🇵' },
  { code: '+82', country: 'South Korea', flag: '🇰🇷' },
  { code: '+65', country: 'Singapore', flag: '🇸🇬' },
  { code: '+60', country: 'Malaysia', flag: '🇲🇾' },
  { code: '+66', country: 'Thailand', flag: '🇹🇭' },
  { code: '+84', country: 'Vietnam', flag: '🇻🇳' },
] as const;

export const POPULAR_SCHOOLS = [
  {
    id: 'ua',
    name: 'University of Antique - Main Campus',
    shortName: 'UA',
    location: 'Sibalom, Antique',
    coordinates: { latitude: 10.7913526, longitude: 122.0089137 }
  },
  {
    id: 'acc',
    name: 'Advance Central College',
    shortName: 'ACC',
    location: 'San Jose de Buenavista, Antique',
    coordinates: { latitude: 10.7670, longitude: 121.9341 }
  },
  {
    id: 'sac',
    name: `St. Anthony's College`,
    shortName: `SAC`,
    location: 'San Jose de Buenavista, Antique',
    coordinates: { latitude: 10.7680, longitude: 121.9350 }
  },
  {
    id: 'ua-hamtic',
    name: 'University of Antique - Hamtic Campus',
    shortName: 'UA-Hamtic',
    location: 'Hamtic, Antique',
    coordinates: { latitude: 10.6847, longitude: 121.9533 }
  },
  {
    id: 'ua-tibiao',
    name: 'University of Antique - Tibiao Campus',
    shortName: 'UA-Tibiao',
    location: 'Tibiao, Antique',
    coordinates: { latitude: 10.8167, longitude: 122.0500 }
  },
  {
    id: 'ua-libertad',
    name: 'University of Antique - Libertad Campus',
    shortName: 'UA-Libertad',
    location: 'Libertad, Antique',
    coordinates: { latitude: 10.7847, longitude: 121.8833 }
  },
  {
    id: 'wrighttech',
    name: 'Wright Technical College',
    shortName: 'WTC',
    location: 'Sibalom, Antique',
    coordinates: { latitude: 10.7920, longitude: 122.0080 }
  }
] as const;

export const SEARCH_FILTERS = {
  SORT_BY: {
    PRICE_LOW_TO_HIGH: 'price',
    RATING: 'rating',
    DISTANCE: 'distance',
  },
  PRICE_RANGES: [
    { label: 'Under ₱3,000', min: 0, max: 3000 },
    { label: '₱3,000 - ₱5,000', min: 3000, max: 5000 },
    { label: '₱5,000 - ₱7,000', min: 5000, max: 7000 },
    { label: '₱7,000 - ₱10,000', min: 7000, max: 10000 },
    { label: 'Above ₱10,000', min: 10000, max: null },
  ],
} as const;

export const NOTIFICATION_TYPES = {
  BOOKING: 'booking',
  MESSAGE: 'message',
  PAYMENT: 'payment',
  SYSTEM: 'system',
} as const;

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: '@auth_token',
  USER_DATA: '@user_data',
  USER_TYPE: '@user_type',
  ONBOARDING_COMPLETED: '@onboarding_completed',
} as const;

// Realistic boarding house locations near University of Antique - Sibalom
export const REALISTIC_BOARDING_HOUSE_COORDS = [
  { name: 'UA Student Lodge', lat: 10.7908, lng: 122.0098, description: '200m from UA Main Gate, near UA Canteen' },
  { name: "Kuya Jun's Boarding House", lat: 10.7922, lng: 122.0076, description: 'Beside Sibalom Public Market & BDO' },
  { name: 'Casa Verde Student Home', lat: 10.7925, lng: 122.0105, description: 'Poblacion Center, near Barangay Hall' },
  { name: 'Sunshine Dormitory', lat: 10.7890, lng: 122.0082, description: 'South of campus, near rural health unit' },
  { name: 'Premier Student Inn', lat: 10.7935, lng: 122.0115, description: 'Near restaurants & Jollibee Sibalom' },
  { name: 'Highway Lodge', lat: 10.7940, lng: 122.0068, description: 'Along National Highway, bus terminal area' },
  { name: 'Peaceful Haven Boarding', lat: 10.7875, lng: 122.0095, description: 'Quiet residential, near elementary school' },
  { name: 'Riverside Boarding House', lat: 10.7950, lng: 122.0088, description: 'Near Sibalom River & basketball court' },
  { name: 'Town Center Lodge', lat: 10.7918, lng: 122.0125, description: 'Commercial area, near drugstore & sari-sari stores' },
  { name: 'Terminal View Dormitory', lat: 10.7885, lng: 122.0078, description: 'Near tricycle/jeepney terminal & church' },
] as const;

// Real landmarks around University of Antique - Sibalom
export const SIBALOM_LANDMARKS = [
  'University of Antique Main Campus',
  'Sibalom Public Market',
  'BDO Sibalom Branch', 
  'Jollibee Sibalom',
  'Sibalom Municipal Hall',
  'Sibalom Catholic Church',
  'Sibalom Central Elementary School',
  'Sibalom District Hospital',
  'National Highway (Antique-Iloilo)',
  'Sibalom River',
  'Barangay Poblacion Hall',
  'Tricycle Terminal',
  'Basketball Court/Covered Court',
  'Rural Health Unit',
  'Sibalom High School'
] as const;

export const SCREEN_NAMES = {
  // Auth screens
  USER_TYPE_SELECTION: 'UserTypeSelection',
  LOGIN: 'Login',
  REGISTER: 'Register',
  
  // Owner screens
  OWNER_DASHBOARD: 'OwnerDashboard',
  PROPERTIES: 'Properties',
  ADD_PROPERTY: 'AddProperty',
  EDIT_PROPERTY: 'EditProperty',
  PROPERTY_DETAIL: 'PropertyDetail',
  TENANTS: 'Tenants',
  TENANT_DETAIL: 'TenantDetail',
  BOOKING_REQUESTS: 'BookingRequests',
  BOOKING_HISTORY: 'BookingHistory',
  EARNINGS: 'Earnings',
  
  // Tenant screens
  SEARCH: 'Search',
  FILTER: 'Filter',
  MAP_VIEW: 'MapView',
  BOARDING_HOUSES_LIST: 'BoardingHousesList',
  BOARDING_HOUSE_DETAIL: 'BoardingHouseDetail',
  GALLERY: 'Gallery',
  BOOKING: 'Booking',
  MY_BOOKINGS: 'MyBookings',
  BOOKING_DETAIL: 'BookingDetail',
  FAVORITES: 'Favorites',
  REVIEWS: 'Reviews',
  
  // Shared screens
  PROFILE: 'Profile',
  EDIT_PROFILE: 'EditProfile',
  SETTINGS: 'Settings',
  MESSAGES: 'Messages',
  CHAT: 'Chat',
  NOTIFICATIONS: 'Notifications',
} as const;