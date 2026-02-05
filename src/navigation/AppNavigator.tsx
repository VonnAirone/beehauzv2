import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { OwnerNavigator } from './OwnerNavigator';
import { TenantNavigator } from './TenantNavigator';
import { OnboardingContainer, WelcomeScreen } from '../screens/onboarding';
import { RootStackParamList } from './types';
import { useAuthContext } from '../context/AuthContext';
import { useUserType } from '../context/UserTypeContext';
import { useOnboarding } from '../context/OnboardingContext';
import { useWelcome } from '../context/WelcomeContext';
import { colors } from '../styles/colors';

const Stack = createStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F7F8FA',
    },
  };
  const { isAuthenticated, user } = useAuthContext();
  const { userType } = useUserType();
  const { isOnboardingCompleted, completeOnboarding, isLoading: onboardingLoading } = useOnboarding();
  const { isWelcomeCompleted, completeWelcome, isLoading: welcomeLoading } = useWelcome();

  // Determine if we should show auth or main app
  // Show auth only when explicitly requested (userType is null)
  // Otherwise, show main app with guest access enabled
  const shouldShowAuth = userType === null && !isAuthenticated;
  const currentUserType = user?.userType || 'tenant';
  
  // Show welcome screen first if not completed and not loading
  const showWelcome = !welcomeLoading && !isWelcomeCompleted;
  
  // Show onboarding if welcome is completed but onboarding is not completed and not loading
  const showOnboarding = !onboardingLoading && isWelcomeCompleted && !isOnboardingCompleted;

  return (
    <NavigationContainer theme={navTheme}>
      <View style={styles.appContainer}>
        <View style={styles.appHeader}>
          <Image source={require('../assets/logo-wordmark.png')} style={styles.logoImage} />
        </View>
        <View style={styles.appContent}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {showWelcome ? (
              <Stack.Screen 
                name="Welcome" 
                options={{ gestureEnabled: false }}
              >
                {() => <WelcomeScreen onComplete={completeWelcome} />}
              </Stack.Screen>
            ) : showOnboarding ? (
              <Stack.Screen 
                name="Onboarding" 
                options={{ gestureEnabled: false }}
              >
                {() => <OnboardingContainer onComplete={completeOnboarding} />}
              </Stack.Screen>
            ) : shouldShowAuth ? (
              <Stack.Screen name="Auth" component={AuthNavigator} />
            ) : (
              <Stack.Screen 
                name="Main" 
                component={currentUserType === 'owner' ? OwnerNavigator : TenantNavigator} 
              />
            )}
          </Stack.Navigator>
        </View>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  appHeader: {
    height: 80,
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoText: {
    color: colors.primary,
    fontSize: 20,
    fontFamily: 'Figtree_700Bold',
    letterSpacing: 0.3,
  },
  logoImage: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  appContent: {
    flex: 1,
  },
});