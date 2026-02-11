import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { LayoutDashboard, Home, CircleDollarSign, Ellipsis } from 'lucide-react-native';
import { OwnerStackParamList, OwnerTabParamList } from './types';
import { OwnerDashboardScreen } from '../screens/owner/dashboard/DashboardScreen';
import { PropertiesScreen } from '../screens/owner/properties/PropertiesScreen';
import { PaymentsScreen } from '../screens/owner/payments/PaymentsScreen';
import { OwnerMoreScreen } from '../screens/owner/more/OwnerMoreScreen';
import { ProfileScreen } from '../screens/shared/profile/ProfileScreen';
import { AboutUsScreen } from '../screens/shared/profile/AboutUsScreen';
import { PrivacyPolicyScreen } from '../screens/shared/PrivacyPolicyScreen';
import { TermsAndConditionsScreen } from '../screens/shared/TermsAndConditionsScreen';
import { colors } from '../styles/colors';
import { useResponsive } from '../hooks/useResponsive';
import { DesktopSidebar } from '../components/common/DesktopSidebar';

const Tab = createBottomTabNavigator<OwnerTabParamList>();
const Stack = createStackNavigator<OwnerStackParamList>();

const OwnerTabs: React.FC = () => {
  const { isDesktop, isWeb } = useResponsive();
  const [activeTab, setActiveTab] = useState<string>('Dashboard');
  const navigation = useNavigation<StackNavigationProp<OwnerStackParamList>>();

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
      name: 'Payments',
      label: 'Payments',
      icon: (
        <CircleDollarSign
          color={activeTab === 'Payments' ? colors.primary : colors.gray[600]}
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
    navigation.navigate('OwnerTabs', {
      screen: tabName as keyof OwnerTabParamList,
    });
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
            name="Payments"
            component={PaymentsScreen}
            options={{
              tabBarLabel: 'Payments',
              tabBarIcon: ({ color, size }) => (
                <CircleDollarSign color={color} size={size} />
              ),
            }}
          />
          <Tab.Screen
            name="More"
            component={OwnerMoreScreen}
            options={{
              tabBarLabel: 'More',
              tabBarIcon: ({ color, size }) => (
                <Ellipsis color={color} size={size} />
              ),
            }}
          />
        </Tab.Navigator>
      </View>
    </View>
  );
};

export const OwnerNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="OwnerTabs" component={OwnerTabs} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="AboutUs" component={AboutUsScreen} />
      <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
      <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: colors.primary
  },
  content: {
    flex: 1,
    
  },
  hiddenTabBar: {
    display: 'none',
  },
});
