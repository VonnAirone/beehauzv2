import React, { createContext, useContext, ReactNode, useState } from 'react';

type UserType = 'owner' | 'tenant' | 'admin';
type AuthAction = 'login' | 'signup' | null;

interface UserTypeContextType {
  userType: UserType | null;
  pendingAuthAction: AuthAction;
  setUserType: (type: UserType) => void;
  clearUserType: () => void;
  setPendingAuthAction: (action: AuthAction) => void;
}

const UserTypeContext = createContext<UserTypeContextType | undefined>(undefined);

interface UserTypeProviderProps {
  children: ReactNode;
}

export const UserTypeProvider: React.FC<UserTypeProviderProps> = ({ children }) => {
  // Default to 'tenant' to provide immediate access to the tenant experience
  const [userType, setUserTypeState] = useState<UserType | null>('tenant');
  const [pendingAuthAction, setPendingAuthActionState] = useState<AuthAction>(null);

  const setUserType = (type: UserType) => {
    setUserTypeState(type);
  };

  const clearUserType = () => {
    setUserTypeState(null);
  };

  const setPendingAuthAction = (action: AuthAction) => {
    setPendingAuthActionState(action);
  };

  return (
    <UserTypeContext.Provider value={{
      userType,
      pendingAuthAction,
      setUserType,
      clearUserType,
      setPendingAuthAction,
    }}>
      {children}
    </UserTypeContext.Provider>
  );
};

export const useUserType = (): UserTypeContextType => {
  const context = useContext(UserTypeContext);
  
  if (context === undefined) {
    throw new Error('useUserType must be used within a UserTypeProvider');
  }
  
  return context;
};