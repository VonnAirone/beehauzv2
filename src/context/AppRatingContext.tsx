import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface RatingTrigger {
  id: string;
  name: string;
  currentCount: number;
  threshold: number;
  description: string;
}

interface AppRatingContextType {
  // Rating state
  hasRated: boolean;
  shouldShowRating: boolean;
  currentTrigger: string | null;
  
  // Trigger tracking
  triggers: RatingTrigger[];
  incrementTrigger: (triggerId: string) => void;
  
  // Rating actions
  showRatingPrompt: (triggerId: string) => void;
  dismissRating: () => void;
  submitRating: (rating: number, feedback?: string) => Promise<void>;
  markAsRated: () => void;
  
  // Reset (for testing)
  resetRatingData: () => Promise<void>;
}

const AppRatingContext = createContext<AppRatingContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  HAS_RATED: '@app_rating_has_rated',
  TRIGGER_COUNTS: '@app_rating_trigger_counts',
  LAST_PROMPT: '@app_rating_last_prompt',
} as const;

// Default triggers with smart thresholds
const DEFAULT_TRIGGERS: RatingTrigger[] = [
  {
    id: 'app_opens',
    name: 'App Opens',
    currentCount: 0,
    threshold: 5, // After 5 app opens
    description: 'User has opened the app multiple times'
  },
  {
    id: 'properties_viewed',
    name: 'Properties Viewed',
    currentCount: 0,
    threshold: 10, // After viewing 10 properties
    description: 'User has browsed multiple properties'
  },
  {
    id: 'favorites_added',
    name: 'Favorites Added',
    currentCount: 0,
    threshold: 3, // After adding 3 favorites
    description: 'User is actively engaging with favorites'
  },
  {
    id: 'search_performed',
    name: 'Searches Performed',
    currentCount: 0,
    threshold: 8, // After 8 searches
    description: 'User is actively searching for properties'
  },
  {
    id: 'time_spent',
    name: 'Time Spent',
    currentCount: 0,
    threshold: 15, // After 15 minutes total (tracked in minutes)
    description: 'User has spent significant time in the app'
  },
  {
    id: 'successful_actions',
    name: 'Successful Actions',
    currentCount: 0,
    threshold: 5, // After 5 successful actions (bookings, contacts, etc.)
    description: 'User has completed meaningful actions'
  }
];

interface AppRatingProviderProps {
  children: ReactNode;
}

export const AppRatingProvider: React.FC<AppRatingProviderProps> = ({ children }) => {
  const [hasRated, setHasRated] = useState(false);
  const [shouldShowRating, setShouldShowRating] = useState(false);
  const [currentTrigger, setCurrentTrigger] = useState<string | null>(null);
  const [triggers, setTriggers] = useState<RatingTrigger[]>(DEFAULT_TRIGGERS);

  // Load data on mount
  useEffect(() => {
    loadRatingData();
  }, []);

  const loadRatingData = async () => {
    try {
      const [ratedStatus, triggerCounts] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.HAS_RATED),
        AsyncStorage.getItem(STORAGE_KEYS.TRIGGER_COUNTS)
      ]);

      if (ratedStatus === 'true') {
        setHasRated(true);
      }

      if (triggerCounts) {
        const counts = JSON.parse(triggerCounts);
        setTriggers(prev => prev.map(trigger => ({
          ...trigger,
          currentCount: counts[trigger.id] || 0
        })));
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading rating data:', error);
    }
  };

  const saveTriggerCounts = async (updatedTriggers: RatingTrigger[]) => {
    try {
      const counts = updatedTriggers.reduce((acc, trigger) => {
        acc[trigger.id] = trigger.currentCount;
        return acc;
      }, {} as Record<string, number>);

      await AsyncStorage.setItem(STORAGE_KEYS.TRIGGER_COUNTS, JSON.stringify(counts));
    } catch (error) {
      if (__DEV__) console.error('Error saving trigger counts:', error);
    }
  };

  const incrementTrigger = useCallback((triggerId: string) => {
    if (hasRated) return; // Don't track if user already rated

    setTriggers(prev => {
      const updated = prev.map(trigger => {
        if (trigger.id === triggerId) {
          const newCount = trigger.currentCount + 1;
          
          // Check if threshold is reached
          if (newCount >= trigger.threshold && !shouldShowRating) {
            setTimeout(() => showRatingPrompt(triggerId), 1000); // Delay to avoid interrupting current flow
          }
          
          return { ...trigger, currentCount: newCount };
        }
        return trigger;
      });

      saveTriggerCounts(updated);
      return updated;
    });
  }, [hasRated, shouldShowRating]);

  const showRatingPrompt = useCallback(async (triggerId: string) => {
    if (hasRated || shouldShowRating) return;

    try {
      // Check if we've shown a prompt recently (within 24 hours)
      const lastPrompt = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROMPT);
      if (lastPrompt) {
        const lastPromptTime = new Date(lastPrompt);
        const now = new Date();
        const hoursSinceLastPrompt = (now.getTime() - lastPromptTime.getTime()) / (1000 * 60 * 60);
        
        if (hoursSinceLastPrompt < 24) {
          return; // Don't show if shown recently
        }
      }

      setCurrentTrigger(triggerId);
      setShouldShowRating(true);
      
      // Save timestamp of this prompt
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROMPT, new Date().toISOString());
    } catch (error) {
      if (__DEV__) console.error('Error showing rating prompt:', error);
    }
  }, [hasRated, shouldShowRating]);

  const dismissRating = useCallback(() => {
    setShouldShowRating(false);
    setCurrentTrigger(null);
  }, []);

  const markAsRated = useCallback(async () => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.HAS_RATED, 'true');
      setHasRated(true);
    } catch (error) {
      if (__DEV__) console.error('Error marking as rated:', error);
    }
  }, []);

  const submitRating = useCallback(async (rating: number, feedback?: string) => {
    if (!currentTrigger) {
      throw new Error('No trigger context available');
    }

    try {
      // Import the service dynamically to avoid circular imports
      const { appRatingService } = await import('../services/appRatingService');
      
      const result = await appRatingService.submitAppRating({
        rating,
        feedback,
        trigger_type: currentTrigger,
        platform: 'mobile', // You can detect this dynamically
        app_version: '1.0.0', // You can get this from app config
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit rating');
      }

      await markAsRated();
      dismissRating();
    } catch (error) {
      if (__DEV__) console.error('Error submitting rating:', error);
      throw error;
    }
  }, [currentTrigger, dismissRating, markAsRated]);

  const resetRatingData = async () => {
    try {
      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.HAS_RATED),
        AsyncStorage.removeItem(STORAGE_KEYS.TRIGGER_COUNTS),
        AsyncStorage.removeItem(STORAGE_KEYS.LAST_PROMPT)
      ]);
      
      setHasRated(false);
      setShouldShowRating(false);
      setCurrentTrigger(null);
      setTriggers(DEFAULT_TRIGGERS);
    } catch (error) {
      if (__DEV__) console.error('Error resetting rating data:', error);
    }
  };

  return (
    <AppRatingContext.Provider value={{
      hasRated,
      shouldShowRating,
      currentTrigger,
      triggers,
      incrementTrigger,
      showRatingPrompt,
      dismissRating,
      submitRating,
      markAsRated,
      resetRatingData
    }}>
      {children}
    </AppRatingContext.Provider>
  );
};

export const useAppRating = (): AppRatingContextType => {
  const context = useContext(AppRatingContext);
  if (!context) {
    throw new Error('useAppRating must be used within an AppRatingProvider');
  }
  return context;
};