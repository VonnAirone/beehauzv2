import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WelcomeContextType {
  isWelcomeCompleted: boolean;
  completeWelcome: () => Promise<void>;
  isLoading: boolean;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

interface WelcomeProviderProps {
  children: ReactNode;
}

export const WelcomeProvider: React.FC<WelcomeProviderProps> = ({ children }) => {
  const [isWelcomeCompleted, setIsWelcomeCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const WELCOME_STORAGE_KEY = '@beehauz_welcome_completed';

  useEffect(() => {
    checkWelcomeStatus();
  }, []);

  const checkWelcomeStatus = async () => {
    try {
      setIsLoading(true);
      const completed = await AsyncStorage.getItem(WELCOME_STORAGE_KEY);
      setIsWelcomeCompleted(completed === 'true');
    } catch (error) {
      console.error('Error checking welcome status:', error);
      setIsWelcomeCompleted(false);
    } finally {
      setIsLoading(false);
    }
  };

  const completeWelcome = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_STORAGE_KEY, 'true');
      setIsWelcomeCompleted(true);
    } catch (error) {
      console.error('Error completing welcome:', error);
    }
  };

  return (
    <WelcomeContext.Provider
      value={{
        isWelcomeCompleted,
        completeWelcome,
        isLoading,
      }}
    >
      {children}
    </WelcomeContext.Provider>
  );
};

export const useWelcome = (): WelcomeContextType => {
  const context = useContext(WelcomeContext);
  
  if (context === undefined) {
    throw new Error('useWelcome must be used within a WelcomeProvider');
  }
  
  return context;
};