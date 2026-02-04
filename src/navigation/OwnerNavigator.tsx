import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { LayoutDashboard, Home, Calendar, User } from 'lucide-react-native';
import { OwnerStackParamList } from './types';
import { OwnerDashboardScreen } from '../screens/owner/dashboard/DashboardScreen';
import { PropertiesScreen } from '../screens/owner/properties/PropertiesScreen';
import { BookingRequestsScreen } from '../screens/owner/bookings/BookingRequestsScreen';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { colors } from '../styles/colors';

const Tab = createBottomTabNavigator<OwnerStackParamList>();

export const OwnerNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray[400],
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={OwnerDashboardScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Properties" 
        component={PropertiesScreen}
        options={{
          tabBarLabel: 'Properties',
          tabBarIcon: ({ color, size }) => (
            <Home color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="BookingRequests" 
        component={BookingRequestsScreen}
        options={{
          tabBarLabel: 'Bookings',
          tabBarIcon: ({ color, size }) => (
            <Calendar color={color} size={size} />
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