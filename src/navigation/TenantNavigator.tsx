import React, { useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { Search, Calendar, Bell, User, MapPin } from 'lucide-react-native';
import { TenantStackParamList, TenantTabParamList } from './types';
import { SearchScreen } from '../screens/tenant/search/SearchScreen';
import { MapScreen } from '../screens/tenant/map/MapScreen';
import { MyBookingsScreen } from '../screens/tenant/bookings/MyBookingsScreen';
import { NotificationsScreen } from '../screens/tenant/notifications';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { BoardingHouseDetailScreen } from '../screens/tenant/boarding-house-detail';
import { BlogDetailScreen } from '../screens/tenant/blog';
import { FavoritesListScreen } from '../screens/tenant/favorites';
import { PersonalInformationScreen, EditProfileScreen, AboutUsScreen } from '../screens/shared/profile';
import { PrivacyPolicyScreen } from '../screens/shared/PrivacyPolicyScreen';
import { colors } from '../styles/colors';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar } from '../components/common/DesktopSidebar';

const Tab = createBottomTabNavigator<TenantTabParamList>();
const Stack = createStackNavigator<TenantStackParamList>();

const TenantTabs: React.FC = () => {
  const { isDesktop, isWeb } = useResponsive();
  const [activeTab, setActiveTab] = useState<string>('Search');
  const navigation = useNavigation<StackNavigationProp<TenantStackParamList>>();

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
      name: 'Profile',
      label: 'Profile',
      icon: (
        <User
          color={activeTab === 'Profile' ? colors.primary : colors.gray[600]}
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
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.gray[400],
            headerShown: false,
            tabBarStyle: isWeb ? styles.hiddenTabBar : undefined,
          }}
          screenListeners={{
            tabPress: (e) => {
              const routeName = e.target?.split('-')[0] ?? '';
              if (routeName) setActiveTab(routeName);
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
            component={MapScreen}
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
            }}
          />
          <Tab.Screen 
            name="Notifications" 
            component={NotificationsScreen}
            options={{
              tabBarLabel: 'Notifications',
              tabBarIcon: ({ color, size }) => (
                <Bell color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
              tabBarIcon: ({ color, size }) => (
                <User color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
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
      <Stack.Screen name="BoardingHouseDetail" component={BoardingHouseDetailScreen} />
      <Stack.Screen name="BlogDetail" component={BlogDetailScreen} />
      <Stack.Screen name="FavoritesList" component={FavoritesListScreen} />
      <Stack.Screen name="PersonalInformation" component={PersonalInformationScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
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