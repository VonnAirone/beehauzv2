import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Search, Calendar, Bell, User, MapPin, Ellipsis } from 'lucide-react-native';
import { TenantStackParamList, TenantTabParamList } from './types';
import { SearchScreen } from '../screens/tenant/search/SearchScreen';
import { MapViewScreen } from '../screens/tenant/map';
import { MyBookingsScreen } from '../screens/tenant/bookings/MyBookingsScreen';
import { NotificationsScreen } from '../screens/tenant/notifications';
import { BoardingHouseDetailScreen } from '../screens/tenant/boarding-house-detail';
import { BlogDetailScreen } from '../screens/tenant/blog';
import { FavoritesListScreen } from '../screens/tenant/favorites';
import { StudentProfileScreen } from '../screens/tenant/profile/StudentProfileScreen';
import { MoreScreen } from '../screens/tenant/more/MoreScreen';
import { MyStayScreen } from '../screens/tenant/my-stay/MyStayScreen';
import { PersonalInformationScreen, EditProfileScreen, AboutUsScreen } from '../screens/shared/profile';
import { PrivacyPolicyScreen } from '../screens/shared/PrivacyPolicyScreen';
import { TermsAndConditionsScreen } from '../screens/shared/TermsAndConditionsScreen';
import { colors } from '../styles/colors';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar } from '../components/common/DesktopSidebar';
import { useAuthContext } from '../context/AuthContext';
import { supabase } from '../services/supabase';
import { AuthPromptModal } from '../components/common/AuthPromptModal';
import { FeatureType } from '../utils/guestAccess';

const Tab = createBottomTabNavigator<TenantTabParamList>();
const Stack = createStackNavigator<TenantStackParamList>();

const TenantTabs: React.FC = () => {
  const { isDesktop, isWeb } = useResponsive();
  const [activeTab, setActiveTab] = useState<string>('Search');
  const navigation = useNavigation<StackNavigationProp<TenantStackParamList>>();
  const { isAuthenticated, user } = useAuthContext();
  const [hasBookingUpdates, setHasBookingUpdates] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const checkUpdates = async () => {
      const { count } = await supabase
        .from('booking_requests')
        .select('id', { count: 'exact', head: true })
        .eq('requester_id', user.id)
        .in('status', ['accepted', 'rejected']);

      setHasBookingUpdates((count ?? 0) > 0);
    };

    checkUpdates();
  }, [isAuthenticated, user?.id]);

  // Auth prompt modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authFeature, setAuthFeature] = useState<FeatureType>('access_bookings');

  // Tabs that require authentication
  const authRequiredTabs: Record<string, FeatureType> = {
    'MyBookings': 'access_bookings',
    'Notifications': 'access_notifications',
  };

  const handleAuthRequired = (tabName: string) => {
    const feature = authRequiredTabs[tabName];
    if (feature) {
      setAuthFeature(feature);
      setShowAuthModal(true);
    }
  };

  const handleSignUp = () => {
    setShowAuthModal(false);
    // Navigate to signup screen
    navigation.getParent()?.navigate('Auth', { screen: 'Register' });
  };

  const handleLogin = () => {
    setShowAuthModal(false);
    // Navigate to login screen
    navigation.getParent()?.navigate('Auth', { screen: 'Login' });
  };

  // Create navigation items with dynamic colors based on active tab
  const getNavigationItems = () => [
    {
      name: 'Search',
      label: 'Search',
      icon: (
        <Search
          color={activeTab === 'Search' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'Map',
      label: 'Map',
      icon: (
        <MapPin
          color={activeTab === 'Map' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    { 
      name: 'MyBookings',
      label: 'Bookings',
      icon: (
        <Calendar
          color={activeTab === 'MyBookings' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'Notifications',
      label: 'Notifications',
      icon: (
        <Bell
          color={activeTab === 'Notifications' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'More',
      label: 'More',
      icon: (
        <Ellipsis
          color={activeTab === 'More' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
  ];

  const navigationItems = getNavigationItems();

  const handleTabPress = (tabName: string) => {
    setActiveTab(tabName);
    navigation.navigate('TenantTabs', {
      screen: tabName as keyof TenantTabParamList,
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Tab.Navigator
          initialRouteName='Search'
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.gray[400],
            headerShown: false,
            tabBarStyle: isDesktop && isWeb ? styles.hiddenTabBar : undefined,
          }}
          screenListeners={{
            tabPress: (e) => {
              const routeName = e.target?.split('-')[0] ?? '';
              
              // Check if the tab requires authentication
              if (!isAuthenticated && authRequiredTabs[routeName]) {
                e.preventDefault();
                handleAuthRequired(routeName);
                return;
              }
              
              if (routeName) {
                setActiveTab(routeName);
                if (routeName === 'MyBookings') setHasBookingUpdates(false);
              }
            },
          }}
        >
          <Tab.Screen 
            name="Search" 
            component={SearchScreen}
            options={{
              tabBarLabel: 'Search',
              tabBarIcon: ({ color, size }) => (
                <Search color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Map"
            component={MapViewScreen}
            options={{
              tabBarLabel: 'Map',
              tabBarIcon: ({ color, size }) => (
                <MapPin color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="MyBookings"
            component={MyBookingsScreen}
            options={{
              tabBarLabel: 'Bookings',
              tabBarIcon: ({ color, size }) => (
                <Calendar color={color} size={size} />
              ),
              tabBarBadge: hasBookingUpdates ? '' : undefined,
              tabBarBadgeStyle: hasBookingUpdates ? {
                backgroundColor: '#EF4444',
                minWidth: 10,
                maxHeight: 10,
                borderRadius: 5,
                fontSize: 0,
                top: 2,
              } : undefined,
            }}
          />
          {/* <Tab.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              tabBarLabel: 'Notifications',
              tabBarIcon: ({ color, size }) => (
                <Bell color={color} size={size} />
              ),
            }}
          /> */}
          <Tab.Screen
            name="More"
            component={MoreScreen}
            options={{
              tabBarLabel: 'More',
              tabBarIcon: ({ color, size }) => (
                <Ellipsis color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
      
      {/* Auth Prompt Modal for protected tabs */}
      <AuthPromptModal
        visible={showAuthModal}
        feature={authFeature}
        onClose={() => setShowAuthModal(false)}
        onSignUp={handleSignUp}
        onLogin={handleLogin}
      />
    </View>
  );
};

export const TenantNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="TenantTabs" component={TenantTabs} />
      <Stack.Screen name="MapView" component={MapViewScreen} />
      <Stack.Screen name="BoardingHouseDetail" component={BoardingHouseDetailScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="FavoritesList" component={FavoritesListScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
      <Stack.Screen name="MyStay" component={MyStayScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  content: {
    flex: 1,
  },
  hiddenTabBar: {
    display: 'none',
  },
});