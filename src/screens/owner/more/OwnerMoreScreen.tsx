import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  User,
  Shield,
  FileText,
  ChevronRight,
  LogOut,
  Info,
  Facebook,
} from 'lucide-react-native';
import { OwnerStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { useAuthContext } from '../../../context/AuthContext';
import { useUserType } from '../../../context/UserTypeContext';

type OwnerMoreNav = StackNavigationProp<OwnerStackParamList>;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
}

export const OwnerMoreScreen: React.FC = () => {
  const navigation = useNavigation<OwnerMoreNav>();
  const { user, logout } = useAuthContext();
  const { clearUserType, setUserType } = useUserType();

  const runLogout = async () => {
    try {
      await logout();
      setUserType('tenant');
      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.navigate('Main', {
          screen: 'TenantTabs',
          params: { screen: 'Search' },
        } as never);
      }
    } catch {
      // fallback
      clearUserType();
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      runLogout();
      return;
    }

    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: runLogout,
      },
    ]);
  };

  const menuItems: MenuItem[] = [
    {
      label: 'Profile',
      icon: <User size={22} color={colors.gray[700]} />,
      onPress: () => navigation.navigate('Profile'),
    },
    {
      label: 'About Us',
      icon: <Info size={22} color={colors.gray[700]} />,
      onPress: () => navigation.navigate('AboutUs'),
    },
    {
      label: 'Privacy Policy',
      icon: <Shield size={22} color={colors.gray[700]} />,
      onPress: () => navigation.navigate('PrivacyPolicy'),
    },
    {
      label: 'Terms and Conditions',
      icon: <FileText size={22} color={colors.gray[700]} />,
      onPress: () => navigation.navigate('TermsAndConditions'),
    },
    {
      label: 'Official Facebook Page',
      icon: <Facebook size={22} color={colors.gray[700]} />,
      onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=61587907074569'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.sectionLabel}>Account</Text>
        <View style={styles.menuList}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === menuItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={styles.menuItemLabel}>{item.label}</Text>
              </View>
              <ChevronRight size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.6}>
          <LogOut size={20} color={colors.error} />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>Beehauz v1.0</Text>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  content: {
    padding: 16,
  },
  sectionLabel: {
    fontSize: 13,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[500],
    marginTop: 24,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  menuList: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  menuItemFirst: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  menuItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  menuItemLabel: {
    fontSize: 15,
    fontFamily: 'Figtree_500Medium',
    color: colors.gray[800],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  logoutText: {
    fontSize: 15,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.error,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontFamily: 'Figtree_400Regular',
    color: colors.gray[400],
    marginTop: 24,
  },
});
