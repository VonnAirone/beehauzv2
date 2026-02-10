import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Users, UserCog } from 'lucide-react-native';
import { AdminStackParamList } from './types';
import { AdminTenantsScreen, AdminOwnersScreen } from '../screens/admin';
import { colors } from '../styles/colors';
import { useResponsive } from '../hooks/useResponsive';
import { useAuth } from '../hooks/useAuth';
import { useUserType } from '../context/UserTypeContext';
import { DesktopSidebar } from '../components/common/DesktopSidebar';
import { AdminAccessManager } from '../services/adminAccessManager';

const Tab = createBottomTabNavigator<AdminStackParamList>();

export const AdminNavigator: React.FC = () => {
  const { isDesktop, isWeb } = useResponsive();
  const [activeTab, setActiveTab] = useState<string>('Tenants');
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const { clearUserType } = useUserType();

  const getNavigationItems = () => [
    {
      name: 'Tenants',
      label: 'Tenants',
      icon: (
        <Users
          color={activeTab === 'Tenants' ? colors.primary : colors.gray[600]}
          size={20}
        />
      ),
    },
    {
      name: 'Owner',
      label: 'Owner',
      icon: (
        <UserCog
          color={activeTab === 'Owner' ? colors.primary : colors.gray[600]}
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

  const handleLogout = async () => {
    try {
      // Clear admin session from SecureStore first
      await AdminAccessManager.clearAdminAccess();

      // Then logout from Supabase (this also calls clearAdminAccess but doing it explicitly first ensures it's cleared)
      await logout();

      // Clear user type
      clearUserType();

      // Reset navigation stack to force return to auth screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    } catch (error) {
      if (__DEV__) console.error('Logout error:', error);

      // Even if there's an error, try to navigate away
      clearUserType();
      navigation.reset({
        index: 0,
        routes: [{ name: 'Auth' as never }],
      });
    }
  };

  return (
    <View style={styles.container}>
      {isDesktop && isWeb && (
        <DesktopSidebar
          items={navigationItems}
          activeRoute={activeTab}
          onNavigate={handleTabPress}
          onLogout={handleLogout}
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
            name="Tenants"
            component={AdminTenantsScreen}
            options={{
              tabBarLabel: 'Tenants',
              tabBarIcon: ({ color, size }) => (
                <Users color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="Owner"
            component={AdminOwnersScreen}
            options={{
              tabBarLabel: 'Owner',
              tabBarIcon: ({ color, size }) => (
                <UserCog color={color} size={size} />
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
