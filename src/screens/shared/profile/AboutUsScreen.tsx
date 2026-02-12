import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Building2, Users, Calendar, Heart, Home, Mail, MapPin } from 'lucide-react-native';
import { Card, SubPageHeader } from '../../../components/common';
import { typography } from '../../../styles/typography';
import { colors } from '../../../styles/colors';

export const AboutUsScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <SubPageHeader title="About Us" />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Beehauz Logo/Brand Section */}
        <Card style={styles.card}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <Home size={48} color={colors.primary} />
            </View>
            <Text style={[typography.textStyles.h2, styles.brandName]}>Beehauz</Text>
            <Text style={[typography.textStyles.body, styles.brandTagline]}>
              Find your home away from home
            </Text>
          </View>
        </Card>

        {/* About Beehauz */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Building2 size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>About Beehauz</Text>
          </View>

          <Text style={[typography.textStyles.body, styles.description]}>
            Beehauz is a student-focused platform that bridges the gap between students looking for quality boarding house accommodations and property owners who want to reach the right tenants.
          </Text>

          <Text style={[typography.textStyles.body, styles.description]}>
            We make it easy for students to search, compare, and book verified boarding houses near their universities. For property owners, Beehauz provides tools to manage listings, handle booking requests, and keep track of tenants — all in one place.
          </Text>
        </Card>

        {/* What We Offer */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Users size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>What We Offer</Text>
          </View>

          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>For Students</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              {'\u2022'} Search and compare boarding houses near your school{'\n'}
              {'\u2022'} View property details, pricing, and locations on an interactive map{'\n'}
              {'\u2022'} Submit booking requests directly to property owners{'\n'}
              {'\u2022'} Save your favorite properties for easy access{'\n'}
              {'\u2022'} Filter by accreditation, price range, and distance
            </Text>
          </View>

          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>For Property Owners</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              {'\u2022'} List and manage your boarding house properties{'\n'}
              {'\u2022'} Receive and respond to booking requests{'\n'}
              {'\u2022'} Track tenant information and payment status{'\n'}
              {'\u2022'} Get real-time notifications for new inquiries{'\n'}
              {'\u2022'} Reach students actively searching for accommodations
            </Text>
          </View>
        </Card>

        {/* Company Information */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Calendar size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Company Information</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Founded</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>March 2025</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Headquarters</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>Antique, Philippines</Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
            <View style={styles.infoItem}>
              <Text style={[typography.textStyles.bodySmall, styles.infoLabel]}>Industry</Text>
              <Text style={[typography.textStyles.body, styles.infoValue]}>Student Services & Technology</Text>
            </View>
          </View>
        </Card>

        {/* Mission & Vision */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Heart size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Our Mission & Vision</Text>
          </View>

          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>Mission</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              To provide a reliable and easy-to-use platform that connects students with safe, quality boarding house accommodations while empowering property owners with tools to manage their business effectively.
            </Text>
          </View>

          <View style={styles.missionSection}>
            <Text style={[typography.textStyles.h4, styles.subSectionTitle]}>Vision</Text>
            <Text style={[typography.textStyles.body, styles.description]}>
              To become the leading student accommodation platform in the Philippines, ensuring every student has access to a comfortable and affordable place to stay during their academic journey.
            </Text>
          </View>
        </Card>

        {/* Contact Us */}
        <Card style={styles.card}>
          <View style={styles.sectionHeader}>
            <Mail size={24} color={colors.primary} />
            <Text style={[typography.textStyles.h4, styles.sectionTitle]}>Contact Us</Text>
          </View>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('mailto:beehauzofficial@gmail.com')}
            activeOpacity={0.6}
          >
            <Mail size={16} color={colors.gray[500]} />
            <Text style={[typography.textStyles.body, styles.contactText]}>villasoraironevonn@gmail.com</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.contactRow}
            onPress={() => Linking.openURL('https://www.facebook.com/profile.php?id=61587907074569')}
            activeOpacity={0.6}
          >
            <Building2 size={16} color={colors.gray[500]} />
            <Text style={[typography.textStyles.body, styles.contactText]}>facebook.com/beehauz</Text>
          </TouchableOpacity>

          <View style={styles.contactRow}>
            <MapPin size={16} color={colors.gray[500]} />
            <Text style={[typography.textStyles.body, styles.contactText]}>Antique, Philippines</Text>
          </View>
        </Card>

        <Text style={styles.versionText}>Beehauz v1.0</Text>
        <View style={{ height: 32 }} />
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
    paddingVertical: 20,
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
    margin: 20,
    marginBottom: 16,
  },
  brandSection: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  brandName: {
    color: colors.gray[900],
    marginBottom: 8,
    textAlign: 'center',
  },
  brandTagline: {
    color: colors.gray[600],
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: colors.gray[900],
  },
  description: {
    color: colors.gray[700],
    lineHeight: 24,
    marginBottom: 16,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  contactText: {
    color: colors.gray[700],
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.gray[400],
    marginTop: 8,
    marginBottom: 16,
  },
  infoRow: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
    paddingVertical: 12,
  },
  infoItem: {
    flexDirection: 'column',
  },
  infoLabel: {
    color: colors.gray[500],
    marginBottom: 4,
  },
  infoValue: {
    color: colors.gray[900],
  },
  missionSection: {
    marginBottom: 20,
  },
  subSectionTitle: {
    color: colors.gray[800],
    marginBottom: 8,
  },
});