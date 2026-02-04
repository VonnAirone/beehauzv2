import { apiClient, ApiResponse } from '../api';

export interface BoardingHouse {
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
  rating: number;
  reviewCount: number;
  distance?: number;
}

export interface SearchFilters {
  location?: string;
  school?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  amenities?: string[];
  sortBy?: 'price' | 'rating' | 'distance';
}

class SearchService {
  async searchBoardingHouses(filters: SearchFilters): Promise<ApiResponse<BoardingHouse[]>> {
    const queryParams = new URLSearchParams();
    
    if (filters.location) queryParams.append('location', filters.location);
    if (filters.school) queryParams.append('school', filters.school);
    if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
    if (filters.bedrooms) queryParams.append('bedrooms', filters.bedrooms.toString());
    if (filters.amenities) queryParams.append('amenities', filters.amenities.join(','));
    if (filters.sortBy) queryParams.append('sortBy', filters.sortBy);

    return apiClient.get<BoardingHouse[]>(`/tenant/search?${queryParams}`);
  }

  async getBoardingHouseById(id: string): Promise<ApiResponse<BoardingHouse>> {
    return apiClient.get<BoardingHouse>(`/tenant/boarding-houses/${id}`);
  }

  async getNearbyBoardingHouses(latitude: number, longitude: number): Promise<ApiResponse<BoardingHouse[]>> {
    return apiClient.get<BoardingHouse[]>(`/tenant/nearby?lat=${latitude}&lng=${longitude}`);
  }
}

export const searchService = new SearchService();