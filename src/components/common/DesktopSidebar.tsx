import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image } from 'react-native';
import { LogOut } from 'lucide-react-native';
import { colors } from '../../styles/colors';
import { logWarn } from '../../utils/logger';

interface NavigationItem {
  name: string;
  label: string;
  icon: React.ReactNode;
}

interface DesktopSidebarProps {
  items: NavigationItem[];
  activeRoute: string;
  onNavigate: (routeName: string) => void;
  onLogout?: () => void;
}

export const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  items,
  activeRoute,
  onNavigate,
  onLogout,
}) => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.sidebar}>

      <View style={styles.nav}>
        {items.map((item) => {
          const isActive = activeRoute === item.name;

          const handlePress = () => {
            try {
              onNavigate(item.name);
            } catch (error) {
              logWarn('Navigation failed', {
                targetRoute: item.name,
                error: error instanceof Error ? error.message : 'Unknown error'
              });
            }
          };

          return (
            <TouchableOpacity
              key={item.name}
              style={[styles.navItem, isActive && styles.navItemActive]}
              onPress={handlePress}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>{item.icon}</View>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {onLogout && (
        <View style={styles.logoutContainer}>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={onLogout}
            activeOpacity={0.7}
          >
            <View style={styles.iconContainer}>
              <LogOut size={20} color={colors.error} />
            </View>
            <Text style={styles.logoutLabel}>Logout</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 250,
    height: '100%',
    backgroundColor: colors.white,
    borderRightWidth: 1,
    borderRightColor: colors.gray[200],
    paddingVertical: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  logoImage: {
    width: 200,
    height: 80,
  },
  nav: {
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 12,
    borderRadius: 8,
    cursor: 'pointer' as any,
  },
  navItemActive: {
    backgroundColor: colors.primary + '20',
  },
  iconContainer: {
    marginRight: 12,
  },
  navLabel: {
    fontSize: 16,
    color: colors.gray[700],
    fontWeight: '500'
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  logoutContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    marginHorizontal: 12,
    borderRadius: 8,
    cursor: 'pointer' as any,
  },
  logoutLabel: {
    fontSize: 16,
    color: colors.error,
    fontWeight: '500',
  },
});
