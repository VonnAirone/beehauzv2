import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ArrowLeft, User, Mail, Shield, Calendar, Edit3, GraduationCap, MapPin, Phone } from 'lucide-react-native';
import { Card, Button } from '../../../components/common';
import { useUserType } from '../../../context/UserTypeContext';
import { useAuthContext } from '../../../context/AuthContext';
import { TenantStackParamList } from '../../../navigation/types';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

type PersonalInformationScreenNavigationProp = StackNavigationProp<TenantStackParamList, 'PersonalInformation'>;

export const PersonalInformationScreen: React.FC = () => {
  const navigation = useNavigation<PersonalInformationScreenNavigationProp>();
  const { userType } = useUserType();
  const { user } = useAuthContext();

  const displayName = user?.fullName || user?.email?.split('@')[0] || 'User';
  const displayEmail = user?.email || 'No email provided';
  const userTypeDisplay = user?.userType === 'owner' ? 'Property Owner' : 'Student/Tenant';
  const memberSince = user?.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
    : 'Recently joined';

  const handleEditProfile = () => {
    navigation.navigate('EditProfile');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color={colors.gray[700]} />
        </TouchableOpacity>
        <Text style={[typography.textStyles.h3, styles.headerTitle]}>Personal Information</Text>
        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Edit3 size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <View style={styles.profileSummary}>
            <View style={styles.avatar}>
              <Text style={[typography.textStyles.h3, styles.avatarText]}>
                {displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[typography.textStyles.h3, styles.name]}>{displayName}</Text>
              <Text style={[typography.textStyles.body, styles.userType]}>{userTypeDisplay}</Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Contact Information</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <User size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Full Name</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>{displayName}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Mail size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Email Address</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>{displayEmail}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Shield size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Account Type</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>{userTypeDisplay}</Text>
            </View>
          </View>

          <View style={styles.sectionDivider} />
          <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Account Details</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Calendar size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Member Since</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>{memberSince}</Text>
            </View>
          </View>

          {/* Phone Number */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Phone size={20} color={colors.primary} />
            </View>
            <View style={styles.infoContent}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Phone Number</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>
                {user?.phone || 'Not provided'}
              </Text>
            </View>
          </View>

          {/* Additional Info for Tenants */}
          {(user?.userType === 'tenant' || userType === 'tenant') && (
            <>
              <View style={styles.sectionDivider} />
              <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Student Information</Text>
            
              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <GraduationCap size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>University</Text>
                  <Text style={[typography.textStyles.body, styles.infoValue]}>
                    {user?.university || 'Not specified'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <GraduationCap size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Year Level</Text>
                  <Text style={[typography.textStyles.body, styles.infoValue]}>
                    {user?.yearLevel || 'Not specified'}
                  </Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Home Address</Text>
                  <Text style={[typography.textStyles.body, styles.infoValue]}>
                    {user?.address || 'Not provided'}
                  </Text>
                </View>
              </View>
            </>
          )}

          {/* Empty State Message */}
          {(!user?.phone && !user?.university && !user?.yearLevel && !user?.address) && (
            <>
              <View style={styles.sectionDivider} />
              <View style={styles.emptyState}>
                <Text style={[typography.textStyles.body, styles.emptyStateText]}>
                  Complete your profile to help property owners connect with you better.
                </Text>
                <Button
                  title="Complete Profile"
                  style={styles.completeProfileButton}
                  onPress={handleEditProfile}
                />
              </View>
            </>
          )}
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    color: colors.gray[900],
    fontFamily: 'Figtree_600SemiBold',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  card: {
    padding: 20,
    marginBottom: 16,
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: colors.white,
    fontSize: 20,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    color: colors.gray[900],
    marginBottom: 4,
  },
  userType: {
    color: colors.gray[600],
  },
  sectionTitle: {
    color: colors.gray[900],
    marginBottom: 16,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: colors.gray[200],
    marginVertical: 10,
    marginHorizontal: -20,
  },
  infoIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    color: colors.gray[500],
    marginBottom: 2,
  },
  infoValue: {
    color: colors.gray[900],
  },
  editButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  emptyStateText: {
    color: colors.gray[600],
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  completeProfileButton: {
    paddingHorizontal: 24,
  },
});