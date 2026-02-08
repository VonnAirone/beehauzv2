import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { LayoutDashboard, Home, Calendar, User } from 'lucide-react-native';
import { OwnerStackParamList } from './types';
import { OwnerDashboardScreen } from '../screens/owner/dashboard/DashboardScreen';
import { PropertiesScreen } from '../screens/owner/properties/PropertiesScreen';
import { BookingRequestsScreen } from '../screens/owner/bookings/BookingRequestsScreen';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { colors } from '../styles/colors';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar } from '../components/common/DesktopSidebar';

const Tab = createBottomTabNavigator<OwnerStackParamList>();

export const OwnerNavigator: React.FC = () => {
  const { isDesktop, isWeb } = useResponsive();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const navigation = useNavigation<any>();

  // Create navigation items with dynamic colors based on active tab
  const getNavigationItems = () => [
    {
      name: 'Dashboard',
      label: 'Dashboard',
      icon: (
        <LayoutDashboard
          color={activeTab === 'Dashboard' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'Properties',
      label: 'Properties',
      icon: (
        <Home
          color={activeTab === 'Properties' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'BookingRequests',
      label: 'Bookings',
      icon: (
        <Calendar
          color={activeTab === 'BookingRequests' ? colors.primary : colors.gray[600]}
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
    navigation.navigate('Main', { screen: tabName });
  };

  return (
    <View style={styles.container}>
      {isDesktop && isWeb && (
        <DesktopSidebar 
          items={navigationItems}
          activeRoute={activeTab}
          onNavigate={handleTabPress}
        />
      )}
      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.gray[400],
            headerShown: false,
            tabBarStyle: isDesktop && isWeb ? styles.hiddenTabBar : undefined,
          }}
          screenListeners={{
            tabPress: (e) => {
              const routeName = e.target?.split('-')[0] ?? '';
              if (routeName) setActiveTab(routeName);
            },
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
      </View>
    </View>
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