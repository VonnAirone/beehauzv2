import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
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

const Tab = createBottomTabNavigator<TenantTabParamList>();
const Stack = createStackNavigator<TenantStackParamList>();

const TenantTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
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