import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Linking } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
  User,
  Heart,
  Shield,
  FileText,
  Home,
  House,
  ChevronRight,
  LogOut,
  Info,
  HelpCircle,
  Facebook,
} from 'lucide-react-native';
import { TenantStackParamList } from '../../../navigation/types';
import { colors } from '../../../styles/colors';
import { useAuthContext } from '../../../context/AuthContext';
import { useUserType } from '../../../context/UserTypeContext';
import { AuthPromptModal } from '../../../components/common';
import { FeatureType } from '../../../utils/guestAccess';
import { supabase } from '../../../services/supabase';

type MoreScreenNav = StackNavigationProp<TenantStackParamList>;

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  onPress: () => void;
  requiresAuth?: boolean;
}

export const MoreScreen: React.FC = () => {
  const navigation = useNavigation<MoreScreenNav>();
  const { isAuthenticated, logout, user } = useAuthContext();
  const { clearUserType, setUserType } = useUserType();
  const [authPromptVisible, setAuthPromptVisible] = useState(false);
  const [authFeature, setAuthFeature] = useState<FeatureType>('access_profile');
  const [hasActiveTenancy, setHasActiveTenancy] = useState(false);

  const checkActiveTenancy = useCallback(async () => {
    if (!isAuthenticated || !user?.id) {
      setHasActiveTenancy(false);
      return;
    }

    const { data } = await supabase
      .from('tenants')
      .select('id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .is('date_left', null)
      .limit(1)
      .maybeSingle();

    setHasActiveTenancy(!!data);
  }, [isAuthenticated, user?.id]);

  // Re-check when the screen comes back into focus (e.g. after move-out)
  useFocusEffect(
    useCallback(() => {
      checkActiveTenancy();
    }, [checkActiveTenancy])
  );

  const handleAuthRequired = (feature: FeatureType, action: () => void) => {
    if (!isAuthenticated) {
      setAuthFeature(feature);
      setAuthPromptVisible(true);
    } else {
      action();
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await logout();
          clearUserType();
        },
      },
    ]);
  };

  const handleSwitchToOwner = () => {
    Alert.alert(
      'Switch to Owner',
      'You will be redirected to the owner sign-up page to register your property.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => {
            clearUserType();
          },
        },
      ]
    );
  };

  const menuItems: MenuItem[] = [
    ...(hasActiveTenancy ? [{
      label: 'My Stay',
      icon: <House size={22} color={colors.primary} />,
      onPress: () => navigation.navigate('MyStay'),
    }] : []),
    {
      label: 'Profile',
      icon: <User size={22} color={colors.gray[700]} />,
      onPress: () => handleAuthRequired('access_profile', () => navigation.navigate('StudentProfile')),
      requiresAuth: true,
    },
    {
      label: 'Saved Properties',
      icon: <Heart size={22} color={colors.gray[700]} />,
      onPress: () => handleAuthRequired('save_favorites', () => navigation.navigate('FavoritesList')),
      requiresAuth: true,
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

  const ownerItems: MenuItem[] = [
    {
      label: 'Add your Property',
      icon: <Home size={22} color={colors.primary} />,
      onPress: handleSwitchToOwner,
    },
    {
      label: 'How to Become a Partner?',
      icon: <HelpCircle size={22} color={colors.primary} />,
      onPress: () => Linking.openURL('https://www.facebook.com/profile.php?id=61587907074569'),
    },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.sectionLabel}>Settings</Text>
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
                <Text style={styles.menuItemLabel}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.gray[400]} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>For Property Owners</Text>
        <View style={styles.menuList}>
          {ownerItems.map((item, index) => (
            <TouchableOpacity
              key={item.label}
              style={[
                styles.menuItem,
                index === 0 && styles.menuItemFirst,
                index === ownerItems.length - 1 && styles.menuItemLast,
              ]}
              onPress={item.onPress}
              activeOpacity={0.6}
            >
              <View style={styles.menuItemLeft}>
                {item.icon}
                <Text style={[styles.menuItemLabel, styles.menuItemLabelHighlight]}>
                  {item.label}
                </Text>
              </View>
              <ChevronRight size={18} color={colors.primary} />
            </TouchableOpacity>
          ))}
        </View>

        {isAuthenticated && (
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.6}>
            <LogOut size={20} color={colors.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.versionText}>Beehauz v1.0</Text>
      </ScrollView>

      <AuthPromptModal
        visible={authPromptVisible}
        feature={authFeature}
        onClose={() => setAuthPromptVisible(false)}
        onSignUp={() => {
          setAuthPromptVisible(false);
          clearUserType();
        }}
        onLogin={() => {
          setAuthPromptVisible(false);
          clearUserType();
        }}
      />
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
  menuItemLabelHighlight: {
    color: colors.primary,
    fontFamily: 'Figtree_600SemiBold',
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
