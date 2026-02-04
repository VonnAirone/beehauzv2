import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { UserTypeProvider } from './src/context/UserTypeContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
import { OnboardingProvider } from './src/context/OnboardingContext';
import { GuestTrackingProvider } from './src/context/GuestTrackingContext';
import { WelcomeProvider } from './src/context/WelcomeContext';
import { AppRatingProvider, useAppRating } from './src/context/AppRatingContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AppRatingWrapper, HiddenAdminAccess } from './src/components/common';
import { useFigtreeFonts } from './src/hooks/useFonts';

// Component to track app opens
const AppOpenTracker: React.FC = () => {
  const { incrementTrigger } = useAppRating();
  
  React.useEffect(() => {
    // Track app open on mount
    incrementTrigger('app_opens');
  }, [incrementTrigger]);
  
  return null; // This component doesn't render anything
};

export default function App() {
  const { fontsLoaded } = useFigtreeFonts();

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF8B00" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <AppRatingProvider>
        <WelcomeProvider>
          <OnboardingProvider>
            <AuthProvider>
              <UserTypeProvider>
                <FavoritesProvider>
                  <GuestTrackingProvider>
                    <HiddenAdminAccess>
                      <AppNavigator />
                      <StatusBar style="auto" />
                      
                      {/* Track app opens */}
                      <AppOpenTracker />
                      
                      {/* Global App Rating Modal */}
                      <AppRatingWrapper />
                    </HiddenAdminAccess>
                  </GuestTrackingProvider>
                </FavoritesProvider>
              </UserTypeProvider>
            </AuthProvider>
          </OnboardingProvider>
        </WelcomeProvider>
      </AppRatingProvider>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});
