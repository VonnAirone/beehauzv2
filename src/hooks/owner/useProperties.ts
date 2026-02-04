import { useState, useEffect } from 'react';
import { propertiesService, Property, PropertyCreateData } from '../../services/owner/properties';

export const useProperties = (ownerId: string) => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (ownerId) {
      fetchProperties();
    }
  }, [ownerId]);

  const fetchProperties = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesService.getOwnerProperties(ownerId);
      
      if (response.success && response.data) {
        setProperties(response.data);
      } else {
        setError(response.error || 'Failed to fetch properties');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch properties');
    } finally {
      setIsLoading(false);
    }
  };

  const createProperty = async (data: PropertyCreateData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesService.createProperty(data);
      
      if (response.success && response.data) {
        setProperties(prev => [...prev, response.data!]);
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to create property');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProperty = async (id: string, data: Partial<PropertyCreateData>) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesService.updateProperty(id, data);
      
      if (response.success && response.data) {
        setProperties(prev => 
          prev.map(property => 
            property.id === id ? response.data! : property
          )
        );
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to update property');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const deleteProperty = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await propertiesService.deleteProperty(id);
      
      if (response.success) {
        setProperties(prev => prev.filter(property => property.id !== id));
        return { success: true };
      } else {
        setError(response.error || 'Failed to delete property');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    properties,
    isLoading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty,
    refetch: fetchProperties,
  };
};