import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Heart, ChevronRight } from 'lucide-react-native';
import { Button, Card } from '../../../components/common';
import { useUserType } from '../../../context/UserTypeContext';
import { useAuthContext } from '../../../context/AuthContext';
import { useFavorites } from '../../../context/FavoritesContext';
import { TenantStackParamList } from '../../../navigation/types';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

type ProfileScreenNavigationProp = StackNavigationProp<TenantStackParamList>;

export const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { userType, clearUserType, setUserType } = useUserType();
  const { user, logout, isAuthenticated } = useAuthContext();
  const { favorites } = useFavorites();

  // Sync userType context with authenticated user's type
  useEffect(() => {
    if (isAuthenticated && user?.userType && userType !== user.userType) {
      setUserType(user.userType);
    }
  }, [isAuthenticated, user?.userType, userType, setUserType]);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            clearUserType();
            await logout();
          },
        },
      ]
    );
  };

  const handleCreateAccount = () => {
    clearUserType(); // This will trigger navigation to auth screen
  };



  const displayName = user?.fullName || (isAuthenticated ? user?.email?.split('@')[0] || 'User' : 'Guest User');
  const displayEmail = user?.email || (isAuthenticated ? 'user@example.com' : 'Sign up to save your preferences');
  const userTypeDisplay = user?.userType === 'owner' ? 'Property Owner' : (isAuthenticated ? 'Student/Tenant' : 'Browsing as Guest');

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.header}>
        <View style={[styles.avatar, !isAuthenticated && styles.guestAvatar]}>
          <Text style={[typography.textStyles.h3, styles.avatarText]}>
            {isAuthenticated 
              ? (user?.fullName 
                  ? user.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase()
                  : user?.email?.[0]?.toUpperCase() || 'U'
                )
              : '?'
            }
          </Text>
        </View>
        <Text style={[typography.textStyles.h3, styles.name]}>{displayName}</Text>
        <Text style={[typography.textStyles.body, styles.userType]}>{userTypeDisplay}</Text>
        {!isAuthenticated && (
          <Text style={[typography.textStyles.caption, styles.guestSubtext]}>
            Create an account to personalize your experience
          </Text>
        )}
      </View>

      {!isAuthenticated ? (
        // Guest User Experience
        <>
          <Card style={styles.guestCard}>
            <Text style={[typography.textStyles.h4, styles.guestTitle]}>
              Create Your Account
            </Text>
            <Text style={[typography.textStyles.body, styles.guestDescription]}>
              Sign up to unlock all features and save your favorite properties!
            </Text>
            
            <View style={styles.benefitsList}>
              <Text style={[typography.textStyles.body, styles.benefitItem]}>
                • Save favorite boarding houses
              </Text>
              <Text style={[typography.textStyles.body, styles.benefitItem]}>
                • Contact property owners directly
              </Text>
              <Text style={[typography.textStyles.body, styles.benefitItem]}>
                • Book properties instantly
              </Text>
              <Text style={[typography.textStyles.body, styles.benefitItem]}>
                • Access exclusive deals
              </Text>
              <Text style={[typography.textStyles.body, styles.benefitItem]}>
                • Get personalized recommendations
              </Text>
            </View>

            <Button
              title="Create Free Account"
              variant="primary"
              style={styles.createAccountButton}
              onPress={handleCreateAccount}
            />
          </Card>

          <Card style={styles.card}>
            <View style={styles.infoRow}>
              <TouchableOpacity 
                style={styles.favoritesButton}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                <Text style={[typography.textStyles.body, styles.label]}>Privacy Policy</Text>
                <ChevronRight size={16} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>

            <View style={styles.infoRow}>
              <TouchableOpacity 
                style={styles.favoritesButton}
                onPress={() => navigation.navigate('AboutUs')}
              >
                <Text style={[typography.textStyles.body, styles.label]}>About BeeHauz</Text>
                <ChevronRight size={16} color={colors.gray[400]} />
              </TouchableOpacity>
            </View>
          </Card>
        </>
      ) : (
        // Authenticated User Experience
        <Card style={styles.card}>
          {/* Show tenant features for all authenticated users (most are tenants) */}
          {(user?.userType === 'tenant' || userType === 'tenant' || !user?.userType) && (
            <>
              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('PersonalInformation')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Personal Information</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('FavoritesList')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Favorites</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => {
                    Alert.alert('Change Password', 'Password change feature coming soon!');
                  }}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Change Password</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => {
                    Alert.alert('Notifications', 'Notification settings coming soon!');
                  }}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Notifications Settings</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Privacy Policy</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('AboutUs')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>About Us</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </>
          )}
          
          {/* Owner-specific menu items */}
          {user?.userType === 'owner' && (
            <>
              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => {
                    Alert.alert('Owner Dashboard', 'Owner features coming soon!');
                  }}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Manage Properties</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('PrivacyPolicy')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>Privacy Policy</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>

              <View style={styles.infoRow}>
                <TouchableOpacity 
                  style={styles.favoritesButton}
                  onPress={() => navigation.navigate('AboutUs')}
                >
                  <Text style={[typography.textStyles.body, styles.label]}>About Us</Text>
                  <ChevronRight size={16} color={colors.gray[400]} />
                </TouchableOpacity>
              </View>
            </>
          )}
        </Card>
      )}

      {isAuthenticated ? (
        <Button
          title="Logout"
          variant="primary"
          style={[styles.button, styles.logoutButton]}
          onPress={handleLogout}
        />
      ) : (
        <Button
          title="Sign In to Existing Account"
          variant="outline"
          style={[styles.button, styles.logoutButton]}
          onPress={handleCreateAccount}
        />
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingTop: 50, // Added top padding for status bar
  },
  scrollContent: {
    paddingBottom: 50, // Add bottom padding for bottom navigation
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 5,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  avatarText: {
    color: '#FFFFFF',
  },
  name: {
    color: '#333',
    marginBottom: 5,
  },
  userType: {
    color: '#666',
  },
  card: {
    marginHorizontal: 20,
    marginBottom: 10,
    gap: 10,
  },
  cardTitle: {
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  label: {
    color: '#666',
  },
  value: {
    color: '#333',
  },
  button: {
    marginVertical: 5,
  },
  logoutButton: {
    marginHorizontal: 20,
    marginVertical: 5,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  viewAllText: {
    color: colors.primary,
    fontFamily: 'Figtree_500Medium',
  },
  emptyFavorites: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 12,
  },
  emptyFavoritesText: {
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: 22,
  },
  // Favorites button styles
  favoritesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1,

  },
  favoritesButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favoritesButtonText: {
    color: colors.gray[700],
  },
  // Guest-specific styles
  guestCard: {
    marginHorizontal: 20,
    marginBottom: 5,
    padding: 20,
  },
  guestTitle: {
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 8,
  },
  guestDescription: {
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  benefitsList: {
    marginBottom: 20,
    gap: 8,
  },
  benefitItem: {
    color: colors.gray[700],
    paddingLeft: 8,
    lineHeight: 18,
  },
  createAccountButton: {
    backgroundColor: colors.primary,
    marginTop: 8,
  },
  guestAvatar: {
    backgroundColor: colors.gray[400], // Different color for guest
  },
  guestSubtext: {
    color: colors.gray[500],
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});