import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { NavigationContainer, DefaultTheme, createNavigationContainerRef } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthNavigator } from './AuthNavigator';
import { OwnerNavigator } from './OwnerNavigator';
import { TenantNavigator } from './TenantNavigator';
import { RootStackParamList } from './types';
import { useAuthContext } from '../context/AuthContext';
import { useUserType } from '../context/UserTypeContext';
import { colors } from '../styles/colors';

const Stack = createStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const navTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: '#F7F8FA',
    },
  };
  const { isAuthenticated, user, isLoading } = useAuthContext();
  const { userType, clearUserType, setPendingAuthAction, setUserType } = useUserType();
  const [logoNavigatePending, setLogoNavigatePending] = React.useState(false);

  // Determine if we should show auth or main app
  // Show auth only when explicitly requested (userType is null)
  // Otherwise, show main app with guest access enabled
  const shouldShowAuth = userType === null && !isAuthenticated;
  const currentUserType = user?.userType || 'tenant';
  
  const handleLoginPress = () => {
    setPendingAuthAction('login');
    clearUserType();
  };

  const handleLogoPress = () => {
    if (!navigationRef.isReady()) return;

    if (!isAuthenticated && userType === null) {
      setUserType('tenant');
      setLogoNavigatePending(true);
      return;
    }

    navigationRef.navigate({ name: 'Main', params: undefined } as never);
  };

  const handleProfilePress = () => {
    if (!navigationRef.isReady()) return;

    if (currentUserType === 'owner') {
      navigationRef.navigate({ name: 'Main', params: { screen: 'Profile' } } as never);
      return;
    }

    navigationRef.navigate({ name: 'Main', params: { screen: 'StudentProfile' } } as never);
  };

  React.useEffect(() => {
    if (!logoNavigatePending || shouldShowAuth || !navigationRef.isReady()) return;

    navigationRef.navigate({ name: 'Main', params: undefined } as never);

    setLogoNavigatePending(false);
  }, [logoNavigatePending, shouldShowAuth, currentUserType]);

  const displayName = user?.fullName || user?.email || 'Profile';

  return (
    <NavigationContainer theme={navTheme} ref={navigationRef}>
      <View style={styles.appContainer}>
        <View style={styles.appHeader}>
          <TouchableOpacity onPress={handleLogoPress}>
            <Image source={require('../assets/logo-wordmark.png')} style={styles.logoImage} />
          </TouchableOpacity>
          
          {isLoading ? (
            <View style={styles.headerLoading}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : isAuthenticated ? (
            <TouchableOpacity style={styles.profileBadge} onPress={handleProfilePress}>
              <Text style={styles.profileName} numberOfLines={1}>
                {displayName}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.loginButton} onPress={handleLoginPress}>
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.appContent}>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {shouldShowAuth ? (
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
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
    position: 'relative',
    left: -30,
    width: 200,
    height: 100,
    resizeMode: 'contain',
  },
  loginButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  loginButtonText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: 'Figtree_600SemiBold',
  },
  profileBadge: {
    maxWidth: 160,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
  },
  profileName: {
    color: colors.gray[800],
    fontSize: 12,
    fontFamily: 'Figtree_600SemiBold',
  },
  headerLoading: {
    minWidth: 80,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appContent: {
    flex: 1,
  },
});