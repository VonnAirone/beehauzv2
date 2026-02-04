import { useState, useCallback } from 'react';
import { searchService, BoardingHouse, SearchFilters } from '../../services/tenant/search';

export const useSearch = () => {
  const [boardingHouses, setBoardingHouses] = useState<BoardingHouse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({});

  const searchBoardingHouses = useCallback(async (searchFilters?: SearchFilters) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const filtersToUse = searchFilters || filters;
      const response = await searchService.searchBoardingHouses(filtersToUse);
      
      if (response.success && response.data) {
        setBoardingHouses(response.data);
      } else {
        setError(response.error || 'Failed to search boarding houses');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search boarding houses');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const getBoardingHouseById = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await searchService.getBoardingHouseById(id);
      
      if (response.success && response.data) {
        return { success: true, data: response.data };
      } else {
        setError(response.error || 'Failed to fetch boarding house details');
        return { success: false, error: response.error };
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch boarding house details';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    boardingHouses,
    isLoading,
    error,
    filters,
    searchBoardingHouses,
    updateFilters,
    clearFilters,
    getBoardingHouseById,
  };
};