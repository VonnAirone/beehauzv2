import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { GUEST_LIMITS, BETA_TESTING_MODE } from '../utils/guestAccess';
import { useAuthContext } from './AuthContext';

interface GuestTrackingContextType {
  viewedPropertiesCount: number;
  hasReachedViewLimit: boolean;
  trackPropertyView: (propertyId: string) => void;
  resetTracking: () => void;
  shouldShowAuthPrompt: () => boolean;
}

const GuestTrackingContext = createContext<GuestTrackingContextType | undefined>(undefined);

const STORAGE_KEY = 'guest_viewed_properties';

export const GuestTrackingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewedProperties, setViewedProperties] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const { isAuthenticated } = useAuthContext();

  // Load viewed properties from storage on app start
  useEffect(() => {
    loadViewedProperties();
  }, []);

  // Reset tracking when user authenticates
  useEffect(() => {
    if (isAuthenticated) {
      resetTracking();
    }
  }, [isAuthenticated]);

  const loadViewedProperties = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const propertyIds = JSON.parse(stored);
        setViewedProperties(new Set(propertyIds));
      }
    } catch (error) {
      console.log('Error loading viewed properties:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveViewedProperties = async (properties: Set<string>) => {
    try {
      const propertyIds = Array.from(properties);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(propertyIds));
    } catch (error) {
      console.log('Error saving viewed properties:', error);
    }
  };

  const trackPropertyView = (propertyId: string) => {
    // Skip tracking during beta testing
    if (BETA_TESTING_MODE) return;
    
    if (!viewedProperties.has(propertyId)) {
      const newViewedProperties = new Set(viewedProperties);
      newViewedProperties.add(propertyId);
      setViewedProperties(newViewedProperties);
      saveViewedProperties(newViewedProperties);
    }
  };

  const resetTracking = async () => {
    setViewedProperties(new Set());
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.log('Error resetting tracking:', error);
    }
  };

  const viewedPropertiesCount = viewedProperties.size;
  const hasReachedViewLimit = BETA_TESTING_MODE ? false : viewedPropertiesCount >= GUEST_LIMITS.MAX_PROPERTIES_VIEW;
  
  const shouldShowAuthPrompt = () => {
    // Don't show auto prompts during beta testing
    if (BETA_TESTING_MODE) return false;
    return viewedPropertiesCount >= GUEST_LIMITS.SHOW_AUTH_PROMPT_AFTER;
  };

  // Don't render children until data is loaded
  if (!isLoaded) {
    return null;
  }

  return (
    <GuestTrackingContext.Provider
      value={{
        viewedPropertiesCount,
        hasReachedViewLimit,
        trackPropertyView,
        resetTracking,
        shouldShowAuthPrompt,
      }}
    >
      {children}
    </GuestTrackingContext.Provider>
  );
};

export const useGuestTracking = () => {
  const context = useContext(GuestTrackingContext);
  if (context === undefined) {
    throw new Error('useGuestTracking must be used within a GuestTrackingProvider');
  }
  return context;
};