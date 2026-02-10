import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, GraduationCap, MapPin, Phone, Mail, Heart, Calendar, Edit3, Pen } from 'lucide-react-native';
import { Button, Card } from '../../../components/common';
import { useAuthContext } from '../../../context/AuthContext';
import { useFavorites } from '../../../context/FavoritesContext';
import { useUserType } from '../../../context/UserTypeContext';
import { TenantStackParamList } from '../../../navigation/types';
import { EditProfileScreen } from '../../shared/profile/EditProfileScreen';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

type StudentProfileNavigationProp = StackNavigationProp<TenantStackParamList, 'StudentProfile'>;

export const StudentProfileScreen: React.FC = () => {
  const navigation = useNavigation<StudentProfileNavigationProp>();
  const { user, logout, isAuthenticated } = useAuthContext();
  const { favorites } = useFavorites();
  const { clearUserType, setPendingAuthAction } = useUserType();
  const { width: windowWidth } = useWindowDimensions();
  const isSmallScreen = windowWidth < 768;
  const [isEditModalVisible, setEditModalVisible] = React.useState(false);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'Student';
  const displayEmail = user?.email || 'No email provided';
  
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently joined';

  const handleEditProfile = () => {
    setEditModalVisible(true);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
      setPendingAuthAction('login');
      clearUserType();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <SafeAreaView style={[styles.safeArea, {
        width: isSmallScreen ? '95%' : '70%'
      }]}  edges={['top']}>
        
      <View style={styles.header}>
        <Text style={[typography.textStyles.h3, styles.headerTitle]}>My Profile</Text>
        <TouchableOpacity style={styles.editIconButton} onPress={handleEditProfile}>
            <Pen size={18} color={colors.white} />
            <Text style={[typography.textStyles.button, {color: colors.white}]}>Edit Profile</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.profileCard}>

            <View style={styles.avatarAndEditRow}>
                <View style={styles.avatarRow}>
                    <View style={styles.avatar}>
                    <Text style={[typography.textStyles.h3, styles.avatarText]}>
                        {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
                    </Text>
                    </View>
                    <View style={styles.avatarInfo}>
                    <Text style={[typography.textStyles.h4, styles.name]}>{displayName}</Text>
                    <Text style={[typography.textStyles.caption, styles.caption]}>{displayEmail}</Text>
                    </View>
                </View>
            </View>        
        </Card>

        <View style={[styles.sectionRow, isSmallScreen && styles.sectionColumn]}>
          <Card style={[styles.sectionCard, styles.sectionCardHalf, isSmallScreen && styles.sectionCardFull]}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Contact</Text>
            <View style={styles.infoRow}>
              <Mail size={18} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{displayEmail}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Phone size={18} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone</Text>
                <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
              </View>
            </View>
          </Card>

          <Card style={[styles.sectionCard, styles.sectionCardHalf, isSmallScreen && styles.sectionCardFull]}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Student Information</Text>
            <View style={styles.infoRow}>
              <GraduationCap size={18} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>University</Text>
                <Text style={styles.infoValue}>{user?.university || 'Not specified'}</Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <GraduationCap size={18} color={colors.primary} />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Year Level</Text>
                <Text style={styles.infoValue}>{user?.yearLevel || 'Not specified'}</Text>
              </View>
            </View>
          </Card>
        </View>

        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Saved Houses</Text>
            <Text style={styles.sectionMeta}>{favorites.length} total</Text>
          </View>

          {favorites.length === 0 ? (
            <Text style={styles.emptyFavoritesText}>No saved houses yet.</Text>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.favoritesRow}
            >
              {favorites.map((house) => (
                <TouchableOpacity
                  key={house.id}
                  style={styles.favoriteCard}
                  onPress={() => navigation.navigate('BoardingHouseDetail', { boardingHouse: house })}
                >
                  <Text style={styles.favoriteName} numberOfLines={1}>
                    {house.name}
                  </Text>
                  <Text style={styles.favoriteLocation} numberOfLines={1}>
                    {house.location}
                  </Text>
                  <View style={styles.favoriteMetaRow}>
                    <Heart size={14} color={colors.primary} />
                    <Text style={styles.favoriteMetaText}>Saved</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </Card>

          <Button
            title={isLoggingOut ? 'Logging out...' : 'Log out'}
            variant="primary"
            onPress={handleLogout}
            disabled={isLoggingOut}
            style={styles.logoutButton}
          />

      </ScrollView>

      <Modal
        visible={isEditModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setEditModalVisible(false)}
          />
          <View style={styles.modalCard}>
            <EditProfileScreen
              onClose={() => setEditModalVisible(false)}
              variant="modal"
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    margin: 'auto'
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 20
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  content: {
    gap: 5,
  },
  profileCard: {
    padding: 20,
    gap: 16,
    position: 'relative',
  },
  avatarAndEditRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  editIconButton: {
    height: 32,
    borderRadius: 10,
    padding: 15,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: colors.white,
    fontSize: 22,
  },
  avatarInfo: {
    flex: 1,
  },
  name: {
    color: colors.gray[900],
    marginBottom: 4,
  },
  caption: {
    color: colors.gray[600],
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.gray[100],
    borderRadius: 12,
    padding: 12,
    gap: 6,
  },
  statValue: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray[600],
  },
  sectionCard: {
    padding: 20,
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionMeta: {
    fontSize: 12,
    color: colors.gray[500],
  },
  sectionRow: {
    flexDirection: 'row',
    width: '100%',
    gap: 5,
  },
  sectionColumn: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  sectionCardHalf: {
    flex: 1,
    minWidth: 0,
  },
  sectionCardFull: {
    flex: undefined,
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoContent: {
    flex: 1,
    minWidth: 0,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.gray[500],
  },
  infoValue: {
    fontSize: 14,
    color: colors.gray[800],
    flexShrink: 1,
    flexWrap: 'wrap',
  },
  favoritesRow: {
    gap: 12,
    paddingBottom: 4,
  },
  favoriteCard: {
    width: 220,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    backgroundColor: colors.gray[50],
    padding: 12,
  },
  favoriteName: {
    fontSize: 14,
    fontFamily: 'Figtree_600SemiBold',
    color: colors.gray[900],
    marginBottom: 4,
  },
  favoriteLocation: {
    fontSize: 12,
    color: colors.gray[600],
    marginBottom: 8,
  },
  favoriteMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  favoriteMetaText: {
    fontSize: 12,
    color: colors.gray[600],
  },
  emptyFavoritesText: {
    fontSize: 13,
    color: colors.gray[500],
  },
  logoutButton: {
    backgroundColor: colors.primary,
    marginHorizontal: 5,
    marginBottom: 20
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalCard: {
    width: '100%',
    maxWidth: 720,
    maxHeight: '85%',
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 24,
    elevation: 8,
  },
});
