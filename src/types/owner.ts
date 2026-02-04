// Owner-specific types
export interface Property {
  id: string;
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
  ownerId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PropertyCreateData {
  title: string;
  description: string;
  address: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  images: string[];
}

export interface Tenant {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
  currentProperty?: string;
  rentStatus: 'active' | 'pending' | 'inactive';
  joinedAt: string;
}

export interface BookingRequest {
  id: string;
  tenantId: string;
  propertyId: string;
  tenant: Tenant;
  property: Property;
  status: 'pending' | 'approved' | 'rejected';
  requestedDate: string;
  message?: string;
  createdAt: string;
}

export interface EarningsData {
  totalRevenue: number;
  monthlyRevenue: number;
  activeProperties: number;
  occupancyRate: number;
  recentTransactions: Transaction[];
}

export interface Transaction {
  id: string;
  propertyId: string;
  tenantId: string;
  amount: number;
  type: 'rent' | 'deposit' | 'refund';
  status: 'completed' | 'pending' | 'failed';
  date: string;
}