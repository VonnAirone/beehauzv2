import React, { createContext, useContext, useState, ReactNode } from 'react';
import { BoardingHouse } from '../types/tenant';

interface FavoritesContextType {
  favorites: BoardingHouse[];
  addToFavorites: (boardingHouse: BoardingHouse, onAdd?: () => void) => void;
  removeFromFavorites: (boardingHouseId: string) => void;
  isFavorite: (boardingHouseId: string) => boolean;
  clearFavorites: () => void;
  hasUnviewedFavorites: boolean;
  markFavoritesAsViewed: () => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [favorites, setFavorites] = useState<BoardingHouse[]>([]);
  const [hasUnviewedFavorites, setHasUnviewedFavorites] = useState(false);

  const addToFavorites = (boardingHouse: BoardingHouse, onAdd?: () => void) => {
    setFavorites(prev => {
      const exists = prev.some(fav => fav.id === boardingHouse.id);
      if (exists) {
        return prev; // Don't add duplicates
      }
      setHasUnviewedFavorites(true); // Mark as unviewed when new item is added
      
      // Call the callback if provided (for rating tracking)
      if (onAdd) {
        onAdd();
      }
      
      return [...prev, boardingHouse];
    });
  };

  const removeFromFavorites = (boardingHouseId: string) => {
    setFavorites(prev => prev.filter(fav => fav.id !== boardingHouseId));
  };

  const isFavorite = (boardingHouseId: string): boolean => {
    return favorites.some(fav => fav.id === boardingHouseId);
  };

  const clearFavorites = () => {
    setFavorites([]);
    setHasUnviewedFavorites(false); // Clear viewed state when clearing favorites
  };

  const markFavoritesAsViewed = () => {
    setHasUnviewedFavorites(false);
  };

  return (
    <FavoritesContext.Provider value={{
      favorites,
      addToFavorites,
      removeFromFavorites,
      isFavorite,
      clearFavorites,
      hasUnviewedFavorites,
      markFavoritesAsViewed
    }}>
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};