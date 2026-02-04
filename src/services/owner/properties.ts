import { apiClient, ApiResponse } from '../api';

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

class PropertiesService {
  async getOwnerProperties(ownerId: string): Promise<ApiResponse<Property[]>> {
    return apiClient.get<Property[]>(`/owner/properties?ownerId=${ownerId}`);
  }

  async createProperty(data: PropertyCreateData): Promise<ApiResponse<Property>> {
    return apiClient.post<Property>('/owner/properties', data);
  }

  async updateProperty(id: string, data: Partial<PropertyCreateData>): Promise<ApiResponse<Property>> {
    return apiClient.put<Property>(`/owner/properties/${id}`, data);
  }

  async deleteProperty(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(`/owner/properties/${id}`);
  }

  async getPropertyById(id: string): Promise<ApiResponse<Property>> {
    return apiClient.get<Property>(`/owner/properties/${id}`);
  }
}

export const propertiesService = new PropertiesService();