import React, { createContext, useContext, ReactNode, useState } from 'react';

interface WelcomeContextType {
  isWelcomeCompleted: boolean;
  completeWelcome: () => void;
  isLoading: boolean;
}

const WelcomeContext = createContext<WelcomeContextType | undefined>(undefined);

interface WelcomeProviderProps {
  children: ReactNode;
}

export const WelcomeProvider: React.FC<WelcomeProviderProps> = ({ children }) => {
  const [isWelcomeCompleted, setIsWelcomeCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // No loading needed since we always show welcome

  // Remove useEffect and checkWelcomeStatus - we always want to show welcome screen

  const completeWelcome = () => {
    // No need to save to AsyncStorage since we want to show every time
    setIsWelcomeCompleted(true);
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