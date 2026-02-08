// Tenant-specific types
export interface PaymentTerms {
  advancePayment: number; // Number of months required in advance
  deposit: number; // Amount for security deposit
  electricityIncluded: boolean;
  waterIncluded: boolean;
  otherFees?: {
    name: string;
    amount: number;
    required: boolean;
  }[];
}

export interface RoomType {
  type: 'solo' | '4-person' | '6-person' | '8-person';
  available: number;
  pricePerMonth: number;
}

export type RoomTypeVariant = 'solo' | '4-person' | '6-person' | '8-person';

export interface BoardingHouse {
  id: string;
  name: string; // Changed from title to name as requested
  location: string; // Changed from address to location as requested
  availableBeds: number; // Changed from bedrooms to availableBeds as requested
  rating: number;
  ratePerMonth: number; // Changed from price to ratePerMonth as requested
  description: string;
  paymentTerms: PaymentTerms;
  amenities: string[];
  images: string[];
  ownerId: string;
  roomTypes?: RoomType[]; // Available room configurations
  owner: {
    id: string;
    name: string;
    profileImage?: string;
    phone?: string;
    facebook_url?: string;
  };
  reviewCount: number;
  distance?: number;
  isAvailable: boolean;
  // Additional fields for more details
  bathrooms?: number;
  capacity?: number; // Total bed capacity
  rules?: string[];
  nearbyLandmarks?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SearchFilters {
  location?: string;
  school?: string; // School/university filter
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'distance';
}

export interface Booking {
  id: string;
  boardingHouseId: string;
  boardingHouse: BoardingHouse;
  tenantId: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  checkInDate: string;
  checkOutDate?: string;
  totalAmount: number;
  createdAt: string;
}

export interface Favorite {
  id: string;
  tenantId: string;
  boardingHouseId: string;
  boardingHouse: BoardingHouse;
  addedAt: string;
}

export interface Review {
  id: string;
  boardingHouseId: string;
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    profileImage?: string;
  };
  rating: number;
  comment: string;
  createdAt: string;
}